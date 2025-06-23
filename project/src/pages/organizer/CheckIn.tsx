import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  MapPin,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEventByIdApi } from '../../services/eventService';
import { validateTicketApi } from '../../services/ticketService';
import { Event } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import QRScanner from '../../components/common/QRScanner';
import { toast } from 'react-toastify';

interface CheckInStats {
  totalTickets: number;
  checkedIn: number;
  remaining: number;
  percentage: number;
}

interface CheckInRecord {
  id: string;
  ticketNumber: string;
  holderName: string;
  checkInTime: string;
  status: 'success' | 'failed';
  message: string;
}

const CheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState<CheckInStats>({
    totalTickets: 0,
    checkedIn: 0,
    remaining: 0,
    percentage: 0
  });
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      try {
        const eventData = await getEventByIdApi(eventId);
        setEvent(eventData);
        
        // Mock stats - in a real app, fetch from API
        setStats({
          totalTickets: 1000,
          checkedIn: 750,
          remaining: 250,
          percentage: 75
        });
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const handleScan = async (scanData: string): Promise<{ valid: boolean; message: string; ticketData?: any }> => {
    try {
      // Parse the scanned data
      let ticketData;
      try {
        ticketData = JSON.parse(scanData);
      } catch (e) {
        ticketData = { ticketCode: scanData };
      }

      // Validate the ticket
      const validationResult = await validateTicketApi(
        ticketData.ticketId || ticketData.ticketCode,
        eventId!
      );

      if (validationResult.valid) {
        // Add to recent check-ins
        const checkInRecord: CheckInRecord = {
          id: Date.now().toString(),
          ticketNumber: ticketData.ticketNumber || ticketData.ticketCode,
          holderName: ticketData.holderName || 'Unknown',
          checkInTime: new Date().toISOString(),
          status: 'success',
          message: validationResult.message
        };

        setRecentCheckIns(prev => [checkInRecord, ...prev.slice(0, 9)]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          checkedIn: prev.checkedIn + 1,
          remaining: prev.remaining - 1,
          percentage: Math.round(((prev.checkedIn + 1) / prev.totalTickets) * 100)
        }));

        return {
          valid: true,
          message: 'Check-in successful!',
          ticketData
        };
      } else {
        // Add failed check-in to recent records
        const checkInRecord: CheckInRecord = {
          id: Date.now().toString(),
          ticketNumber: ticketData.ticketNumber || ticketData.ticketCode,
          holderName: ticketData.holderName || 'Unknown',
          checkInTime: new Date().toISOString(),
          status: 'failed',
          message: validationResult.message
        };

        setRecentCheckIns(prev => [checkInRecord, ...prev.slice(0, 9)]);

        return {
          valid: false,
          message: validationResult.message,
          ticketData
        };
      }
    } catch (error) {
      console.error('Check-in error:', error);
      return {
        valid: false,
        message: 'Failed to process check-in'
      };
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Event</h3>
        <p className="text-gray-500 mb-4">{error || 'Event not found'}</p>
        <Button onClick={() => navigate('/organizer/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/organizer/events')}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Check-in Station</h1>
            <p className="text-gray-600">{event.title}</p>
          </div>
        </div>
        <Button
          onClick={() => setShowScanner(true)}
          className="flex items-center"
        >
          <QrCode size={18} className="mr-2" />
          Start Scanning
        </Button>
      </div>

      {/* Event Info */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <Calendar size={20} className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Event Date</p>
                <p className="font-medium">{new Date(event.startDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Clock size={20} className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Event Time</p>
                <p className="font-medium">
                  {new Date(event.startDate).toLocaleTimeString()} - {new Date(event.endDate).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin size={20} className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{event.location}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalTickets}</h3>
            <p className="text-gray-600">Total Tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.checkedIn}</h3>
            <p className="text-gray-600">Checked In</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.remaining}</h3>
            <p className="text-gray-600">Remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 relative">
              <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - stats.percentage / 100)}`}
                  className="text-primary-600"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {stats.percentage}%
              </span>
            </div>
            <p className="text-gray-600">Check-in Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Check-ins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Check-ins</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecentCheckIns([])}
            >
              <RefreshCw size={16} className="mr-2" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentCheckIns.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No check-ins yet. Start scanning to see activity.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    checkIn.status === 'success' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {checkIn.status === 'success' ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {checkIn.holderName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Ticket #{checkIn.ticketNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatTime(checkIn.checkInTime)}
                    </p>
                    <p className={`text-xs ${
                      checkIn.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {checkIn.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
        title={`Check-in: ${event.title}`}
        eventId={eventId}
      />
    </div>
  );
};

export default CheckIn; 