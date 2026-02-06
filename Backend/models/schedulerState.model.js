import mongoose from 'mongoose';

const schedulerStateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    lastRunAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('SchedulerState', schedulerStateSchema);
