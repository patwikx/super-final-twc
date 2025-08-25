"use client"

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  X,
  Loader2,
  User,
  Plus,
  Minus,
  Info,
  ChevronRight,
  Home,
  Building2,
  Bed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types
interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  specialRequests: string;
  guestNotes: string;
}

interface PricingBreakdown {
  subtotal: number;
  nights: number;
  taxes: number;
  serviceFee: number;
  totalAmount: number;
}

type PaymentStatus = 'checking' | 'paid' | 'failed' | 'cancelled' | 'pending';

interface PaymentStatusModalProps {
  isOpen: boolean;
  status: PaymentStatus;
  onClose: () => void;
  confirmationNumber?: string;
}

interface PaymentModalState {
  isOpen: boolean;
  status: PaymentStatus;
  confirmationNumber?: string;
}

interface RoomBookingPageProps {
  property: {
    id: string;
    displayName: string;
    slug: string;
    checkInTime?: string;
    checkOutTime?: string;
    cancellationHours?: number;
    primaryCurrency?: string;
    location?: string;
    description?: string;
  };
  roomType: {
    id: string;
    displayName: string;
    maxOccupancy: number;
    maxAdults: number;
    maxChildren: number;
    baseRate: number;
    description?: string;
    amenities?: string[];
    size?: string;
  };
}

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
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
  reservationId?: string;
  confirmationNumber?: string;
  message?: string;
  paymentDetails?: {
    amount: number;
    currency: string;
    method: string;
    provider: string;
    processedAt?: string;
  };
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({ 
  isOpen, 
  status, 
  onClose, 
  confirmationNumber 
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer for showing elapsed time during processing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && (status === 'checking' || status === 'pending')) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'checking':
      case 'pending':
        return {
          icon: Loader2,
          title: 'Processing Payment',
          message: `Please wait while we verify your payment...${timeElapsed > 30 ? ` (${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')})` : ''}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          spinning: true
        };
      case 'paid':
        return {
          icon: CheckCircle,
          title: 'Payment Successful!',
          message: `Your reservation has been confirmed. Confirmation number: ${confirmationNumber}`,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          spinning: false
        };
      case 'failed':
        return {
          icon: AlertCircle,
          title: 'Payment Failed',
          message: 'There was an issue processing your payment. Please try again or contact support if the problem persists.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          spinning: false
        };
      case 'cancelled':
        return {
          icon: X,
          title: 'Payment Cancelled',
          message: 'Your payment was cancelled. You can try booking again.',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          spinning: false
        };
      default:
        return {
          icon: AlertCircle,
          title: 'Unknown Status',
          message: 'An unexpected error occurred.',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          spinning: false
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <IconComponent 
                className={`w-8 h-8 ${config.color} ${config.spinning ? 'animate-spin' : ''}`} 
              />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {config.title}
            </h3>
            
            <p className="text-gray-600 text-center mb-6">
              {config.message}
            </p>
            
            {(status === 'paid' || status === 'failed' || status === 'cancelled') && (
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {status === 'paid' ? 'View Booking Details' : 'Try Again'}
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export function RoomBookingPage({ property, roomType }: RoomBookingPageProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    guestNotes: ''
  });

  const [pricing, setPricing] = useState<PricingBreakdown>({
    subtotal: 0,
    nights: 0,
    taxes: 0,
    serviceFee: 0,
    totalAmount: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    isOpen: false,
    status: 'checking',
    confirmationNumber: undefined
  });

  // For tracking payment session
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  
  // Polling control
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  // Calculate pricing when dates change
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const subtotal = roomType.baseRate * nights;
        const taxes = subtotal * 0.12; // 12% VAT
        const serviceFee = subtotal * 0.05; // 5% service fee
        const totalAmount = subtotal + taxes + serviceFee;

        setPricing({
          subtotal,
          nights,
          taxes,
          serviceFee,
          totalAmount
        });
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, roomType.baseRate]);

  // Poll payment status with timeout and retry limits
  const checkPaymentStatus = useCallback(async (sessionId: string, resId?: string): Promise<boolean> => {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);
      if (resId) params.append('reservationId', resId);
      
      const response = await fetch(`/api/admin/operations/reservations/payment-status?${params.toString()}`);
      
      if (!response.ok) {
        console.error('Payment status check failed:', response.status, response.statusText);
        throw new Error('Failed to check payment status');
      }

      const data: PaymentStatusResponse = await response.json();
      
      console.log('Payment status response:', data);
      
      switch (data.status) {
        case 'paid':
          setPaymentModal(prev => ({
            ...prev,
            status: 'paid',
            confirmationNumber: data.confirmationNumber
          }));
          return true; // Stop polling
        case 'failed':
          setPaymentModal(prev => ({
            ...prev,
            status: 'failed'
          }));
          return true; // Stop polling
        case 'cancelled':
          setPaymentModal(prev => ({
            ...prev,
            status: 'cancelled'
          }));
          return true; // Stop polling
        case 'pending':
          setPaymentModal(prev => ({
            ...prev,
            status: 'pending'
          }));
          return false; // Continue polling
        default:
          return false; // Continue polling
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      
      // Don't immediately fail on network errors, but increment attempts
      setPollingAttempts(prev => prev + 1);
      
      // If we've had too many consecutive errors, mark as failed
      if (pollingAttempts >= 5) {
        setPaymentModal(prev => ({
          ...prev,
          status: 'failed'
        }));
        return true; // Stop polling
      }
      
      return false; // Continue polling for network errors
    }
  }, [pollingAttempts]);

  // Payment status polling effect with timeout
  useEffect(() => {
    if ((!paymentSessionId && !reservationId) || 
        (paymentModal.status !== 'checking' && paymentModal.status !== 'pending')) {
      return;
    }

    console.log('Starting payment status polling...', { paymentSessionId, reservationId });

    // Reset polling state
    setPollingAttempts(0);
    setPollingStartTime(Date.now());

    const pollInterval = setInterval(async () => {
      const currentTime = Date.now();
      const startTime = pollingStartTime || currentTime;
      const elapsedTime = currentTime - startTime;
      
      // Constants for timeout control
      const MAX_POLLING_TIME = 10 * 60 * 1000; // 10 minutes
      const MAX_POLLING_ATTEMPTS = 200; // Maximum number of attempts
      
      // Check if we've exceeded time limit or attempt limit
      if (elapsedTime > MAX_POLLING_TIME || pollingAttempts >= MAX_POLLING_ATTEMPTS) {
        console.log('Payment polling timeout reached', { 
          elapsedTime: elapsedTime / 1000, 
          attempts: pollingAttempts 
        });
        
        setPaymentModal(prev => ({
          ...prev,
          status: 'failed'
        }));
        clearInterval(pollInterval);
        return;
      }
      
      // Increment attempt counter
      setPollingAttempts(prev => prev + 1);
      
      const shouldStop = await checkPaymentStatus(
        paymentSessionId || '', 
        reservationId || undefined
      );
      
      if (shouldStop) {
        clearInterval(pollInterval);
        console.log('Payment status polling stopped');
      }
    }, 3000); // Poll every 3 seconds

    // Initial check
    checkPaymentStatus(paymentSessionId || '', reservationId || undefined);

    // Cleanup interval on unmount or when conditions change
    return () => {
      console.log('Cleaning up payment status polling');
      clearInterval(pollInterval);
    };
  }, [paymentSessionId, reservationId, paymentModal.status, checkPaymentStatus, pollingAttempts, pollingStartTime]);

  const handleInputChange = useCallback((field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleGuestCountChange = useCallback((type: 'adults' | 'children', increment: boolean) => {
    setFormData(prev => {
      const currentCount = prev[type];
      const newCount = increment ? currentCount + 1 : Math.max(type === 'adults' ? 1 : 0, currentCount - 1);
      
      // Validate against room limits
      if (type === 'adults' && newCount > roomType.maxAdults) return prev;
      if (type === 'children' && newCount > roomType.maxChildren) return prev;
      if ((prev.adults + prev.children) >= roomType.maxOccupancy && increment) return prev;
      
      return {
        ...prev,
        [type]: newCount
      };
    });
  }, [roomType.maxAdults, roomType.maxChildren, roomType.maxOccupancy]);

  const validateForm = useCallback((): string[] => {
    const errors: string[] = [];
    
    if (!formData.firstName.trim()) errors.push('First name is required');
    if (!formData.lastName.trim()) errors.push('Last name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.checkInDate) errors.push('Check-in date is required');
    if (!formData.checkOutDate) errors.push('Check-out date is required');
    
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) errors.push('Check-in date cannot be in the past');
    if (checkOut <= checkIn) errors.push('Check-out date must be after check-in date');
    
    const totalGuests = formData.adults + formData.children;
    if (totalGuests > roomType.maxOccupancy) {
      errors.push(`Maximum ${roomType.maxOccupancy} guests allowed`);
    }
    
    return errors;
  }, [formData, roomType.maxOccupancy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        ...formData,
        checkInDate: new Date(formData.checkInDate).toISOString(),
        checkOutDate: new Date(formData.checkOutDate).toISOString(),
        businessUnitId: property.id,
        roomTypeId: roomType.id,
        ...pricing
      };

      console.log('Creating reservation with payment...', bookingData);

      const response = await fetch('/api/admin/operations/reservations/create-with-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData: CreateReservationError = await response.json();
        throw new Error(errorData.error || 'Failed to create reservation');
      }

      const result: CreateReservationResponse = await response.json();
      
      console.log('Reservation created successfully:', result);
      
      // Store payment session ID and reservation ID for status polling
      setPaymentSessionId(result.paymentSessionId);
      setReservationId(result.reservationId);
      
      // Open PayMongo checkout in new tab
      window.open(result.checkoutUrl, '_blank');
      
      // Show payment status modal and start polling
      setPaymentModal({
        isOpen: true,
        status: 'checking',
        confirmationNumber: undefined
      });

      // Reset polling state
      setPollingAttempts(0);
      setPollingStartTime(Date.now());

    } catch (error) {
      console.error('Booking error:', error);
      alert(error instanceof Error ? error.message : 'Failed to create reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setPaymentModal(prev => ({ ...prev, isOpen: false }));
    
    if (paymentModal.status === 'paid') {
      // Redirect to success page or booking details
      window.location.href = `/booking/success?confirmation=${paymentModal.confirmationNumber}`;
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-[1400px]">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <div className="hover:text-blue-600 transition-colors flex items-center">
            <Home className="w-4 h-4 mr-1" />
            Home
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className="hover:text-blue-600 transition-colors">
            Properties
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className="hover:text-blue-600 transition-colors">
            {property.displayName}
          </div>
          <ChevronRight className="w-4 h-4" />
          <div className="hover:text-blue-600 transition-colors">
            {roomType.displayName}
          </div>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Book Room</span>
        </nav>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.displayName} • {roomType.displayName}</h1>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form - Left Side */}
          <div className="lg:col-span-2">
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-8"
            >
              {/* Combined Booking Details */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Guest Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Guest Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Stay Dates Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Stay Dates
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-in Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                        min={minDate}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Check-out Date *
                      </label>
                      <Input
                        type="date"
                        value={formData.checkOutDate}
                        onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                        min={formData.checkInDate || minDate}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Guests Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Guests
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Adults</div>
                        <div className="text-sm text-gray-600">Age 13+</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          onClick={() => handleGuestCountChange('adults', false)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{formData.adults}</span>
                        <Button
                          type="button"
                          onClick={() => handleGuestCountChange('adults', true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">Children</div>
                        <div className="text-sm text-gray-600">Age 0-12</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          onClick={() => handleGuestCountChange('children', false)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{formData.children}</span>
                        <Button
                          type="button"
                          onClick={() => handleGuestCountChange('children', true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-50 rounded-lg flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                      Maximum {roomType.maxOccupancy} guests allowed for this room type. 
                      Adults: {roomType.maxAdults} max, Children: {roomType.maxChildren} max.
                    </p>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Special Requests (Optional)
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        value={formData.specialRequests}
                        onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any special requests for your stay?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        value={formData.guestNotes}
                        onChange={(e) => handleInputChange('guestNotes', e.target.value)}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Any additional notes or comments?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.form>
          </div>

          {/* Booking Summary - Right Side */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 sticky top-8 min-h-[500px]"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h3>

              {/* Property & Room Details */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {property && roomType && formData.checkInDate && formData.checkOutDate ? (
                  <>
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        {property.displayName}
                      </h4>
                      {property.location && (
                        <p className="text-sm text-gray-600 ml-6">{property.location}</p>
                      )}
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 flex items-center gap-2">
                        <Bed className="w-4 h-4 text-blue-500" />
                        {roomType.displayName}
                      </h5>
                      {roomType.size && (
                        <p className="text-sm text-gray-600 ml-6">{roomType.size}</p>
                      )}
                      {roomType.description && (
                        <p className="text-xs text-gray-500 ml-6 mt-1">{roomType.description}</p>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">
                          {new Date(formData.checkInDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">
                          {new Date(formData.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nights:</span>
                        <span className="font-medium">{pricing.nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">
                          {formData.adults} adult{formData.adults > 1 ? 's' : ''}
                          {formData.children > 0 && `, ${formData.children} child${formData.children > 1 ? 'ren' : ''}`}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-base font-medium">Please fill up the booking details</p>
                    <p className="text-xs mt-1 text-gray-400">Your summary will appear here once details are complete.</p>
                  </div>
                )}
              </div>

              {/* Pricing Breakdown */}
              {pricing.nights > 0 && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ₱{roomType.baseRate.toLocaleString()} × {pricing.nights} night{pricing.nights > 1 ? 's' : ''}
                    </span>
                    <span className="font-medium">₱{pricing.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & fees (12%)</span>
                    <span className="font-medium">₱{pricing.taxes.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service fee (5%)</span>
                    <span className="font-medium">₱{pricing.serviceFee.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-xl text-blue-600">
                        ₱{pricing.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6 mt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.checkInDate || !formData.checkOutDate}
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Payment
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Free Cancellation</span>
                  </div>
                </div>
              </div>

              {/* Room Amenities */}
              {roomType?.amenities && roomType.amenities.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Room Amenities</h4>
                  <div className="space-y-1">
                    {roomType.amenities.slice(0, 5).map((amenity, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {amenity}
                      </div>
                    ))}
                    {roomType.amenities.length > 5 && (
                      <p className="text-xs text-gray-500">
                        +{roomType.amenities.length - 5} more amenities
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Policies */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <Clock className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>
                    Free cancellation up to {property?.cancellationHours || 24} hours before check-in
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <Shield className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                  <span>Secure payment processing with multiple payment options</span>
                </div>

                <div className="flex items-start gap-2">
                  <AlertCircle className="w-3 h-3 mt-0.5 text-orange-600 flex-shrink-0" />
                  <span>
                    Check-in: {property?.checkInTime || '3:00 PM'}, 
                    Check-out: {property?.checkOutTime || '12:00 PM'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Status Modal */}
      <PaymentStatusModal
        isOpen={paymentModal.isOpen}
        status={paymentModal.status}
        onClose={handleModalClose}
        confirmationNumber={paymentModal.confirmationNumber}
      />
    </div>
  );
}