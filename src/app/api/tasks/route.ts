import connectToDatabase from "@/lib/mongodb";
import Task, { ITask } from "@/models/Task";
import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function GET(request) {
  await connectToDatabase();
  const tasks: ITask[] = await Task.find({});
  return NextResponse.json(tasks, { status: 200 });
}

// To handle a POST request to /api
export async function POST(request) {
  const form = await request.json();
  console.log('adding new task.', form)
  await connectToDatabase();
  const newTask = await Task.create(form);
  return NextResponse.json(newTask, { status: 200 });
}
