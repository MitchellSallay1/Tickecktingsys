import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Contact: React.FC = () => {
  const contactInfo = [
    {
      name: 'Email',
      description: 'support@eventticketing.com',
      icon: Mail,
    },
    {
      name: 'Phone',
      description: '+1 (555) 123-4567',
      icon: Phone,
    },
    {
      name: 'Address',
      description: '123 Event Street, Suite 100, San Francisco, CA 94105',
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-primary-600 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-primary-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Have questions? We're here to help. Get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
            <form className="space-y-6">
              <div>
                <Input
                  label="Name"
                  type="text"
                  placeholder="Your name"
                />
              </div>
              <div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Input
                  label="Subject"
                  type="text"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your message..."
                />
              </div>
              <div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>
            <div className="space-y-8">
              {contactInfo.map((item) => (
                <div key={item.name} className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                      <item.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map or Additional Information */}
            <div className="mt-12 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Hours</h3>
              <ul className="space-y-3 text-base text-gray-500">
                <li>Monday - Friday: 9:00 AM - 6:00 PM (PST)</li>
                <li>Saturday: 10:00 AM - 4:00 PM (PST)</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 