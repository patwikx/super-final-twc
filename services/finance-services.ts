// services/financeService.ts
import apiClient from '@/lib/axios';
import { Charge, Payment } from '@prisma/client';

export type CreateChargeData = Omit<Charge, 'id' | 'createdAt' | 'updatedAt' | 'stayId' | 'chargedAt' | 'posted' | 'postedAt'>;
export type CreatePaymentData = Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'reservationId' | 'status' | 'transactionDate' | 'processedAt' | 'providerResponse'>;

/**
 * Fetches all charges for a specific stay.
 * @param {string} stayId - The ID of the stay.
 */
export const getChargesForStay = async (stayId: string): Promise<Charge[]> => {
    try {
        const response = await apiClient.get<Charge[]>(`/stays/${stayId}/charges`);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch charges for stay ${stayId}:`, error);
        throw new Error('Could not fetch charges.');
    }
};

/**
 * Adds a new charge to a stay's folio.
 * @param {string} stayId - The ID of the stay.
 * @param {CreateChargeData} data - The charge details.
 */
export const addChargeToStay = async (stayId: string, data: CreateChargeData): Promise<Charge> => {
    try {
        const response = await apiClient.post<Charge>(`/stays/${stayId}/charges`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to add charge to stay ${stayId}:`, error);
        throw new Error('Could not add charge.');
    }
};

/**
 * Records a payment for a reservation.
 * @param {string} reservationId - The ID of the reservation.
 * @param {CreatePaymentData} data - The payment details.
 */
export const recordPayment = async (reservationId: string, data: CreatePaymentData): Promise<Payment> => {
    try {
        const response = await apiClient.post<Payment>(`/reservations/${reservationId}/payments`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to record payment for reservation ${reservationId}:`, error);
        throw new Error('Could not record payment.');
    }
};
