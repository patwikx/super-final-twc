import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma, ServiceCategory, ServiceStatus, TaskPriority } from '@prisma/client'

// Zod schema based on the 'Task' model from your Prisma schema
const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional().nullable(),
  category: z.nativeEnum(ServiceCategory),
  priority: z.nativeEnum(TaskPriority).default('NORMAL'),
  status: z.nativeEnum(ServiceStatus).default('REQUESTED'),
  
  // Relations
  departmentId: z.string().uuid().optional().nullable(),
  roomId: z.string().uuid().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  createdBy: z.string().uuid("Creator ID is required"),
  
  // Dates
  scheduledAt: z.string().datetime({ message: "Invalid scheduled date format" }).optional().nullable(),
  dueAt: z.string().datetime({ message: "Invalid due date format" }).optional().nullable(),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),

  // Durations
  estimatedDuration: z.number().int().optional().nullable(),
  
  // Other fields
  notes: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const where: Prisma.TaskWhereInput = {};
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedTo = searchParams.get('assignedTo');
    const departmentId = searchParams.get('departmentId');

    if (status) where.status = status as ServiceStatus;
    if (priority) where.priority = priority as TaskPriority;
    if (assignedTo) where.assignedTo = assignedTo;
    if (departmentId) where.departmentId = departmentId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        creator: true,
        assignedUser: true,
        room: true,
        department: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch maintenance tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);
    
    const { createdBy, assignedTo, roomId, departmentId, ...restOfData } = validatedData;

    // Prepare data for Prisma create operation
    const dataToCreate: Prisma.TaskCreateInput = {
      ...restOfData,
      creator: {
        connect: { id: createdBy }
      },
      assignedUser: assignedTo ? { connect: { id: assignedTo } } : undefined,
      room: roomId ? { connect: { id: roomId } } : undefined,
      department: departmentId ? { connect: { id: departmentId } } : undefined,
    };
    
    const task = await prisma.task.create({
      data: dataToCreate,
    });
    
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Failed to create task:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create maintenance task' },
      { status: 500 }
    );
  }
}
