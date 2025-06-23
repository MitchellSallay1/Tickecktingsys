import React, { useState } from 'react';
import { Save, User, Lock, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { toast } from 'react-toastify';

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({
    name: 'Admin User',
    email: 'admin@eventticketing.com',
    phone: '+1 (555) 123-4567',
    role: 'Super Admin',
    lastLogin: '2024-01-20T15:30:00Z',
    twoFactorEnabled: true,
  });

  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call an API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would call an API to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
      
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Profile Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User size={32} className="text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
                <p className="text-sm text-gray-500">{profile.role}</p>
                <p className="text-sm text-gray-500">
                  Last login: {formatDate(profile.lastLogin)}
                </p>
              </div>
            </div>
            
            <Input
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
            
            <Input
              type="email"
              label="Email Address"
              name="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              required
            />
            
            <Input
              type="tel"
              label="Phone Number"
              name="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="twoFactorEnabled"
                checked={profile.twoFactorEnabled}
                onChange={(e) => setProfile({ ...profile, twoFactorEnabled: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="twoFactorEnabled" className="text-sm font-medium text-gray-700">
                Enable Two-Factor Authentication
              </label>
            </div>
            
            {profile.twoFactorEnabled && (
              <div className="bg-warning-50 border border-warning-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-warning-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-warning-800">
                      Two-Factor Authentication is Enabled
                    </h3>
                    <div className="mt-2 text-sm text-warning-700">
                      <p>
                        You will be required to enter a verification code sent to your email
                        when logging in from a new device or browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                <Save size={18} className="mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Change Password */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Change Password</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              required
            />
            
            <Input
              type="password"
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              required
            />
            
            <Input
              type="password"
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              required
            />
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                <Lock size={18} className="mr-2" />
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 