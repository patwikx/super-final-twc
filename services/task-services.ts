// services/taskService.ts
import apiClient from '@/lib/axios';
import { Task, ServiceStatus } from '@prisma/client';

export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>;

interface TaskFilters {
    departmentId?: string;
    assignedTo?: string;
    status?: ServiceStatus;
}

/**
 * Fetches tasks with optional filters.
 */
export const getTasks = async (filters: TaskFilters): Promise<Task[]> => {
    try {
        const response = await apiClient.get<Task[]>('/tasks', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        throw new Error('Could not fetch tasks.');
    }
};

/**
 * Creates a new task.
 */
export const createTask = async (data: CreateTaskData): Promise<Task> => {
    try {
        const response = await apiClient.post<Task>('/tasks', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create task:', error);
        throw new Error('Could not create task.');
    }
};

/**
 * Updates an existing task.
 */
export const updateTask = async (id: string, data: UpdateTaskData): Promise<Task> => {
    try {
        const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update task ${id}:`, error);
        throw new Error('Could not update task.');
    }
};

/**
 * Deletes a task by its ID.
 */
export const deleteTask = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/tasks/${id}`);
    } catch (error) {
        console.error(`Failed to delete task ${id}:`, error);
        throw new Error('Could not delete task.');
    }
};
