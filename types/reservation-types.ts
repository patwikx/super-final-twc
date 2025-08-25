// Type definitions

import { PropertyType, RoomType } from "@prisma/client"


export interface BusinessUnit {
  id: string
  name: string
  displayName: string
  propertyType: PropertyType
  createdAt: Date
  updatedAt: Date
}

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface RoomType_Model {
  id: string
  businessUnitId: string
  name: string
  displayName: string
  description?: string
  type: RoomType
  maxOccupancy: number
  maxAdults: number
  maxChildren: number
  maxInfants: number
  bedConfiguration?: string
  roomSize?: string
  hasBalcony: boolean
  hasOceanView: boolean
  hasPoolView: boolean
  hasKitchenette: boolean
  hasLivingArea: boolean
  smokingAllowed: boolean
  petFriendly: boolean
  isAccessible: boolean
  baseRate: string
  extraPersonRate?: string
  extraChildRate?: string
  floorPlan?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Room {
  id: string
  businessUnitId: string
  roomTypeId: string
  roomNumber: string
  roomType: RoomType_Model
  createdAt: Date
  updatedAt: Date
}

export interface RoomAddon {
  name: string
  description?: string
  category?: string
  unitPrice: number
  quantity: number
  totalAmount: number
  isOptional: boolean
  isChargeable: boolean
}
