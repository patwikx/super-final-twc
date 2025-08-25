// services/stayService.ts
import apiClient from '@/lib/axios';
import { Stay } from '@prisma/client';

/**
 * Checks in a guest for a given reservation.
 * @param {string} reservationId - The ID of the reservation to check in.
 * @returns {Promise<Stay>} A promise that resolves to the new stay record.
 */
export const checkIn = async (reservationId: string): Promise<Stay> => {
  try {
    const response = await apiClient.post<Stay>(`/reservations/${reservationId}/check-in`);
    return response.data;
  } catch (error) {
    console.error(`Failed to check in reservation ${reservationId}:`, error);
    throw new Error('Could not process check-in.');
  }
};

/**
 * Checks out a guest for a given stay.
 * @param {string} stayId - The ID of the stay to check out.
 * @returns {Promise<Stay>} A promise that resolves to the updated stay record.
 */
export const checkOut = async (stayId: string): Promise<Stay> => {
  try {
    const response = await apiClient.post<Stay>(`/stays/${stayId}/check-out`);
    return response.data;
  } catch (error) {
    console.error(`Failed to check out stay ${stayId}:`, error);
    throw new Error('Could not process check-out.');
  }
};

/**
 * Fetches all currently active stays for a business unit.
 * @param {string} businessUnitId - The ID of the business unit.
 */
export const getActiveStays = async (businessUnitId: string): Promise<Stay[]> => {
  try {
    const response = await apiClient.get<Stay[]>('/stays', { params: { businessUnitId, status: 'active' } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch active stays:', error);
    throw new Error('Could not fetch active stays.');
  }
};
