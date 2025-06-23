import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Filter, Ticket as TicketIcon, QrCode } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Ticket } from '../../types';
import { toast } from 'react-toastify';

const mockTickets: Ticket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    eventDate: '2024-06-15',
    eventTime: '09:00 AM - 06:00 PM',
    eventLocation: 'Convention Center',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '123-456-7890',
    price: 299.99,
    purchaseDate: '2024-01-15T10:30:00Z',
    status: 'paid',
    ticketNumber: 'TC2024-001',
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'Music Festival',
    eventDate: '2024-07-20',
    eventTime: '12:00 PM - 11:00 PM',
    eventLocation: 'Central Park',
    userId: '2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    price: 149.99,
    purchaseDate: '2024-01-16T14:20:00Z',
    status: 'pending',
    ticketNumber: 'MF2024-001',
  },
];

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    event: '',
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'used', label: 'Used' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTickets(mockTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API with the filters
    const filteredTickets = mockTickets.filter(ticket => {
      const matchesSearch = !filters.search || 
        ticket.ticketNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesEvent = !filters.event || ticket.eventTitle.toLowerCase().includes(filters.event.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesEvent;
    });
    
    setTickets(filteredTickets);
  };

  const handleCancelTicket = async (ticket: Ticket) => {
    try {
      // In a real app, we would call an API to cancel the ticket
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickets(tickets.map(t => 
        t.id === ticket.id ? { ...t, status: 'cancelled' as const } : t
      ));
      toast.success('Ticket cancelled successfully');
    } catch (error) {
      console.error('Error cancelling ticket:', error);
      toast.error('Failed to cancel ticket');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-error-600">
        <AlertCircle className="w-12 h-12 mx-auto text-error-500 mb-2" />
        <h3 className="text-lg font-medium mb-1">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <Button
          onClick={() => {
            // TODO: Navigate to a general check-in page for admin
            toast.info('Admin check-in feature coming soon');
          }}
          className="flex items-center"
        >
          <QrCode size={18} className="mr-2" />
          Check-in Station
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search by ticket number, name, or email..."
                icon={<Search size={18} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/4">
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/4">
              <Input
                type="text"
                placeholder="Filter by event..."
                value={filters.event}
                onChange={(e) => setFilters({ ...filters, event: e.target.value })}
                className="w-full"
              />
            </div>
            
            <Button type="submit">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </form>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Purchase Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <TicketIcon size={20} className="text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.ticketNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(ticket.price)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.eventTitle}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.eventDate} • {ticket.eventTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {ticket.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ticket.userEmail}
                      </div>
                      {ticket.userPhone && (
                        <div className="text-sm text-gray-500">
                          {ticket.userPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${ticket.status === 'paid' ? 'bg-green-100 text-green-800' :
                          ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          ticket.status === 'used' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View ticket details
                          }}
                        >
                          View
                        </Button>
                        {ticket.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-error-600 hover:text-error-700"
                            onClick={() => {
                              setSelectedTicket(ticket);
                              setShowCancelModal(true);
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets; 