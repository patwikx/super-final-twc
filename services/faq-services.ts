// services/faqService.ts
import apiClient from '@/lib/axios';
import { FAQ } from '@prisma/client';

export type CreateFAQData = Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFAQData = Partial<CreateFAQData>;

/**
 * Fetches all FAQs from the API.
 */
export const getFAQs = async (): Promise<FAQ[]> => {
  try {
    const response = await apiClient.get<FAQ[]>('/faqs');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch FAQs:', error);
    throw new Error('Could not fetch FAQs.');
  }
};

/**
 * Fetches a single FAQ by its ID.
 */
export const getFAQById = async (id: string): Promise<FAQ> => {
  try {
    const response = await apiClient.get<FAQ>(`/faqs/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch FAQ ${id}:`, error);
    throw new Error('Could not fetch FAQ.');
  }
};

/**
 * Creates a new FAQ.
 */
export const createFAQ = async (data: CreateFAQData): Promise<FAQ> => {
  try {
    const response = await apiClient.post<FAQ>('/faqs', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create FAQ:', error);
    throw new Error('Could not create FAQ.');
  }
};

/**
 * Updates an existing FAQ.
 */
export const updateFAQ = async (id: string, data: UpdateFAQData): Promise<FAQ> => {
  try {
    const response = await apiClient.patch<FAQ>(`/faqs/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update FAQ ${id}:`, error);
    throw new Error('Could not update FAQ.');
  }
};

/**
 * Deletes a FAQ by its ID.
 */
export const deleteFAQ = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/faqs/${id}`);
  } catch (error) {
    console.error(`Failed to delete FAQ ${id}:`, error);
    throw new Error('Could not delete FAQ.');
  }
};