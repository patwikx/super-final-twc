// services/roomService.ts
import apiClient from '@/lib/axios';
import { Room } from '@prisma/client';

export type CreateRoomData = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRoomData = Partial<CreateRoomData>;

/**
 * Fetches rooms with optional filtering.
 * @param {string} businessUnitId - The ID of the business unit.
 * @param {string} [roomTypeId] - Optional ID of the room type to filter by.
 */
export const getRooms = async (businessUnitId: string, roomTypeId?: string): Promise<Room[]> => {
  try {
    const response = await apiClient.get<Room[]>('/rooms', {
      params: { businessUnitId, roomTypeId },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rooms:', error);
    throw new Error('Could not fetch rooms.');
  }
};

/**
 * Fetches a single room by its ID.
 */
export const getRoomById = async (id: string): Promise<Room> => {
  try {
    const response = await apiClient.get<Room>(`/rooms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch room ${id}:`, error);
    throw new Error('Could not fetch room.');
  }
};

/**
 * Creates a new room.
 */
export const createRoom = async (data: CreateRoomData): Promise<Room> => {
  try {
    const response = await apiClient.post<Room>('/rooms', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create room:', error);
    throw new Error('Could not create room.');
  }
};

/**
 * Updates an existing room.
 */
export const updateRoom = async (id: string, data: UpdateRoomData): Promise<Room> => {
  try {
    const response = await apiClient.patch<Room>(`/rooms/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update room ${id}:`, error);
    throw new Error('Could not update room.');
  }
};

/**
 * Deletes a room by its ID.
 */
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/rooms/${id}`);
  } catch (error) {
    console.error(`Failed to delete room ${id}:`, error);
    throw new Error('Could not delete room.');
  }
};
