import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Shield, Camera, AlertCircle } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import QRCode from 'qrcode.react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  twoFactorEnabled: boolean;
}

const mockProfile: UserProfile = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
  twoFactorEnabled: false,
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSecret, setTwoFactorSecret] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorCode: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name,
          email: mockProfile.email,
          phone: mockProfile.phone,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorCode: '',
    };
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUpdating(true);
    try {
      // In a real app, we would call an API to update the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => prev ? {
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      } : null);
      toast.success('Profile updated successfully!');
      
      if (formData.newPassword) {
        toast.success('Password updated successfully!');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // In a real app, we would upload the file to a server
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfile(prev => prev ? {
            ...prev,
            avatar: reader.result as string,
          } : null);
        };
        reader.readAsDataURL(file);
        toast.success('Profile picture updated successfully!');
      } catch (error) {
        console.error('Error updating avatar:', error);
        toast.error('Failed to update profile picture');
      }
    }
  };

  const setupTwoFactor = async () => {
    try {
      // In a real app, we would call an API to get the 2FA secret
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTwoFactorSecret('JBSWY3DPEHPK3PXP');
      setShowTwoFactorSetup(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to set up two-factor authentication');
    }
  };

  const verifyTwoFactorCode = async () => {
    if (!twoFactorCode) {
      setErrors(prev => ({ ...prev, twoFactorCode: 'Please enter the code' }));
      return;
    }
    
    try {
      // In a real app, we would verify the code with the server
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => prev ? {
        ...prev,
        twoFactorEnabled: true,
      } : null);
      setShowTwoFactorSetup(false);
      setTwoFactorCode('');
      toast.success('Two-factor authentication enabled successfully!');
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
      toast.error('Invalid verification code');
    }
  };

  const disableTwoFactor = async () => {
    try {
      // In a real app, we would call an API to disable 2FA
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(prev => prev ? {
        ...prev,
        twoFactorEnabled: false,
      } : null);
      toast.success('Two-factor authentication disabled successfully!');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-12 h-12 text-error-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Error Loading Profile
        </h2>
        <p className="text-gray-600 mb-4">
          Unable to load your profile information. Please try again later.
        </p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Account Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-100"
                    >
                      <Camera size={16} className="text-gray-600" />
                      <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Profile Picture
                    </h3>
                    <p className="text-sm text-gray-500">
                      Upload a new profile picture
                    </p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    icon={<User size={18} />}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    icon={<Mail size={18} />}
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                    icon={<Phone size={18} />}
                  />
                </div>

                {/* Password Change */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      error={errors.currentPassword}
                      icon={<Lock size={18} />}
                    />

                    <Input
                      label="New Password"
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      error={errors.newPassword}
                      icon={<Lock size={18} />}
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      error={errors.confirmPassword}
                      icon={<Lock size={18} />}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Security Settings
              </h3>

              <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Shield
                      size={20}
                      className={profile.twoFactorEnabled ? 'text-success-600' : 'text-gray-400'}
                    />
                  </div>

                  <div className="mt-4">
                    {profile.twoFactorEnabled ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={disableTwoFactor}
                      >
                        Disable 2FA
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={setupTwoFactor}
                      >
                        Enable 2FA
                      </Button>
                    )}
                  </div>

                  {showTwoFactorSetup && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-4">
                        Setup Two-Factor Authentication
                      </h5>
                      
                      <div className="text-center mb-4">
                        <QRCode
                          value={`otpauth://totp/EventTix:${profile.email}?secret=${twoFactorSecret}&issuer=EventTix`}
                          size={150}
                          level="H"
                          includeMargin
                        />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code with your authenticator app or enter the code manually:
                      </p>
                      
                      <div className="font-mono text-center bg-white p-2 rounded border mb-4">
                        {twoFactorSecret}
                      </div>
                      
                      <Input
                        label="Verification Code"
                        value={twoFactorCode}
                        onChange={(e) => {
                          setTwoFactorCode(e.target.value);
                          setErrors(prev => ({ ...prev, twoFactorCode: '' }));
                        }}
                        error={errors.twoFactorCode}
                        maxLength={6}
                        className="text-center"
                      />
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowTwoFactorSetup(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={verifyTwoFactorCode}
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Session Management */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900">
                    Active Sessions
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your active sessions across devices
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      toast.success('All other sessions have been logged out');
                    }}
                  >
                    Log Out Other Sessions
                  </Button>
                </div>

                {/* Account Deletion */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900">
                    Delete Account
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    Permanently delete your account and all data
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-4 text-error-600 border-error-600 hover:bg-error-50"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                        toast.success('Account deletion request submitted');
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;