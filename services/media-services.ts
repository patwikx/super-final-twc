// services/mediaService.ts
import apiClient from '@/lib/axios';
import { MediaItem } from '@prisma/client';

// Define a type for the data needed to update a MediaItem's metadata.
export type UpdateMediaData = Partial<Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'filename' | 'originalName' | 'mimeType' | 'size' | 'url' | 'uploaderId'>>;

/**
 * Fetches all media items from the API.
 */
export const getMediaItems = async (): Promise<MediaItem[]> => {
  try {
    const response = await apiClient.get<MediaItem[]>('/media');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch media items:', error);
    throw new Error('Could not fetch media items. Please try again later.');
  }
};

/**
 * Uploads a new file to the media library.
 * @param {File} file - The file to upload.
 * @param {object} metadata - Additional metadata for the file.
 * @returns {Promise<MediaItem>} A promise that resolves to the new media item.
 */
export const uploadMedia = async (file: File, metadata: { uploaderId: string; altText?: string; title?: string }): Promise<MediaItem> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaderId', metadata.uploaderId);
        if (metadata.altText) formData.append('altText', metadata.altText);
        if (metadata.title) formData.append('title', metadata.title);

        const response = await apiClient.post<MediaItem>('/media', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to upload media:', error);
        throw new Error('Could not upload media. Please try again later.');
    }
};

/**
 * Updates an existing media item's metadata.
 */
export const updateMediaItem = async (id: string, data: UpdateMediaData): Promise<MediaItem> => {
    try {
        const response = await apiClient.patch<MediaItem>(`/media/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update media item with id ${id}:`, error);
        throw new Error('Could not update media item. Please try again later.');
    }
};

/**
 * Deletes a media item by its ID.
 */
export const deleteMediaItem = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/media/${id}`);
    } catch (error) {
        console.error(`Failed to delete media item with id ${id}:`, error);
        throw new Error('Could not delete media item. Please try again later.');
    }
};
