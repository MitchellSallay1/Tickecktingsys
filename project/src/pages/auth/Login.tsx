import React from 'react';
import { Link } from 'react-router-dom';
import { User, Calendar, Users } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please select your account type to continue
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/auth/admin/login"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Users className="h-5 w-5 text-primary-300 group-hover:text-primary-200" />
            </span>
            Login as Administrator
          </Link>

          <Link
            to="/auth/organizer/login"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <Calendar className="h-5 w-5 text-secondary-300 group-hover:text-secondary-200" />
            </span>
            Login as Event Organizer
          </Link>

          <Link
            to="/auth/user/login"
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <User className="h-5 w-5 text-accent-300 group-hover:text-accent-200" />
            </span>
            Login as User
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;