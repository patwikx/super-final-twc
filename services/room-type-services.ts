// services/roomTypeService.ts
import apiClient from '@/lib/axios';
import { RoomType_Model } from '@prisma/client';

export type CreateRoomTypeData = Omit<RoomType_Model, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRoomTypeData = Partial<CreateRoomTypeData>;

/**
 * Fetches all room types for a specific business unit.
 * @param {string} businessUnitId - The ID of the business unit.
 */
export const getRoomTypes = async (businessUnitId: string): Promise<RoomType_Model[]> => {
  try {
    const response = await apiClient.get<RoomType_Model[]>('/room-types', {
      params: { businessUnitId },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch room types:', error);
    throw new Error('Could not fetch room types.');
  }
};

/**
 * Fetches a single room type by its ID.
 */
export const getRoomTypeById = async (id: string): Promise<RoomType_Model> => {
  try {
    const response = await apiClient.get<RoomType_Model>(`/room-types/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch room type ${id}:`, error);
    throw new Error('Could not fetch room type.');
  }
};

/**
 * Creates a new room type.
 */
export const createRoomType = async (data: CreateRoomTypeData): Promise<RoomType_Model> => {
  try {
    const response = await apiClient.post<RoomType_Model>('/room-types', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create room type:', error);
    throw new Error('Could not create room type.');
  }
};

/**
 * Updates an existing room type.
 */
export const updateRoomType = async (id: string, data: UpdateRoomTypeData): Promise<RoomType_Model> => {
  try {
    const response = await apiClient.patch<RoomType_Model>(`/room-types/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update room type ${id}:`, error);
    throw new Error('Could not update room type.');
  }
};

/**
 * Deletes a room type by its ID.
 */
export const deleteRoomType = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/room-types/${id}`);
  } catch (error) {
    console.error(`Failed to delete room type ${id}:`, error);
    throw new Error('Could not delete room type.');
  }
};
