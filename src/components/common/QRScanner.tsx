import React, { useState, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { X, Camera, CameraOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from './Button';
import { toast } from 'react-toastify';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => Promise<{ valid: boolean; message: string; ticketData?: any }>;
  title?: string;
  eventId?: string;
}

interface ScanResult {
  valid: boolean;
  message: string;
  ticketData?: any;
}

const QRScanner: React.FC<QRScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan QR Code',
  eventId
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (result: any) => {
    if (result && !isProcessing) {
      setIsProcessing(true);
      setError(null);
      
      try {
        const scanData = result?.text;
        if (!scanData) {
          setError('Invalid QR code format');
          return;
        }

        // Parse the QR code data
        let ticketData;
        try {
          ticketData = JSON.parse(scanData);
        } catch (e) {
          // If it's not JSON, treat it as a simple ticket code
          ticketData = { ticketCode: scanData };
        }

        // Validate the ticket
        const validationResult = await onScan(scanData);
        setScanResult(validationResult);

        if (validationResult.valid) {
          toast.success(validationResult.message);
          // Auto-close after successful scan
          setTimeout(() => {
            onClose();
            setScanResult(null);
          }, 2000);
        } else {
          toast.error(validationResult.message);
        }
      } catch (error) {
        console.error('Scan error:', error);
        setError('Failed to process QR code');
        toast.error('Failed to process QR code');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    setError('Failed to access camera. Please check permissions.');
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 py-6">
            {error ? (
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={resetScanner}>
                  Try Again
                </Button>
              </div>
            ) : scanResult ? (
              <div className="text-center">
                {scanResult.valid ? (
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {scanResult.valid ? 'Check-in Successful!' : 'Check-in Failed'}
                </h3>
                <p className="text-gray-600 mb-4">{scanResult.message}</p>
                {scanResult.ticketData && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                    <h4 className="font-medium text-gray-900 mb-2">Ticket Details:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Ticket ID:</strong> {scanResult.ticketData.ticketNumber || scanResult.ticketData.ticketCode}</p>
                      {scanResult.ticketData.holderName && (
                        <p><strong>Holder:</strong> {scanResult.ticketData.holderName}</p>
                      )}
                      {scanResult.ticketData.type && (
                        <p><strong>Type:</strong> {scanResult.ticketData.type}</p>
                      )}
                    </div>
                  </div>
                )}
                <Button onClick={resetScanner}>
                  Scan Another Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Position the QR code within the frame to scan
                  </p>
                </div>

                {/* Scanner */}
                <div className="relative">
                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                    <QrReader
                      constraints={{ facingMode: 'environment' }}
                      onResult={handleScan}
                      className="w-full"
                      videoStyle={{ width: '100%' }}
                    />
                  </div>
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-48 h-48 border-2 border-primary-500 rounded-lg">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-500"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary-500"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary-500"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-500"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {isProcessing && (
                  <div className="text-center">
                    <div className="inline-flex items-center">
                      <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-gray-600">Processing...</span>
                    </div>
                  </div>
                )}

                {/* Manual entry option */}
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Having trouble scanning?{' '}
                    <button
                      onClick={() => {
                        // TODO: Implement manual entry modal
                        toast.info('Manual entry feature coming soon');
                      }}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Enter ticket code manually
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 