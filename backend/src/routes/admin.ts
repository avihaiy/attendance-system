import express, { Response } from 'express';
import { User } from '../models/User';
import { Attendance } from '../models/Attendance';
import { AuthRequest, adminMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all employees
router.get('/employees', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all attendance reports
router.get('/reports', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, userId } = req.query;

    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const reports = await Attendance.find(filter)
      .populate('userId', 'name email phone')
      .sort({ timestamp: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add new employee
router.post('/employee', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, barcode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      role: 'employee',
      barcode: barcode || email,
    });

    await user.save();

    res.status(201).json({
      message: 'Employee added successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        barcode: user.barcode,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/employee/:id', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/statistics', adminMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const todayReports = await Attendance.countDocuments({
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const presentToday = await Attendance.distinct('userId', {
      type: 'check-in',
      timestamp: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      totalEmployees,
      todayReports,
      presentToday: presentToday.length,
      absentToday: totalEmployees - presentToday.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
