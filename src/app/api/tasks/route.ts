import connectToDatabase from "@/lib/mongodb";
import Task, { ITask } from "@/models/Task";
import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const uid = searchParams.get('uid');
  // console.log('get list for user id: ', id)
  await connectToDatabase();
  const tasks: ITask[] = await Task.find({userId: uid});
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
