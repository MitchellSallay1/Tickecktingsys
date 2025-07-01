import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Users, DollarSign, Clock, MapPin, Wifi, WifiOff } from 'lucide-react';
import Card, { CardContent, CardHeader } from './Card';

interface LiveEventData {
  eventId: string;
  ticketsSold: number;
  revenue: number;
  attendees: number;
  lastUpdated: string;
  isLive: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

interface LiveEventTrackerProps {
  eventId: string;
  eventTitle: string;
  onDataUpdate?: (data: LiveEventData) => void;
}

const LiveEventTracker: React.FC<LiveEventTrackerProps> = ({
  eventId,
  eventTitle,
  onDataUpdate
}) => {
  const [liveData, setLiveData] = useState<LiveEventData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, [eventId]);

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:8080/ws?event_id=${eventId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Subscribe to event updates
        ws.send(JSON.stringify({
          type: 'subscribe_event',
          event_id: eventId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        scheduleReconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('reconnecting');
      };

    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      scheduleReconnect();
    }
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setConnectionStatus('reconnecting');
      connectWebSocket();
    }, 5000); // Reconnect after 5 seconds
  };

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'live_event_update':
        const eventData: LiveEventData = {
          eventId: data.data.event_id,
          ticketsSold: data.data.tickets_sold,
          revenue: data.data.revenue,
          attendees: data.data.attendees,
          lastUpdated: new Date().toISOString(),
          isLive: true,
          connectionStatus: 'connected'
        };
        setLiveData(eventData);
        onDataUpdate?.(eventData);
        break;
        
      case 'notification':
        // Handle notifications
        console.log('Received notification:', data.data);
        break;
        
      case 'pong':
        // Handle ping/pong for connection health
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'reconnecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  if (!liveData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Event Tracker</h3>
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className="text-sm text-gray-500">{getConnectionText()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-t-4 border-primary-600 border-solid rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Connecting to live data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Live Event Tracker</h3>
            <p className="text-sm text-gray-500">{eventTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className={`text-sm ${
              connectionStatus === 'connected' ? 'text-green-600' :
              connectionStatus === 'reconnecting' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {getConnectionText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Tickets Sold */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Tickets Sold</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {liveData.ticketsSold.toLocaleString()}
            </div>
          </div>

          {/* Revenue */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(liveData.revenue)}
            </div>
          </div>

          {/* Attendees */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-purple-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Attendees</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {liveData.attendees.toLocaleString()}
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-gray-600">Last Update</span>
            </div>
            <div className="text-sm font-mono text-gray-900">
              {formatTime(liveData.lastUpdated)}
            </div>
          </div>
        </div>

        {/* Live Indicator */}
        {liveData.isLive && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 bg-red-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">LIVE</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveEventTracker; 