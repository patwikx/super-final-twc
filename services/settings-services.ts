// services/settingsService.ts
import apiClient from '@/lib/axios';
import { WebsiteConfiguration } from '@prisma/client';

export type CreateSettingsData = Omit<WebsiteConfiguration, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSettingsData = Partial<CreateSettingsData>;

/**
 * Fetches the website configuration.
 */
export const getSettings = async (): Promise<WebsiteConfiguration | null> => {
  try {
    const response = await apiClient.get<WebsiteConfiguration>('/settings');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    throw new Error('Could not fetch settings.');
  }
};

/**
 * Creates website configuration.
 */
export const createSettings = async (data: CreateSettingsData): Promise<WebsiteConfiguration> => {
  try {
    const response = await apiClient.post<WebsiteConfiguration>('/settings', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create settings:', error);
    throw new Error('Could not create settings.');
  }
};

/**
 * Updates the website configuration.
 */
export const updateSettings = async (data: UpdateSettingsData): Promise<WebsiteConfiguration> => {
  try {
    const response = await apiClient.patch<WebsiteConfiguration>('/settings', data);
    return response.data;
  } catch (error) {
    console.error('Failed to update settings:', error);
    throw new Error('Could not update settings.');
  }
};