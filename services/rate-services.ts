// services/rateService.ts
import apiClient from '@/lib/axios';
import { RoomRate } from '@prisma/client';

export type CreateRateData = Omit<RoomRate, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRateData = Partial<CreateRateData>;

/**
 * Fetches all rates for a specific room type.
 * @param {string} roomTypeId - The ID of the room type.
 */
export const getRates = async (roomTypeId: string): Promise<RoomRate[]> => {
  try {
    const response = await apiClient.get<RoomRate[]>('/rates', { params: { roomTypeId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rates:', error);
    throw new Error('Could not fetch rates.');
  }
};

/**
 * Creates a new room rate.
 */
export const createRate = async (data: CreateRateData): Promise<RoomRate> => {
  try {
    const response = await apiClient.post<RoomRate>('/rates', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create rate:', error);
    throw new Error('Could not create rate.');
  }
};

/**
 * Updates an existing room rate.
 */
export const updateRate = async (id: string, data: UpdateRateData): Promise<RoomRate> => {
  try {
    const response = await apiClient.patch<RoomRate>(`/rates/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update rate ${id}:`, error);
    throw new Error('Could not update rate.');
  }
};

/**
 * Deletes a room rate by its ID.
 */
export const deleteRate = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/rates/${id}`);
  } catch (error) {
    console.error(`Failed to delete rate ${id}:`, error);
    throw new Error('Could not delete rate.');
  }
};
