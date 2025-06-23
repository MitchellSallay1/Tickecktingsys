import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const OrganizerLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        <div className="flex-1 flex flex-col">
          <div className="md:hidden p-4 border-b">
            <button
              onClick={toggleMobileMenu}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
              <span className="ml-2">Menu</span>
            </button>
          </div>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50">
            <Outlet />
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default OrganizerLayout;