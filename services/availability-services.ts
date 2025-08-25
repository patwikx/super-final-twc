// services/availabilityService.ts
import apiClient from '@/lib/axios';
import { RoomType_Model } from '@prisma/client';

// Type for the availability query parameters
export interface AvailabilityParams {
  businessUnitId: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children?: number;
}

// Type for the response, which includes the room type data plus the number of available rooms
export type AvailableRoomType = RoomType_Model & {
  availableCount: number;
};

/**
 * Checks for available room types based on the provided criteria.
 * @param {AvailabilityParams} params - The criteria for checking availability.
 * @returns {Promise<AvailableRoomType[]>} A promise that resolves to an array of available room types.
 */
export const checkAvailability = async (params: AvailabilityParams): Promise<AvailableRoomType[]> => {
  try {
    const response = await apiClient.get<AvailableRoomType[]>('/availability', {
      params: {
        ...params,
        checkIn: params.checkIn.toISOString(),
        checkOut: params.checkOut.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to check availability:', error);
    throw new Error('Could not check room availability. Please try again later.');
  }
};
