// services/businessUnitService.ts
import apiClient from '@/lib/axios';
import { BusinessUnit } from '@prisma/client';

// Define the precise type for creating a BusinessUnit, including Decimal and nullable fields
export type CreateBusinessUnitPrismaData = Omit<BusinessUnit, 'id' | 'createdAt' | 'updatedAt'> & {
  latitude:  number | null;
  longitude: number | null;
  taxRate: number | null;
  serviceFeeRate: number | null;
  description: string | null;
  shortDescription: string | null;
  longDescription: string | null;
  address: string | null;
  state: string | null;
  postalCode: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  secondaryCurrency: string | null;
  logo: string | null;
  favicon: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  heroImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  createdBy: string | null;
};

// Define a type for the data needed to update a Business Unit.
export type UpdateBusinessUnitData = Partial<CreateBusinessUnitPrismaData>;

/**
 * Fetches all business units from the API.
 * @returns {Promise<BusinessUnit[]>} A promise that resolves to an array of business units.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getBusinessUnits = async (): Promise<BusinessUnit[]> => {
  try {
    const response = await apiClient.get<BusinessUnit[]>('/business-units');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch business units:', error);
    throw new Error('Could not fetch business units. Please try again later.');
  }
};

/**
 * Fetches a single business unit by its ID from the API.
 * @param {string} id - The ID of the business unit to fetch.
 * @returns {Promise<BusinessUnit>} A promise that resolves to the business unit.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getBusinessUnitById = async (id: string): Promise<BusinessUnit> => {
  try {
    const response = await apiClient.get<BusinessUnit>(`/business-units/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch business unit with id ${id}:`, error);
    throw new Error('Could not fetch business unit. Please try again later.');
  }
};

/**
 * Creates a new business unit.
 * @param {CreateBusinessUnitPrismaData} data - The data for the new business unit.
 * @returns {Promise<BusinessUnit>} A promise that resolves to the newly created business unit.
 * @throws {Error} Throws an error if the API request fails.
 */
export const createBusinessUnit = async (data: CreateBusinessUnitPrismaData): Promise<BusinessUnit> => {
  try {
    const response = await apiClient.post<BusinessUnit>('/business-units', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create business unit:', error);
    throw new Error('Could not create business unit. Please try again later.');
  }
};

/**
 * Updates an existing business unit.
 * @param {string} id - The ID of the business unit to update.
 * @param {UpdateBusinessUnitData} data - The data to update.
 * @returns {Promise<BusinessUnit>} A promise that resolves to the updated business unit.
 * @throws {Error} Throws an error if the API request fails.
 */
export const updateBusinessUnit = async (id: string, data: UpdateBusinessUnitData): Promise<BusinessUnit> => {
    try {
        const response = await apiClient.patch<BusinessUnit>(`/business-units/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Failed to update business unit with id ${id}:`, error);
        throw new Error('Could not update business unit. Please try again later.');
    }
};

/**
 * Deletes a business unit by its ID.
 * @param {string} id - The ID of the business unit to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 * @throws {Error} Throws an error if the API request fails.
 */
export const deleteBusinessUnit = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/business-units/${id}`);
    } catch (error) {
        console.error(`Failed to delete business unit with id ${id}:`, error);
        throw new Error('Could not delete business unit. Please try again later.');
    }
};