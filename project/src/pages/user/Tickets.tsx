import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, Filter, Download, QrCode } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketCode: string;
  status: 'valid' | 'used' | 'expired' | 'refunded';
  purchaseDate: string;
}

const mockTickets: UserTicket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    eventDate: '2024-06-15',
    eventTime: '09:00 AM - 06:00 PM',
    eventLocation: 'Convention Center, New York',
    ticketCode: 'TECH24-001',
    status: 'valid',
    purchaseDate: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'Summer Music Festival',
    eventDate: '2024-07-20',
    eventTime: '12:00 PM - 11:00 PM',
    eventLocation: 'Central Park, New York',
    ticketCode: 'SMF24-001',
    status: 'valid',
    purchaseDate: '2024-01-20T15:45:00Z',
  },
  {
    id: '3',
    eventId: '3',
    eventTitle: 'Food & Wine Expo',
    eventDate: '2024-08-10',
    eventTime: '11:00 AM - 08:00 PM',
    eventLocation: 'Expo Center, Chicago',
    ticketCode: 'FWE24-001',
    status: 'valid',
    purchaseDate: '2024-01-25T09:15:00Z',
  },
];

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: '',
  });

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTickets(mockTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API with filters
    const filteredTickets = mockTickets.filter(ticket => {
      const matchesSearch = !filters.search || 
        ticket.eventTitle.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticketCode.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.status || ticket.status === filters.status;
      const matchesDate = !filters.date || ticket.eventDate === filters.date;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    setTickets(filteredTickets);
  };

  const handleDownloadQR = (ticket: UserTicket) => {
    const canvas = document.getElementById(`qr-code-${ticket.id}`) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticket.ticketCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          My Tickets
        </h1>
        <Link to="/">
          <Button>
            Browse Events
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by event name or ticket code"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              icon={<Search size={18} />}
              className="flex-grow"
            />
            
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'valid', label: 'Valid' },
                { value: 'used', label: 'Used' },
                { value: 'expired', label: 'Expired' },
                { value: 'refunded', label: 'Refunded' },
              ]}
              className="md:w-48"
            />
            
            <Input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="md:w-48"
            />
            
            <Button type="submit">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-600 mb-6">
              {filters.search || filters.status || filters.date
                ? 'Try adjusting your filters to see more results.'
                : 'You haven\'t purchased any tickets yet. Start exploring events and secure your spot!'}
            </p>
            <Link to="/">
              <Button>
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {tickets.map(ticket => (
            <Card key={ticket.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {ticket.eventTitle}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ticket #{ticket.ticketCode}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'valid'
                          ? 'bg-success-100 text-success-800'
                          : ticket.status === 'used'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(ticket.eventDate)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2" />
                        {ticket.eventTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {ticket.eventLocation}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      Purchased on {formatDate(ticket.purchaseDate)}
                    </div>
                  </div>

                  <div className="md:w-1/3 bg-gray-50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-200">
                    <div className="mb-4">
                      <QRCode
                        id={`qr-code-${ticket.id}`}
                        value={ticket.ticketCode}
                        size={150}
                        level="H"
                        includeMargin
                      />
                    </div>
                    <div className="space-y-2 w-full">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDownloadQR(ticket)}
                      >
                        <Download size={18} className="mr-2" />
                        Download QR
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(ticket.ticketCode);
                          toast.success('Ticket code copied to clipboard!');
                        }}
                      >
                        Copy Code
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;