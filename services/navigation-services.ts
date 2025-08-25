// services/navigationService.ts
import apiClient from '@/lib/axios';
import { NavigationMenu, NavigationItem } from '@prisma/client';

// Types for creating/updating menus
export type CreateNavigationMenuData = Omit<NavigationMenu, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNavigationMenuData = Partial<CreateNavigationMenuData>;

// Types for creating/updating menu items
export type CreateNavigationItemData = Omit<NavigationItem, 'id' | 'menuId' | 'createdAt' | 'updatedAt'>;
export type UpdateNavigationItemData = Partial<CreateNavigationItemData>;

// --- Menu Functions ---

export const getNavigationMenus = async (): Promise<NavigationMenu[]> => {
  const response = await apiClient.get<NavigationMenu[]>('/navigation');
  return response.data;
};

export const getNavigationMenuById = async (id: string): Promise<NavigationMenu & { items: NavigationItem[] }> => {
  const response = await apiClient.get<NavigationMenu & { items: NavigationItem[] }>(`/navigation/${id}`);
  return response.data;
};

export const createNavigationMenu = async (data: CreateNavigationMenuData): Promise<NavigationMenu> => {
  const response = await apiClient.post<NavigationMenu>('/navigation', data);
  return response.data;
};

export const updateNavigationMenu = async (id: string, data: UpdateNavigationMenuData): Promise<NavigationMenu> => {
  const response = await apiClient.patch<NavigationMenu>(`/navigation/${id}`, data);
  return response.data;
};

export const deleteNavigationMenu = async (id: string): Promise<void> => {
  await apiClient.delete(`/navigation/${id}`);
};

// --- Menu Item Functions ---

export const addNavigationItem = async (menuId: string, data: CreateNavigationItemData): Promise<NavigationItem> => {
  const response = await apiClient.post<NavigationItem>(`/navigation/${menuId}/items`, data);
  return response.data;
};

export const updateNavigationItem = async (itemId: string, data: UpdateNavigationItemData): Promise<NavigationItem> => {
  const response = await apiClient.patch<NavigationItem>(`/navigation/items/${itemId}`, data);
  return response.data;
};

export const deleteNavigationItem = async (itemId: string): Promise<void> => {
  await apiClient.delete(`/navigation/items/${itemId}`);
};
