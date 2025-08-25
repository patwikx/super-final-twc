// services/offerService.ts
import apiClient from '@/lib/axios';
import { SpecialOffer } from '@prisma/client';

export type CreateOfferData = Omit<SpecialOffer, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'clickCount' | 'bookingCount'>;
export type UpdateOfferData = Partial<CreateOfferData>;

/**
 * Fetches all special offers for a specific business unit.
 * @param {string} businessUnitId - The ID of the business unit.
 */
export const getOffers = async (businessUnitId: string): Promise<SpecialOffer[]> => {
  try {
    const response = await apiClient.get<SpecialOffer[]>('/offers', { params: { businessUnitId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch offers:', error);
    throw new Error('Could not fetch offers.');
  }
};

/**
 * Creates a new special offer.
 */
export const createOffer = async (data: CreateOfferData): Promise<SpecialOffer> => {
  try {
    const response = await apiClient.post<SpecialOffer>('/offers', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create offer:', error);
    throw new Error('Could not create offer.');
  }
};

/**
 * Updates an existing special offer.
 */
export const updateOffer = async (id: string, data: UpdateOfferData): Promise<SpecialOffer> => {
  try {
    const response = await apiClient.patch<SpecialOffer>(`/offers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update offer ${id}:`, error);
    throw new Error('Could not update offer.');
  }
};

/**
 * Deletes a special offer by its ID.
 */
export const deleteOffer = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/offers/${id}`);
  } catch (error) {
    console.error(`Failed to delete offer ${id}:`, error);
    throw new Error('Could not delete offer.');
  }
};
