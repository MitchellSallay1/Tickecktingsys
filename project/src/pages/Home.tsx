import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary-600">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
              Find and Book Amazing Events
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-primary-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover events that match your interests, from concerts and sports to workshops and conferences.
            </p>
          </div>

          {/* Search Form */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <Input
                placeholder="Search events..."
                icon={<Search className="text-gray-400" />}
                className="bg-white"
              />
              <Input
                placeholder="Location"
                icon={<MapPin className="text-gray-400" />}
                className="bg-white"
              />
              <Input
                type="date"
                placeholder="Date"
                icon={<Calendar className="text-gray-400" />}
                className="bg-white"
              />
            </div>
            <div className="mt-4">
              <Button className="w-full">Search Events</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Events Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Featured Events
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Check out our handpicked selection of must-attend events
          </p>
        </div>

        {/* Event Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Event cards would go here */}
          <div className="text-center text-gray-500">
            No featured events at the moment
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to host your event?</span>
            <span className="block text-primary-600">Join us as an organizer today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/auth/organizer/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 