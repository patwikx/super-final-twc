// services/guestService.ts
import apiClient from '@/lib/axios';
import { Guest } from '@prisma/client';

export type CreateGuestData = Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateGuestData = Partial<CreateGuestData>;

/**
 * Fetches/searches for guests in a specific business unit.
 * @param {string} businessUnitId - The ID of the business unit.
 * @param {string} [searchTerm] - Optional search term for name or email.
 */
export const getGuests = async (businessUnitId: string, searchTerm?: string): Promise<Guest[]> => {
  try {
    const response = await apiClient.get<Guest[]>('/guests', {
      params: { businessUnitId, search: searchTerm },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch guests:', error);
    throw new Error('Could not fetch guests.');
  }
};

/**
 * Fetches a single guest by their ID.
 */
export const getGuestById = async (id: string): Promise<Guest> => {
  try {
    const response = await apiClient.get<Guest>(`/guests/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch guest ${id}:`, error);
    throw new Error('Could not fetch guest.');
  }
};

/**
 * Creates a new guest.
 */
export const createGuest = async (data: CreateGuestData): Promise<Guest> => {
  try {
    const response = await apiClient.post<Guest>('/guests', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create guest:', error);
    throw new Error('Could not create guest.');
  }
};

/**
 * Updates an existing guest.
 */
export const updateGuest = async (id: string, data: UpdateGuestData): Promise<Guest> => {
  try {
    const response = await apiClient.patch<Guest>(`/guests/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update guest ${id}:`, error);
    throw new Error('Could not update guest.');
  }
};

/**
 * Deletes a guest by their ID.
 */
export const deleteGuest = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/guests/${id}`);
  } catch (error) {
    console.error(`Failed to delete guest ${id}:`, error);
    throw new Error('Could not delete guest.');
  }
};
