import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { eventsAPI, ticketsAPI, paymentsAPI, Event, Payment } from '../services/api';
import { Calendar, MapPin, Users, DollarSign, CreditCard, Smartphone, QrCode } from 'lucide-react';

interface TicketPurchaseForm {
  quantity: number;
  phoneNumber: string;
  paymentType: 'momo' | 'ussd';
}

const TicketPurchase: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TicketPurchaseForm>({
    defaultValues: {
      quantity: 1,
      phoneNumber: user?.phone || '',
      paymentType: 'momo'
    }
  });

  const quantity = watch('quantity');
  const paymentType = watch('paymentType');

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const eventData = await eventsAPI.getEventById(eventId!);
      setEvent(eventData);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      toast.error('Failed to load event details');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TicketPurchaseForm) => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase tickets');
      navigate('/login');
      return;
    }

    if (!event) {
      toast.error('Event not found');
      return;
    }

    const availableTickets = event.max_tickets - event.sold_tickets;
    if (data.quantity > availableTickets) {
      toast.error(`Only ${availableTickets} tickets available`);
      return;
    }

    setPurchasing(true);
    try {
      // Create ticket first
      const ticket = await ticketsAPI.createTicket({
        event_id: eventId!,
        quantity: data.quantity
      });

      // Initiate payment
      const paymentResponse = await paymentsAPI.initiatePayment({
        event_id: eventId!,
        quantity: data.quantity,
        phone_number: data.phoneNumber,
        payment_type: data.paymentType
      });

      setPayment(paymentResponse.payment);

      if (data.paymentType === 'momo' && paymentResponse.momo) {
        toast.success('Payment initiated! Check your phone for MoMo prompt');
        // In a real app, you might want to redirect to a payment status page
        navigate(`/tickets/${ticket.id}`);
      } else {
        toast.success('Ticket created! You will receive an SMS with details');
        navigate(`/tickets/${ticket.id}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to purchase ticket';
      toast.error(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableTickets = () => {
    if (!event) return 0;
    return event.max_tickets - event.sold_tickets;
  };

  const calculateTotal = () => {
    if (!event) return 0;
    return event.price * quantity;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/events')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Purchase Tickets</h1>
            
            {/* Event Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.date)}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {getAvailableTickets()} tickets available
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${event.price} per ticket
                </div>
              </div>
            </div>

            {/* Event Image */}
            {event.image_url && (
              <div className="mb-6">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Purchase Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Ticket Details</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tickets
                </label>
                <select
                  {...register('quantity', {
                    required: 'Please select quantity',
                    min: { value: 1, message: 'Minimum 1 ticket' },
                    max: { value: getAvailableTickets(), message: `Maximum ${getAvailableTickets()} tickets` }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {Array.from({ length: Math.min(10, getAvailableTickets()) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num} ticket{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
                {errors.quantity && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  {...register('phoneNumber', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: 'Invalid phone number'
                    }
                  })}
                  type="tel"
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('paymentType', { required: 'Please select payment method' })}
                      type="radio"
                      value="momo"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Mobile Money (MoMo)</div>
                        <div className="text-sm text-gray-500">Pay with MTN Mobile Money</div>
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      {...register('paymentType', { required: 'Please select payment method' })}
                      type="radio"
                      value="ussd"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">USSD Payment</div>
                        <div className="text-sm text-gray-500">Pay via USSD menu</div>
                      </div>
                    </div>
                  </label>
                </div>
                {errors.paymentType && (
                  <p className="text-red-500 text-sm mt-1">{errors.paymentType.message}</p>
                )}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Price per ticket:</span>
                  <span className="text-sm text-gray-900">${event.price}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Quantity:</span>
                  <span className="text-sm text-gray-900">{quantity}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                type="submit"
                disabled={purchasing || !isAuthenticated}
                className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : !isAuthenticated ? (
                  'Login to Purchase'
                ) : (
                  'Purchase Tickets'
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-sm text-gray-600 text-center">
                  You need to be logged in to purchase tickets.{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Login here
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPurchase; 