// services/serviceRequestService.ts
import apiClient from '@/lib/axios';
import { ServiceRequest } from '@prisma/client';

export type CreateServiceRequestData = Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'assignedAt' | 'startedAt' | 'completedAt'>;
export type UpdateServiceRequestData = Partial<Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'serviceId' | 'roomId' | 'guestId'>>;

/**
 * Fetches all service requests.
 */
export const getServiceRequests = async (): Promise<ServiceRequest[]> => {
    try {
        const response = await apiClient.get<ServiceRequest[]>('/service-requests');
        return response.data;
    } catch (error) {
        console.error('Failed to fetch service requests:', error);
        throw new Error('Could not fetch service requests.');
    }
};

/**
 * Creates a new service request.
 */
export const createServiceRequest = async (data: CreateServiceRequestData): Promise<ServiceRequest> => {
    try {
        const response = await apiClient.post<ServiceRequest>('/service-requests', data);
        return response.data;
    } catch (error) {
        console.error('Failed to create service request:', error);
        throw new Error('Could not create service request.');
    }
};

/**
 * Updates an existing service request.
 */
export const updateServiceRequest = async (id: string, data: UpdateServiceRequestData): Promise<ServiceRequest> => {
    try {
        const response = await apiClient.patch<ServiceRequest>(`/service-requests/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update service request ${id}:`, error);
        throw new Error('Could not update service request.');
    }
};

/**
 * Deletes a service request by its ID.
 */
export const deleteServiceRequest = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/service-requests/${id}`);
    } catch (error) {
        console.error(`Failed to delete service request ${id}:`, error);
        throw new Error('Could not delete service request.');
    }
};
