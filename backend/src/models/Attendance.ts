import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  deviceInfo: string;
  barcode: string;
  createdAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['check-in', 'check-out'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: String,
      required: false,
    },
    barcode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
attendanceSchema.index({ userId: 1, timestamp: -1 });
attendanceSchema.index({ timestamp: -1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
