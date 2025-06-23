import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Shield, Globe, Star, Gift } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';

const About: React.FC = () => {
  const stats = [
    {
      label: 'Events Hosted',
      value: '10,000+',
      icon: Calendar,
    },
    {
      label: 'Happy Customers',
      value: '1M+',
      icon: Users,
    },
    {
      label: 'Cities',
      value: '50+',
      icon: Globe,
    },
    {
      label: 'Success Rate',
      value: '99.9%',
      icon: Star,
    },
  ];

  const features = [
    {
      title: 'Secure Transactions',
      description: 'Your payments are protected with industry-standard encryption and secure payment gateways.',
      icon: Shield,
    },
    {
      title: 'Global Events',
      description: 'Access events from around the world, from local meetups to international conferences.',
      icon: Globe,
    },
    {
      title: 'Exclusive Offers',
      description: 'Get access to special discounts and early bird tickets for premium events.',
      icon: Gift,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            About Us
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            We're on a mission to make event ticketing simple, secure, and accessible for everyone.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="mt-4 text-lg text-gray-500">
                We believe that great events bring people together and create lasting memories.
                Our platform makes it easy for organizers to create and manage events while
                providing attendees with a seamless booking experience.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Our Vision</h2>
              <p className="mt-4 text-lg text-gray-500">
                To become the world's most trusted event ticketing platform by providing
                innovative solutions that connect event organizers with their audience and
                create unforgettable experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Why Choose Us</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary-600">
                {/* Add icon */}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Secure Platform</h3>
              <p className="mt-2 text-gray-500">
                State-of-the-art security measures to protect your data and transactions.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary-600">
                {/* Add icon */}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Easy to Use</h3>
              <p className="mt-2 text-gray-500">
                Intuitive interface for both event organizers and attendees.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-primary-600">
                {/* Add icon */}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">24/7 Support</h3>
              <p className="mt-2 text-gray-500">
                Dedicated support team ready to help you at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">Our Team</h2>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Add team member cards */}
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Get in Touch
              </h2>
              <p className="mt-4 text-lg text-gray-500">
                Have questions? We'd love to hear from you.
              </p>
              <a
                href="/contact"
                className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;