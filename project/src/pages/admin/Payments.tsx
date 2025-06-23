import React, { useState, useEffect } from 'react';
import { Search, Filter, DollarSign, Download, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

interface Payment {
  id: string;
  transactionId: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    transactionId: 'TXN-001',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    amount: 299.99,
    status: 'completed',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    transactionId: 'TXN-002',
    eventId: '2',
    eventTitle: 'Music Festival',
    userId: '2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    amount: 149.99,
    status: 'completed',
    paymentMethod: 'PayPal',
    createdAt: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    transactionId: 'TXN-003',
    eventId: '3',
    eventTitle: 'Food & Wine Expo',
    userId: '3',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    amount: 79.99,
    status: 'refunded',
    paymentMethod: 'Credit Card',
    createdAt: '2024-01-17T09:15:00Z',
  },
];

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    fetchPayments();
  }, [pagination.currentPage, pagination.pageSize]);

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPayments(mockPayments);
      setPagination(prev => ({
        ...prev,
        totalItems: mockPayments.length,
        totalPages: Math.ceil(mockPayments.length / prev.pageSize),
      }));
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    fetchPayments();
  };

  const handleExport = async () => {
    try {
      // In a real app, we would generate and download a CSV file
      toast.success('Payment report downloaded successfully');
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.error('Failed to export payments');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const columns = [
    {
      key: 'transactionId',
      header: 'Transaction ID',
      render: (payment: Payment) => (
        <div>
          <div className="font-medium text-gray-900">{payment.transactionId}</div>
          <div className="text-sm text-gray-500">{formatDate(payment.createdAt)}</div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (payment: Payment) => (
        <div className="text-gray-900">{payment.eventTitle}</div>
      ),
    },
    {
      key: 'user',
      header: 'Customer',
      render: (payment: Payment) => (
        <div>
          <div className="text-gray-900">{payment.userName}</div>
          <div className="text-sm text-gray-500">{payment.userEmail}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (payment: Payment) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(payment.amount)}
        </div>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Payment Method',
      render: (payment: Payment) => (
        <div className="text-gray-900">{payment.paymentMethod}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (payment: Payment) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          payment.status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <div className="text-center py-8 text-error-600">
        <AlertCircle className="w-12 h-12 mx-auto text-error-500 mb-2" />
        <h3 className="text-lg font-medium mb-1">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Button
          variant="outline"
          onClick={handleExport}
          className="flex items-center"
        >
          <Download size={18} className="mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <Input
                placeholder="Search by transaction ID, event, or customer..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                icon={<Search size={18} />}
                className="w-full"
              />
            </div>

            <div className="md:w-48">
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="md:w-48">
              <Input
                type="date"
                placeholder="Start Date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full"
              />
            </div>

            <div className="md:w-48">
              <Input
                type="date"
                placeholder="End Date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full"
              />
            </div>

            <Button type="submit">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </form>
        </CardHeader>

        <CardContent>
          <Table
            columns={columns}
            data={payments}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
          />

          <div className="mt-6">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
              onPageSizeChange={(size) => setPagination(prev => ({ ...prev, pageSize: size, currentPage: 1 }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="text-center">
            <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
            </h3>
            <p className="text-gray-600">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <DollarSign className="w-8 h-8 text-success-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {payments.filter(p => p.status === 'completed').length}
            </h3>
            <p className="text-gray-600">Successful Payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <DollarSign className="w-8 h-8 text-error-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                payments
                  .filter(p => p.status === 'refunded')
                  .reduce((sum, p) => sum + p.amount, 0)
              )}
            </h3>
            <p className="text-gray-600">Total Refunds</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments; 