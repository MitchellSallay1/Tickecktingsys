import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {children}
    </div>
  );
};

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return <div className={`px-4 py-5 sm:p-6 ${className}`}>{children}</div>;
};

const CardFooter: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-4 border-t border-gray-200 sm:px-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
export { CardHeader, CardContent, CardFooter };