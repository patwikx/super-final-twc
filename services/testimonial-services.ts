// services/testimonialService.ts
import apiClient from '@/lib/axios';
import { Testimonial } from '@prisma/client';

export type CreateTestimonialData = Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTestimonialData = Partial<CreateTestimonialData>;

/**
 * Fetches all testimonials from the API.
 */
export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await apiClient.get<Testimonial[]>('/testimonials');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch testimonials:', error);
    throw new Error('Could not fetch testimonials.');
  }
};

/**
 * Fetches a single testimonial by its ID.
 */
export const getTestimonialById = async (id: string): Promise<Testimonial> => {
  try {
    const response = await apiClient.get<Testimonial>(`/testimonials/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch testimonial ${id}:`, error);
    throw new Error('Could not fetch testimonial.');
  }
};

/**
 * Creates a new testimonial.
 */
export const createTestimonial = async (data: CreateTestimonialData): Promise<Testimonial> => {
  try {
    const response = await apiClient.post<Testimonial>('/testimonials', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create testimonial:', error);
    throw new Error('Could not create testimonial.');
  }
};

/**
 * Updates an existing testimonial.
 */
export const updateTestimonial = async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
  try {
    const response = await apiClient.patch<Testimonial>(`/testimonials/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update testimonial ${id}:`, error);
    throw new Error('Could not update testimonial.');
  }
};

/**
 * Deletes a testimonial by its ID.
 */
export const deleteTestimonial = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/testimonials/${id}`);
  } catch (error) {
    console.error(`Failed to delete testimonial ${id}:`, error);
    throw new Error('Could not delete testimonial.');
  }
};