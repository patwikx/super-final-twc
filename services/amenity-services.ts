// services/amenityService.ts
import apiClient from '@/lib/axios';
import { Amenity, RoomTypeAmenity } from '@prisma/client';

export type CreateAmenityData = Omit<Amenity, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateAmenityData = Partial<CreateAmenityData>;

// --- Amenity Functions ---

export const getAmenities = async (businessUnitId: string): Promise<Amenity[]> => {
  try {
    const response = await apiClient.get<Amenity[]>('/amenities', { params: { businessUnitId } });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch amenities:', error);
    throw new Error('Could not fetch amenities.');
  }
};

export const createAmenity = async (data: CreateAmenityData): Promise<Amenity> => {
  try {
    const response = await apiClient.post<Amenity>('/amenities', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create amenity:', error);
    throw new Error('Could not create amenity.');
  }
};

export const updateAmenity = async (id: string, data: UpdateAmenityData): Promise<Amenity> => {
  try {
    const response = await apiClient.patch<Amenity>(`/amenities/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Failed to update amenity ${id}:`, error);
    throw new Error('Could not update amenity.');
  }
};

export const deleteAmenity = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/amenities/${id}`);
  } catch (error) {
    console.error(`Failed to delete amenity ${id}:`, error);
    throw new Error('Could not delete amenity.');
  }
};

// --- Room Type Amenity Relationship Functions ---

export const linkAmenityToRoomType = async (roomTypeId: string, amenityId: string): Promise<RoomTypeAmenity> => {
  try {
    const response = await apiClient.post<RoomTypeAmenity>(`/room-types/${roomTypeId}/amenities`, { amenityId });
    return response.data;
  } catch (error) {
    console.error(`Failed to link amenity ${amenityId} to room type ${roomTypeId}:`, error);
    throw new Error('Could not link amenity.');
  }
};

export const unlinkAmenityFromRoomType = async (roomTypeId: string, amenityId: string): Promise<void> => {
  try {
    await apiClient.delete(`/room-types/${roomTypeId}/amenities/${amenityId}`);
  } catch (error) {
    console.error(`Failed to unlink amenity ${amenityId} from room type ${roomTypeId}:`, error);
    throw new Error('Could not unlink amenity.');
  }
};
