import connectToDatabase from "@/lib/mongodb";
import Task, { ITask } from "@/models/Task";
import { NextResponse } from "next/server";

export async function PUT(request) {
  const form = await request.json();

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  console.log('toggling task..', id, form)
  await connectToDatabase();
   const updatedTask: ITask | null = await Task.findByIdAndUpdate(id, form, { new: true });
  return NextResponse.json(updatedTask, { status: 200 });
}



// To handle a Delete request to /api
export async function DELETE(request) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  console.log('deleting task..', id)
  await connectToDatabase();
  await Task.findByIdAndDelete(id);
  return NextResponse.json({}, { status: 200 });
}
