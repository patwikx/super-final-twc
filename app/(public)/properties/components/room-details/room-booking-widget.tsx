"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CreditCard, CheckCircle, Loader2, ExternalLink, X, AlertCircle } from "lucide-react"
import { format, differenceInDays, addDays, isBefore } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"
import axios, { AxiosError } from "axios"
import { BusinessUnit, RoomType_Model, RoomRate } from "@prisma/client"

// Interfaces and Schemas (unchanged)
interface CreateReservationResponse {
  reservationId: string;
  confirmationNumber: string;
  checkoutUrl: string;
  paymentSessionId: string;
}

interface CreateReservationError {
  error: string;
  details?: string;
}

interface PaymentStatusResponse {
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED';
  reservationStatus: string;
  message?: string;
}

const GuestDetailsSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  specialRequests: z.string().optional(),
  guestNotes: z.string().optional(),
});

const BookingDataSchema = z.object({
  checkInDate: z.date({ message: "Check-in date is required" }),
  checkOutDate: z.date({ message: "Check-out date is required" }),
  adults: z.number().min(1, "At least 1 adult is required"),
  children: z.number().min(0),
  businessUnitId: z.string().uuid(),
  roomTypeId: z.string().uuid(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: "Check-out date must be after check-in date",
  path: ["checkOutDate"],
});

const ReservationRequestSchema = GuestDetailsSchema.merge(BookingDataSchema).extend({
  totalAmount: z.number().positive(),
  nights: z.number().positive(),
  subtotal: z.number().positive(),
  taxes: z.number().min(0),
  serviceFee: z.number().min(0),
});

interface RoomBookingWidgetProps {
  property: BusinessUnit & {
    roomTypes?: RoomType_Model[];
  };
  roomType: RoomType_Model & {
    rates: RoomRate[];
    _count: { rooms: number };
    amenities?: Array<{
      amenity: {
        id: string;
        name: string;
        description?: string;
        icon?: string;
      }
    }>;
  };
}

type BookingStep = 'dates' | 'guests' | 'details' | 'summary' | 'booking';

export function RoomBookingWidget({ property, roomType }: RoomBookingWidgetProps) {
  // State Hooks (unchanged)
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [step, setStep] = useState<BookingStep>('dates');
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'SUCCEEDED' | 'FAILED'>('PENDING');
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [reservationId, setReservationId] = useState('');
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [bookingDetails, setBookingDetails] = useState<{
    checkInDate: string;
    checkOutDate: string;
    adults: number;
    children: number;
    nights: number;
    totalAmount: number;
    guestName: string;
    email: string;
    phone: string;
    propertyName: string;
    roomTypeName: string;
  } | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Pricing Calculations (unchanged)
  const currentRate = roomType.rates[0] || { baseRate: roomType.baseRate };
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const subtotal = nights * Number(currentRate.baseRate);
  const taxRate = property.taxRate || 0.12;
  const serviceFeeRate = property.serviceFeeRate || 0.05;
  const taxes = subtotal * taxRate;
  const serviceFee = subtotal * serviceFeeRate;
  const total = subtotal + taxes + serviceFee;

  const cleanup = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (paymentWindow && !paymentWindow.closed) {
      paymentWindow.close();
      setPaymentWindow(null);
    }
  };

  const pollPaymentStatus = async (resId: string) => {
    try {
      const response = await axios.get<PaymentStatusResponse>(`/api/reservations/${resId}/payment-status`);
      const { status } = response.data;
      
      setPaymentStatus(status);
      
      if (status === 'SUCCEEDED' || status === 'FAILED') {
        cleanup();
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
      cleanup(); // Stop polling on error
    }
  };

  // ✅ FIX 1: This useEffect now reliably manages the polling lifecycle.
  useEffect(() => {
    // Only start polling if the modal is open and we have a reservation ID.
    if (showPaymentModal && reservationId) {
      const intervalId = setInterval(() => {
        pollPaymentStatus(reservationId);
      }, 3000);
  
      pollingIntervalRef.current = intervalId;
  
      // React will automatically call this cleanup function when the component
      // unmounts or when the dependencies (showPaymentModal, reservationId) change.
      return () => {
        clearInterval(intervalId);
        pollingIntervalRef.current = null;
      };
    }
  }, [showPaymentModal, reservationId]);

  const resetForm = () => {
    setCheckIn(undefined);
    setCheckOut(undefined);
    setAdults("2");
    setChildren("0");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSpecialRequests("");
    setGuestNotes("");
    setStep('dates');
    setValidationErrors({});
    setBookingDetails(null);
  };

  const handleClosePaymentModal = () => {
    cleanup();
    setShowPaymentModal(false);
    
    if (paymentStatus === 'SUCCEEDED') {
      resetForm();
    }
    
    setPaymentStatus('PENDING');
  };

  const handleModalStateChange = (open: boolean) => {
    if (!open) {
      handleClosePaymentModal();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDateSelect = (date: Date | undefined, type: 'checkIn' | 'checkOut') => {
    setValidationErrors(prev => ({ ...prev, checkInDate: '', checkOutDate: '' }));
    
    if (type === 'checkIn') {
      setCheckIn(date);
      if (date && checkOut && isBefore(checkOut, addDays(date, 1))) {
        setCheckOut(addDays(date, 1));
      }
    } else {
      setCheckOut(date);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const validateStep = (currentStep: BookingStep): boolean => {
    // Your full validation logic remains here...
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      if (step === 'dates') setStep('guests');
      else if (step === 'guests') setStep('details');
      else if (step === 'details') setStep('summary');
      else if (step === 'summary') setStep('booking');
    }
  };

  const prevStep = () => {
    if (step === 'guests') setStep('dates');
    else if (step === 'details') setStep('guests');
    else if (step === 'summary') setStep('details');
    else if (step === 'booking') setStep('summary');
  };

  const handleBooking = async () => {
    if (!validateStep('booking') || !checkIn || !checkOut) {
      return;
    }
    setIsLoading(true);
    
    try {
      const reservationData = {
        firstName, lastName, email, phone, specialRequests, guestNotes,
        checkInDate: checkIn, checkOutDate: checkOut,
        adults: parseInt(adults), children: parseInt(children),
        totalAmount: total, nights, subtotal, taxes, serviceFee,
        businessUnitId: property.id, roomTypeId: roomType.id,
      };

      ReservationRequestSchema.parse(reservationData);
      toast.loading("Creating your reservation...", { id: "booking-process" });

      const response = await axios.post<CreateReservationResponse>('/api/reservations/create-with-payment', {
        ...reservationData,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
      });

      const { reservationId, confirmationNumber, checkoutUrl } = response.data;

      toast.dismiss("booking-process");
      toast.success("Reservation Created!", {
        description: `Confirmation: ${confirmationNumber}. Opening payment window...`
      });
      
      setBookingDetails({
        checkInDate: format(checkIn, "MMMM dd, yyyy"),
        checkOutDate: format(checkOut, "MMMM dd, yyyy"),
        adults: parseInt(adults), children: parseInt(children),
        nights, totalAmount: total, guestName: `${firstName} ${lastName}`,
        email, phone, propertyName: property.displayName || property.name,
        roomTypeName: roomType.displayName || roomType.name,
      });
      
      const newWindow = window.open(checkoutUrl, 'paymongo_payment', 'width=800,height=600');
      
      if (newWindow) {
        setPaymentWindow(newWindow);
        setConfirmationNumber(confirmationNumber);
        
        // These state updates will trigger the useEffect to start polling
        setReservationId(reservationId);
        setShowPaymentModal(true);
      } else {
        toast.error("Popup Blocked", {
          description: "Please allow popups for this site and try again.",
        });
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.dismiss("booking-process");
      const errorMessage = (error instanceof AxiosError && (error.response?.data as CreateReservationError)?.error) 
        || "An unexpected error occurred.";
      toast.error("Booking Failed", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = () => {
    if (bookingDetails) {
      handleClosePaymentModal();
      handleBooking();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const copyConfirmationNumber = () => {
    if (confirmationNumber) {
      navigator.clipboard.writeText(confirmationNumber);
      toast.success("Copied to clipboard!");
    }
  };

  const stepTitles = {
    dates: "Select Dates",
    guests: "Guest Count", 
    details: "Special Requests",
    summary: "Booking Summary",
    booking: "Complete Booking"
  };

  return (
    <>
      <Card className="border-0 shadow-2xl bg-white sticky top-8">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold font-serif text-slate-900">
              Book This Room
            </CardTitle>
            <Badge className="bg-green-100 text-green-800 border-0">
              {roomType._count.rooms} Available
            </Badge>
          </div>
          
          <div className="text-center py-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <div className="text-3xl font-bold text-slate-900">
              ₱{Number(currentRate.baseRate).toLocaleString()}
            </div>
            <div className="text-sm text-slate-600">per night</div>
            <div className="text-xs text-slate-500 mt-1">
              {property.primaryCurrency || 'PHP'} • Taxes included
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            {Object.keys(stepTitles).map((stepKey, index) => (
              <div key={stepKey} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  step === stepKey 
                    ? "bg-amber-500 text-white" 
                    : Object.keys(stepTitles).indexOf(step) > index
                      ? "bg-green-500 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}>
                  {Object.keys(stepTitles).indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < Object.keys(stepTitles).length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-colors duration-300 ${
                    Object.keys(stepTitles).indexOf(step) > index ? "bg-green-500" : "bg-slate-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 text-center mt-4">
            {stepTitles[step as keyof typeof stepTitles]}
          </h3>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {/* All your Step JSX (dates, guests, details, etc.) */}
            {/* This is where your existing step-by-step form UI goes */}
          </AnimatePresence>

          <div className="flex gap-3 pt-4">
            {step !== 'dates' && (
              <Button variant="outline" onClick={prevStep} disabled={isLoading} className="flex-1 h-12">
                Back
              </Button>
            )}
            
            {step !== 'booking' ? (
              <Button onClick={nextStep} className="flex-1 h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                Continue
              </Button>
            ) : (
              <Button onClick={handleBooking} disabled={isLoading} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Complete Booking - ₱{total.toLocaleString()}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ✅ FIX 2: Using the correct handler for onOpenChange */}
      <Dialog open={showPaymentModal} onOpenChange={handleModalStateChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <AnimatePresence mode="wait">
              {paymentStatus === 'PENDING' && (
                <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900">Processing Payment</h3>
                    <p className="text-sm text-slate-600">Please complete your payment in the new window.</p>
                  </div>
                </motion.div>
              )}

              {paymentStatus === 'SUCCEEDED' && (
                <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-green-900">Booking Confirmed!</h3>
                    <p className="text-sm text-slate-600">Your payment was successful. A confirmation email is on its way.</p>
                  </div>
                  {/* Your booking details and copy button JSX here */}
                </motion.div>
              )}

              {paymentStatus === 'FAILED' && (
                <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-6">
                   <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-10 w-10 text-red-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-red-900">Payment Failed</h3>
                    <p className="text-sm text-slate-600">We couldn&apos;t process your payment. Please try again.</p>
                  </div>
                  <Button onClick={handleRetryPayment} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Try Again"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={handleClosePaymentModal}>
              <X className="h-4 w-4 mr-1" />
              {paymentStatus === 'SUCCEEDED' ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
