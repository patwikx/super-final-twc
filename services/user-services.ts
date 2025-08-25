// services/userService.ts
import apiClient from '@/lib/axios';
import { User } from '@prisma/client';

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'lastLoginAt' | 'emailVerifiedAt'> & {
  password: string;
};
export type UpdateUserData = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>>;

/**
 * Fetches all users from the API.
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Could not fetch users.');
  }
};

/**
 * Fetches a single user by their ID.
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user ${id}:`, error);
    throw new Error('Could not fetch user.');
  }
};

/**
 * Creates a new user.
 */
export const createUser = async (data: CreateUserData): Promise<User> => {
  try {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Could not create user.');
  }
};

/**
 * Updates an existing user.
 */
export const updateUser = async (id: string, data: UpdateUserData): Promise<User> => {
  try {
    const response = await apiClient.patch<User>(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    throw new Error('Could not update user.');
  }
};

/**
 * Deletes a user by their ID.
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/users/${id}`);
  } catch (error) {
    console.error(`Failed to delete user ${id}:`, error);
    throw new Error('Could not delete user.');
  }
};