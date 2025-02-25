import { NextApiRequest, NextApiResponse } from 'next';
import connectToDatabase from '../../../lib/mongodb';
import Task, { ITask } from '../../../models/Task';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const updatedTask: ITask | null = await Task.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedTask);
  } else if (req.method === 'DELETE') {
    await Task.findByIdAndDelete(id);
    res.status(204).end();
  }
}
