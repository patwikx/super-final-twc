"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Filter, Calendar as CalendarIcon, Users, Bed } from "lucide-react"
import { format } from "date-fns"

export function RoomsFilter() {
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [roomType, setRoomType] = useState("all")

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
          <Filter className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Find Your Perfect Room</h3>
          <p className="text-sm text-slate-600">Check availability and compare room types</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Check-in Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 justify-start text-left font-normal border-slate-200 hover:border-amber-300"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkIn ? format(checkIn, "MMM dd") : "Check-in"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>

        {/* Check-out Date */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-12 justify-start text-left font-normal border-slate-200 hover:border-amber-300"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {checkOut ? format(checkOut, "MMM dd") : "Check-out"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) => {
                if (date < new Date()) return true;
                if (checkIn && date <= checkIn) return true;
                return false;
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Guests */}
        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Guest</SelectItem>
            <SelectItem value="2">2 Guests</SelectItem>
            <SelectItem value="3">3 Guests</SelectItem>
            <SelectItem value="4">4 Guests</SelectItem>
            <SelectItem value="5">5+ Guests</SelectItem>
          </SelectContent>
        </Select>

        {/* Room Type */}
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger className="h-12">
            <div className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-slate-400" />
              <SelectValue placeholder="Room Type" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="STANDARD">Standard</SelectItem>
            <SelectItem value="DELUXE">Deluxe</SelectItem>
            <SelectItem value="SUITE">Suite</SelectItem>
            <SelectItem value="VILLA">Villa</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Button */}
        <Button 
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 h-12"
        >
          <Search className="h-5 w-5 mr-2" />
          Search
        </Button>
      </div>
    </div>
  )
}