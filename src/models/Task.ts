import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  title: string;
  completed: boolean;
  dueDate: Date;
  priority: 'Low' | 'Medium' | 'High';
  userId: string;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  userId: { type: String, required: false },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
