import React, { useState, useEffect } from 'react';
import {
  Bell,
  CreditCard,
  Palette,
  User,
  Mail,
  Phone,
  Globe,
  Image,
  DollarSign,
  Sliders,
  Save,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-toastify';

interface OrganizerSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    website: string;
    description: string;
    logo: string;
    banner: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newBookingNotification: boolean;
    bookingCancellationNotification: boolean;
    lowTicketAlertThreshold: number;
    dailySalesReport: boolean;
    weeklyAnalyticsReport: boolean;
  };
  payment: {
    paymentMethods: string[];
    defaultCurrency: string;
    bankAccount: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      routingNumber: string;
    };
    autoPayoutThreshold: number;
    payoutSchedule: 'daily' | 'weekly' | 'monthly';
  };
  branding: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    emailTemplate: string;
    ticketTemplate: string;
    customCss: string;
  };
}

const mockSettings: OrganizerSettings = {
  profile: {
    name: 'Tech Events Inc',
    email: 'contact@techevents.com',
    phone: '+1 (555) 123-4567',
    website: 'https://techevents.com',
    description: 'Leading technology conference organizer',
    logo: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
    banner: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    newBookingNotification: true,
    bookingCancellationNotification: true,
    lowTicketAlertThreshold: 20,
    dailySalesReport: true,
    weeklyAnalyticsReport: true,
  },
  payment: {
    paymentMethods: ['stripe', 'paypal'],
    defaultCurrency: 'USD',
    bankAccount: {
      accountName: 'Tech Events Inc',
      accountNumber: '****1234',
      bankName: 'Chase Bank',
      routingNumber: '****5678',
    },
    autoPayoutThreshold: 1000,
    payoutSchedule: 'weekly',
  },
  branding: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1D4ED8',
    fontFamily: 'Inter',
    emailTemplate: 'default',
    ticketTemplate: 'modern',
    customCss: '',
  },
};

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<OrganizerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'payment' | 'branding'>('profile');

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSettings(mockSettings);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (type: 'logo' | 'banner', file: File) => {
    try {
      // In a real app, we would upload the file to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => prev ? {
          ...prev,
          profile: {
            ...prev.profile,
            [type]: reader.result as string,
          },
        } : null);
      };
      reader.readAsDataURL(file);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Organizer Settings
        </h1>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={16} className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent>
              <nav className="space-y-1">
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </button>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'notifications'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <Bell size={16} className="mr-3" />
                  Notifications
                </button>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'payment'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('payment')}
                >
                  <CreditCard size={16} className="mr-3" />
                  Payment
                </button>
                <button
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'branding'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('branding')}
                >
                  <Palette size={16} className="mr-3" />
                  Branding
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Profile Information</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Organization Name"
                      value={settings.profile.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value },
                      })}
                      icon={<User size={18} />}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value },
                      })}
                      icon={<Mail size={18} />}
                    />
                    <Input
                      label="Phone Number"
                      value={settings.profile.phone}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, phone: e.target.value },
                      })}
                      icon={<Phone size={18} />}
                    />
                    <Input
                      label="Website"
                      value={settings.profile.website}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, website: e.target.value },
                      })}
                      icon={<Globe size={18} />}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={settings.profile.description}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, description: e.target.value },
                      })}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo
                      </label>
                      <div className="mt-1 flex items-center">
                        <img
                          src={settings.profile.logo}
                          alt="Logo"
                          className="w-16 h-16 rounded object-cover"
                        />
                        <label className="ml-4 cursor-pointer">
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('logo', file);
                            }}
                          />
                          <Button variant="outline" type="button">
                            <Image size={16} className="mr-2" />
                            Change Logo
                          </Button>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Banner
                      </label>
                      <div className="mt-1 flex items-center">
                        <img
                          src={settings.profile.banner}
                          alt="Banner"
                          className="w-32 h-16 rounded object-cover"
                        />
                        <label className="ml-4 cursor-pointer">
                          <Input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload('banner', file);
                            }}
                          />
                          <Button variant="outline" type="button">
                            <Image size={16} className="mr-2" />
                            Change Banner
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Notification Preferences</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive notifications via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            emailNotifications: e.target.checked,
                          },
                        })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
                        <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications.smsNotifications}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            smsNotifications: e.target.checked,
                          },
                        })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Event Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">New Booking</h4>
                          <p className="text-sm text-gray-500">When someone books a ticket</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.newBookingNotification}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              newBookingNotification: e.target.checked,
                            },
                          })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Booking Cancellation</h4>
                          <p className="text-sm text-gray-500">When someone cancels their ticket</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.bookingCancellationNotification}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              bookingCancellationNotification: e.target.checked,
                            },
                          })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Reports & Alerts</h3>
                    <div className="space-y-4">
                      <Input
                        label="Low Ticket Alert Threshold"
                        type="number"
                        value={settings.notifications.lowTicketAlertThreshold}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            lowTicketAlertThreshold: parseInt(e.target.value) || 0,
                          },
                        })}
                        min={0}
                      />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Daily Sales Report</h4>
                          <p className="text-sm text-gray-500">Receive daily sales summary</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.dailySalesReport}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              dailySalesReport: e.target.checked,
                            },
                          })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Weekly Analytics Report</h4>
                          <p className="text-sm text-gray-500">Receive weekly analytics summary</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notifications.weeklyAnalyticsReport}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: {
                              ...settings.notifications,
                              weeklyAnalyticsReport: e.target.checked,
                            },
                          })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'payment' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Payment Settings</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Payment Methods</h3>
                    <div className="space-y-2">
                      {['stripe', 'paypal'].map(method => (
                        <div key={method} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={settings.payment.paymentMethods.includes(method)}
                            onChange={(e) => {
                              const methods = e.target.checked
                                ? [...settings.payment.paymentMethods, method]
                                : settings.payment.paymentMethods.filter(m => m !== method);
                              setSettings({
                                ...settings,
                                payment: {
                                  ...settings.payment,
                                  paymentMethods: methods,
                                },
                              });
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-900 capitalize">
                            {method}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Bank Account</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Account Name"
                        value={settings.payment.bankAccount.accountName}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bankAccount: {
                              ...settings.payment.bankAccount,
                              accountName: e.target.value,
                            },
                          },
                        })}
                      />
                      <Input
                        label="Account Number"
                        value={settings.payment.bankAccount.accountNumber}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bankAccount: {
                              ...settings.payment.bankAccount,
                              accountNumber: e.target.value,
                            },
                          },
                        })}
                      />
                      <Input
                        label="Bank Name"
                        value={settings.payment.bankAccount.bankName}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bankAccount: {
                              ...settings.payment.bankAccount,
                              bankName: e.target.value,
                            },
                          },
                        })}
                      />
                      <Input
                        label="Routing Number"
                        value={settings.payment.bankAccount.routingNumber}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bankAccount: {
                              ...settings.payment.bankAccount,
                              routingNumber: e.target.value,
                            },
                          },
                        })}
                      />
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Payout Settings</h3>
                    <div className="space-y-4">
                      <Select
                        label="Payout Schedule"
                        value={settings.payment.payoutSchedule}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            payoutSchedule: e.target.value as 'daily' | 'weekly' | 'monthly',
                          },
                        })}
                        options={[
                          { value: 'daily', label: 'Daily' },
                          { value: 'weekly', label: 'Weekly' },
                          { value: 'monthly', label: 'Monthly' },
                        ]}
                      />

                      <Input
                        label="Auto-Payout Threshold"
                        type="number"
                        value={settings.payment.autoPayoutThreshold}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            autoPayoutThreshold: parseInt(e.target.value) || 0,
                          },
                        })}
                        icon={<DollarSign size={18} />}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'branding' && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Branding Settings</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.branding.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: {
                              ...settings.branding,
                              primaryColor: e.target.value,
                            },
                          })}
                          className="h-8 w-8 rounded border border-gray-300"
                        />
                        <Input
                          value={settings.branding.primaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: {
                              ...settings.branding,
                              primaryColor: e.target.value,
                            },
                          })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secondary Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={settings.branding.secondaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: {
                              ...settings.branding,
                              secondaryColor: e.target.value,
                            },
                          })}
                          className="h-8 w-8 rounded border border-gray-300"
                        />
                        <Input
                          value={settings.branding.secondaryColor}
                          onChange={(e) => setSettings({
                            ...settings,
                            branding: {
                              ...settings.branding,
                              secondaryColor: e.target.value,
                            },
                          })}
                        />
                      </div>
                    </div>
                  </div>

                  <Select
                    label="Font Family"
                    value={settings.branding.fontFamily}
                    onChange={(e) => setSettings({
                      ...settings,
                      branding: {
                        ...settings.branding,
                        fontFamily: e.target.value,
                      },
                    })}
                    options={[
                      { value: 'Inter', label: 'Inter' },
                      { value: 'Roboto', label: 'Roboto' },
                      { value: 'Open Sans', label: 'Open Sans' },
                      { value: 'Poppins', label: 'Poppins' },
                    ]}
                  />

                  <div className="space-y-4">
                    <Select
                      label="Email Template"
                      value={settings.branding.emailTemplate}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          emailTemplate: e.target.value,
                        },
                      })}
                      options={[
                        { value: 'default', label: 'Default Template' },
                        { value: 'minimal', label: 'Minimal Template' },
                        { value: 'modern', label: 'Modern Template' },
                      ]}
                    />

                    <Select
                      label="Ticket Template"
                      value={settings.branding.ticketTemplate}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          ticketTemplate: e.target.value,
                        },
                      })}
                      options={[
                        { value: 'default', label: 'Default Template' },
                        { value: 'minimal', label: 'Minimal Template' },
                        { value: 'modern', label: 'Modern Template' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Custom CSS
                    </label>
                    <textarea
                      value={settings.branding.customCss}
                      onChange={(e) => setSettings({
                        ...settings,
                        branding: {
                          ...settings.branding,
                          customCss: e.target.value,
                        },
                      })}
                      rows={6}
                      className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      placeholder=".custom-class { color: #333; }"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 