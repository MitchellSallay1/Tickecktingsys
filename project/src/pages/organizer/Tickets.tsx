import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Edit2, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  XCircle 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { getEventByIdApi } from '../../services/eventService';
import { getEventTicketsApi, cancelTicketApi, refundTicketApi } from '../../services/ticketService';
import { Event, Ticket, FilterParams } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import TicketCard from '../../components/common/TicketCard';
import Modal from '../../components/common/Modal';

// Extended ticket interface for display purposes
interface TicketDisplay extends Ticket {
  ticketNumber: string;
  eventName: string;
  holderName: string;
  holderEmail: string;
  type: string;
  price: {
    amount: number;
    currency: 'LRD' | 'USD';
  };
  checkedInAt?: string;
}

const mockTickets: TicketDisplay[] = [
  {
    id: '1',
    ticketNumber: 'TIX-001',
    eventId: '1',
    eventName: 'Sample Event',
    userId: '1',
    holderName: 'John Doe',
    holderEmail: 'john@example.com',
    ticketType: 'VIP',
    type: 'VIP',
    price: {
      amount: 100,
      currency: 'USD'
    },
    status: 'valid',
    purchaseDate: '2024-03-15T10:00:00Z',
    qrCode: 'qr-code-1'
  },
  {
    id: '2',
    ticketNumber: 'TIX-002',
    eventId: '1',
    eventName: 'Sample Event',
    userId: '2',
    holderName: 'Jane Smith',
    holderEmail: 'jane@example.com',
    ticketType: 'Regular',
    type: 'Regular',
    price: {
      amount: 15000,
      currency: 'LRD'
    },
    status: 'used',
    purchaseDate: '2024-03-14T15:30:00Z',
    qrCode: 'qr-code-2',
    checkedInAt: '2024-03-15T18:45:00Z'
  }
];

const Tickets: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<TicketDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDisplay | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });
  
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'valid', label: 'Valid' },
    { value: 'used', label: 'Used' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      try {
        const eventData = await getEventByIdApi(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      }
    };

    fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    // In a real app, fetch tickets for the specific event
    setTickets(mockTickets);
    setIsLoading(false);
  }, [eventId]);

  const fetchTickets = async () => {
    if (!eventId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getEventTicketsApi(eventId, {
        ...filters,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      
      // Convert API response to display format
      const displayTickets: TicketDisplay[] = response.data.map(ticket => ({
        ...ticket,
        ticketNumber: ticket.id, // Use ID as ticket number for now
        eventName: event?.title || 'Unknown Event',
        holderName: 'Unknown User', // Would come from user service
        holderEmail: 'unknown@example.com',
        type: ticket.ticketType,
        price: {
          amount: 100, // Would come from event pricing
          currency: 'USD'
        }
      }));
      
      setTickets(displayTickets);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchTickets();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters({ ...filters, page: newPage });
    }
  };

  const handleEditTicket = (ticket: TicketDisplay) => {
    setSelectedTicket(ticket);
    setIsEditModalOpen(true);
  };

  const handleCancelTicket = (ticket: TicketDisplay) => {
    setSelectedTicket(ticket);
    setIsCancelModalOpen(true);
  };

  const confirmCancelTicket = async () => {
    if (!selectedTicket) return;
    
    try {
      await cancelTicketApi(selectedTicket.id);
      setTickets(tickets.map(t => 
        t.id === selectedTicket.id ? { ...t, status: 'cancelled' as const } : t
      ));
      toast.success('Ticket cancelled successfully');
      setIsCancelModalOpen(false);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      toast.error('Failed to cancel ticket');
    }
  };

  const handleRefundTicket = async (ticket: TicketDisplay) => {
    try {
      await refundTicketApi(ticket.id);
      setTickets(tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'refunded' as const } : t
      ));
      toast.success('Refund processed successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    }
  };

  const handleUpdateTicket = (field: keyof TicketDisplay, value: string) => {
    if (!selectedTicket) return;
    setSelectedTicket({
      ...selectedTicket,
      [field]: value
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-success-100 text-success-800';
      case 'used':
        return 'bg-primary-100 text-primary-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      case 'refunded':
        return 'bg-warning-100 text-warning-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={16} className="text-success-600" />;
      case 'used':
        return <CheckCircle size={16} className="text-primary-600" />;
      case 'cancelled':
        return <XCircle size={16} className="text-error-600" />;
      case 'refunded':
        return <AlertCircle size={16} className="text-warning-600" />;
      default:
        return null;
    }
  };

  const formatCurrency = (price: { amount: number; currency: 'LRD' | 'USD' }) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(price.amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-error-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tickets</h3>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage tickets for your event
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => {/* Implement export */}}
            className="flex items-center"
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Implement email */}}
            className="flex items-center"
          >
            <Mail size={16} className="mr-2" />
            Email All
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search tickets..."
                icon={<Search size={18} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/4">
              <Select
                value={filters.status}
                onChange={handleStatusChange}
                options={statusOptions}
              />
            </div>
            
            <Button type="submit">
              Search
            </Button>
          </form>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holder
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(ticket.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.holderName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.holderEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditTicket(ticket)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleCancelTicket(ticket)}
                        className="text-error-600 hover:text-error-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Ticket Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Ticket"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Holder Name
            </label>
            <Input
              type="text"
              value={selectedTicket?.holderName || ''}
              onChange={(e) => handleUpdateTicket('holderName', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Holder Email
            </label>
            <Input
              type="email"
              value={selectedTicket?.holderEmail || ''}
              onChange={(e) => handleUpdateTicket('holderEmail', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ticket Type
            </label>
            <Select
              value={selectedTicket?.type || ''}
              onChange={(e) => handleUpdateTicket('type', e.target.value)}
              options={[
                { value: 'VIP', label: 'VIP' },
                { value: 'Regular', label: 'Regular' },
              ]}
              className="mt-1"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => {/* Implement save */}}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Cancel Ticket Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
      >
        <div className="space-y-4">
          <p>Are you sure you want to cancel this ticket?</p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. The ticket holder will be notified and the ticket will be invalidated.
          </p>
          
          {selectedTicket && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{selectedTicket.ticketNumber}</h4>
              <p className="text-sm text-gray-600">
                Holder: {selectedTicket.holderName}
              </p>
              <p className="text-sm text-gray-600">
                Type: {selectedTicket.type}
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsCancelModalOpen(false)}
          >
            No, Keep Ticket
          </Button>
          <Button
            variant="danger"
            onClick={confirmCancelTicket}
          >
            Yes, Cancel Ticket
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Tickets; 