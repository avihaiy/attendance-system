import express, { Response } from 'express';
import { Attendance } from '../models/Attendance';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Create attendance report
router.post('/report', async (req: AuthRequest, res: Response) => {
  try {
    const { type, latitude, longitude, address, imageBase64, barcode, deviceInfo } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Save image
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let imageUrl = '';
    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const fileName = `${userId}_${Date.now()}.jpg`;
      const filePath = path.join(uploadsDir, fileName);

      await sharp(buffer)
        .resize(800, 600, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      imageUrl = `/uploads/${fileName}`;
    }

    // Create attendance record
    const attendance = new Attendance({
      userId,
      type,
      latitude,
      longitude,
      address,
      imageUrl,
      barcode: barcode || user.barcode,
      deviceInfo,
    });

    await attendance.save();

    // Emit real-time update via Socket.IO
    const io = (req as any).io;
    if (io) {
      io.emit('attendance:new', {
        userId,
        type,
        timestamp: attendance.timestamp,
        userName: user.name,
      });
    }

    res.status(201).json({
      message: 'Attendance reported successfully',
      attendance,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get today's reports
router.get('/today', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reports = await Attendance.find({
      userId,
      timestamp: { $gte: today, $lt: tomorrow },
    }).sort({ timestamp: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee reports
router.get('/employee/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const filter: any = { userId: id };

    if (startDate && endDate) {
      filter.timestamp = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const reports = await Attendance.find(filter).sort({ timestamp: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
