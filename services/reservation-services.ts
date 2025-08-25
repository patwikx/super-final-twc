// services/reservationService.ts
import apiClient from '@/lib/axios';
import { Reservation } from '@prisma/client';

export type CreateReservationData = Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'confirmationNumber'> & {
    rooms: {
        roomTypeId: string;
        nights: number;
        rate: number;
        subtotal: number;
    }[];
};
export type UpdateReservationData = Partial<Omit<Reservation, 'id' | 'createdAt' | 'updatedAt' | 'confirmationNumber'>>;


/**
 * Fetches reservations for a specific business unit.
 * @param {string} businessUnitId - The ID of the business unit.
 */
export const getReservations = async (businessUnitId: string): Promise<Reservation[]> => {
  try {
    const response = await apiClient.get<Reservation[]>('/reservations', { params: { businessUnitId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reservations:', error);
    throw new Error('Could not fetch reservations.');
  }
};

/**
 * Fetches a single reservation by its ID.
 */
export const getReservationById = async (id: string): Promise<Reservation> => {
  try {
    const response = await apiClient.get<Reservation>(`/reservations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch reservation ${id}:`, error);
    throw new Error('Could not fetch reservation.');
  }
};

/**
 * Creates a new reservation.
 */
export const createReservation = async (data: CreateReservationData): Promise<Reservation> => {
  try {
    const response = await apiClient.post<Reservation>('/reservations', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create reservation:', error);
    throw new Error('Could not create reservation.');
  }
};

/**
 * Updates an existing reservation.
 */
export const updateReservation = async (id: string, data: UpdateReservationData): Promise<Reservation> => {
  try {
    const response = await apiClient.patch<Reservation>(`/reservations/${id}/edit`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update reservation ${id}:`, error);
    throw new Error('Could not update reservation.');
  }
};

/**
 * Deletes a reservation by its ID.
 */
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/reservations/${id}`);
  } catch (error) {
    console.error(`Failed to delete reservation ${id}:`, error);
    throw new Error('Could not delete reservation.');
  }
};
