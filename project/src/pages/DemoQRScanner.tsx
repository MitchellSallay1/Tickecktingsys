import React, { useState } from 'react';
import { QrCode, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../components/common/QRScanner';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';
import { toast } from 'react-toastify';

const DemoQRScanner: React.FC = () => {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = async (scanData: string): Promise<{ valid: boolean; message: string; ticketData?: any }> => {
    try {
      // Parse the scanned data
      let ticketData;
      try {
        ticketData = JSON.parse(scanData);
      } catch (e) {
        ticketData = { ticketCode: scanData };
      }

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation logic
      const isValid = Math.random() > 0.3; // 70% success rate for demo
      
      if (isValid) {
        return {
          valid: true,
          message: 'Check-in successful! Welcome to the event.',
          ticketData
        };
      } else {
        return {
          valid: false,
          message: 'Invalid ticket or already checked in.',
          ticketData
        };
      }
    } catch (error) {
      console.error('Scan error:', error);
      return {
        valid: false,
        message: 'Failed to process QR code'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QR Scanner Demo</h1>
              <p className="text-gray-600">Test the QR code scanning functionality for event check-in</p>
            </div>
          </div>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardContent>
              <div className="text-center">
                <QrCode className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Event Check-in</h3>
                <p className="text-gray-600 mb-4">
                  Scan QR codes from event tickets to validate and check-in attendees.
                </p>
                <Button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center mx-auto"
                >
                  <QrCode size={18} className="mr-2" />
                  Start Scanning
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Test QR Codes</h3>
                <p className="text-gray-600 mb-4">
                  Use any QR code to test the scanner. Valid tickets will show success, others will show error.
                </p>
                <div className="text-sm text-gray-500">
                  <p>• Point camera at any QR code</p>
                  <p>• Scanner will process the data</p>
                  <p>• See real-time validation results</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Scanner Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📷 Camera Access</h4>
                <p className="text-sm text-gray-600">
                  Automatically requests camera permissions and uses the back camera for optimal scanning.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">⚡ Real-time Processing</h4>
                <p className="text-sm text-gray-600">
                  Instantly validates QR codes and provides immediate feedback on ticket status.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">📊 Check-in Tracking</h4>
                <p className="text-sm text-gray-600">
                  Records successful check-ins and maintains a history of scanned tickets.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR Scanner Modal */}
        <QRScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScan={handleScan}
          title="Demo QR Scanner"
        />
      </div>
    </div>
  );
};

export default DemoQRScanner; 