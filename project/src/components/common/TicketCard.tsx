import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Tag } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format, parseISO } from 'date-fns';
import Card, { CardContent, CardFooter } from './Card';
import { Ticket } from '../../types';
import Button from './Button';

interface TicketCardProps {
  ticket: Ticket;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const [showQR, setShowQR] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'paid':
        return 'bg-success-100 text-success-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      case 'refunded':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCopyTicketId = () => {
    navigator.clipboard.writeText(ticket.ticketNumber);
    alert('Ticket ID copied to clipboard!');
  };

  const handleDownloadQR = () => {
    // Create a canvas and download the QR code
    const canvas = document.createElement('canvas');
    const svg = document.querySelector(`#qr-${ticket.id} svg`) as SVGElement;
    
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.href = dataURL;
          a.download = `ticket-${ticket.ticketNumber}.png`;
          a.click();
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg">{ticket.eventTitle}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeClass(ticket.status)}`}>
                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-gray-400" />
                <span>{formatDate(ticket.eventDate)}</span>
              </div>
              
              <div className="flex items-center">
                <Clock size={16} className="mr-2 text-gray-400" />
                <span>{ticket.eventTime}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={16} className="mr-2 text-gray-400" />
                <span>{ticket.eventLocation}</span>
              </div>
              
              <div className="flex items-center">
                <Tag size={16} className="mr-2 text-gray-400" />
                <span>Ticket #: {ticket.ticketNumber}</span>
              </div>
            </div>
            
            <p className="font-semibold">
              Price: ${ticket.price.toFixed(2)}
            </p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setShowQR(!showQR)}
              >
                {showQR ? 'Hide QR Code' : 'Show QR Code'}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCopyTicketId}
              >
                Copy Ticket ID
              </Button>
            </div>
          </div>
          
          {showQR && (
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg" id={`qr-${ticket.id}`}>
              <QRCodeSVG 
                value={JSON.stringify({
                  ticketId: ticket.id,
                  ticketNumber: ticket.ticketNumber,
                  eventId: ticket.eventId,
                  userId: ticket.userId,
                })}
                size={150}
                level="H"
                includeMargin={true}
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleDownloadQR}
              >
                Download QR
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-gray-500">
        Purchased on {formatDate(ticket.purchaseDate)}
      </CardFooter>
    </Card>
  );
};

export default TicketCard;