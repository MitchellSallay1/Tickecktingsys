import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-toastify';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  defaultCurrency: string;
  ticketFeePercentage: number;
  maxTicketsPerPurchase: number;
  allowGuestCheckout: boolean;
  requirePhoneNumber: boolean;
  maintenanceMode: boolean;
}

const Settings: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Event Ticketing System',
    siteDescription: 'Your one-stop platform for event tickets',
    supportEmail: 'support@eventticketing.com',
    defaultCurrency: 'USD',
    ticketFeePercentage: 2.5,
    maxTicketsPerPurchase: 10,
    allowGuestCheckout: false,
    requirePhoneNumber: true,
    maintenanceMode: false,
  });

  const currencyOptions = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call an API to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
      
      <form onSubmit={handleSubmit}>
        {/* General Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">General Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Site Name"
              name="siteName"
              value={settings.siteName}
              onChange={handleInputChange}
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Description
              </label>
              <textarea
                name="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  siteDescription: e.target.value,
                }))}
                className="block w-full rounded-md shadow-sm border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                rows={3}
              />
            </div>
            
            <Input
              type="email"
              label="Support Email"
              name="supportEmail"
              value={settings.supportEmail}
              onChange={handleInputChange}
              required
            />
            
            <Select
              label="Default Currency"
              name="defaultCurrency"
              value={settings.defaultCurrency}
              onChange={handleSelectChange}
              options={currencyOptions}
            />
          </CardContent>
        </Card>
        
        {/* Ticket Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">Ticket Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="number"
              label="Ticket Fee Percentage"
              name="ticketFeePercentage"
              value={settings.ticketFeePercentage}
              onChange={handleInputChange}
              min={0}
              max={100}
              step={0.1}
              required
            />
            
            <Input
              type="number"
              label="Maximum Tickets Per Purchase"
              name="maxTicketsPerPurchase"
              value={settings.maxTicketsPerPurchase}
              onChange={handleInputChange}
              min={1}
              required
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowGuestCheckout"
                name="allowGuestCheckout"
                checked={settings.allowGuestCheckout}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="allowGuestCheckout" className="text-sm font-medium text-gray-700">
                Allow Guest Checkout
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePhoneNumber"
                name="requirePhoneNumber"
                checked={settings.requirePhoneNumber}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="requirePhoneNumber" className="text-sm font-medium text-gray-700">
                Require Phone Number
              </label>
            </div>
          </CardContent>
        </Card>
        
        {/* System Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-lg font-semibold">System Settings</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="maintenanceMode"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
                Maintenance Mode
              </label>
            </div>
            
            {settings.maintenanceMode && (
              <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800">
                      Warning
                    </h3>
                    <div className="mt-2 text-sm text-warning-700">
                      <p>
                        Enabling maintenance mode will make the site inaccessible to all users except administrators.
                        Make sure to plan maintenance windows during off-peak hours.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center"
          >
            <Save size={18} className="mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 