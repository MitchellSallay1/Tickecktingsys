import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Tag, Clock, Users, DollarSign, Percent } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-toastify';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  soldCount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'draft' | 'ended';
  features: string[];
}

interface PricingTier {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumQuantity: number;
  maxUsage: number;
  usedCount: number;
}

const mockTicketTypes: TicketType[] = [
  {
    id: '1',
    name: 'Early Bird',
    description: 'Limited early bird tickets at a special price',
    price: 199.99,
    quantity: 100,
    soldCount: 75,
    startDate: '2024-03-01',
    endDate: '2024-04-01',
    status: 'active',
    features: ['Priority seating', 'Welcome drink', 'Conference swag'],
  },
  {
    id: '2',
    name: 'Regular',
    description: 'Standard conference ticket',
    price: 299.99,
    quantity: 500,
    soldCount: 200,
    startDate: '2024-04-02',
    endDate: '2024-06-14',
    status: 'active',
    features: ['Standard seating', 'Conference swag'],
  },
  {
    id: '3',
    name: 'VIP',
    description: 'VIP experience with exclusive benefits',
    price: 599.99,
    quantity: 50,
    soldCount: 20,
    startDate: '2024-03-01',
    endDate: '2024-06-14',
    status: 'active',
    features: [
      'VIP seating',
      'Welcome drink',
      'Conference swag',
      'Exclusive networking session',
      'Private lounge access',
    ],
  },
];

const mockPricingTiers: PricingTier[] = [
  {
    id: '1',
    name: 'Group Discount',
    startDate: '2024-03-01',
    endDate: '2024-06-14',
    discountType: 'percentage',
    discountValue: 15,
    minimumQuantity: 5,
    maxUsage: 50,
    usedCount: 10,
  },
  {
    id: '2',
    name: 'Flash Sale',
    startDate: '2024-04-01',
    endDate: '2024-04-07',
    discountType: 'fixed',
    discountValue: 50,
    minimumQuantity: 1,
    maxUsage: 100,
    usedCount: 45,
  },
];

const TicketTypes: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTicketType, setShowAddTicketType] = useState(false);
  const [showAddPricingTier, setShowAddPricingTier] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTicketTypes(mockTicketTypes);
        setPricingTiers(mockPricingTiers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load ticket types and pricing tiers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleAddTicketType = async (data: Partial<TicketType>) => {
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newTicketType: TicketType = {
        id: String(ticketTypes.length + 1),
        name: data.name || '',
        description: data.description || '',
        price: data.price || 0,
        quantity: data.quantity || 0,
        soldCount: 0,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: 'draft',
        features: data.features || [],
      };
      setTicketTypes([...ticketTypes, newTicketType]);
      setShowAddTicketType(false);
      toast.success('Ticket type added successfully');
    } catch (error) {
      console.error('Error adding ticket type:', error);
      toast.error('Failed to add ticket type');
    }
  };

  const handleAddPricingTier = async (data: Partial<PricingTier>) => {
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newPricingTier: PricingTier = {
        id: String(pricingTiers.length + 1),
        name: data.name || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        discountType: data.discountType || 'percentage',
        discountValue: data.discountValue || 0,
        minimumQuantity: data.minimumQuantity || 1,
        maxUsage: data.maxUsage || 0,
        usedCount: 0,
      };
      setPricingTiers([...pricingTiers, newPricingTier]);
      setShowAddPricingTier(false);
      toast.success('Pricing tier added successfully');
    } catch (error) {
      console.error('Error adding pricing tier:', error);
      toast.error('Failed to add pricing tier');
    }
  };

  const handleDeleteTicketType = async (id: string) => {
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTicketTypes(ticketTypes.filter(t => t.id !== id));
      toast.success('Ticket type deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      toast.error('Failed to delete ticket type');
    }
  };

  const handleDeletePricingTier = async (id: string) => {
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPricingTiers(pricingTiers.filter(t => t.id !== id));
      toast.success('Pricing tier deleted successfully');
    } catch (error) {
      console.error('Error deleting pricing tier:', error);
      toast.error('Failed to delete pricing tier');
    }
  };

  if (isLoading) {
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
          Ticket Types & Pricing
        </h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setShowAddPricingTier(true)}
          >
            <Percent size={16} className="mr-2" />
            Add Pricing Tier
          </Button>
          <Button onClick={() => setShowAddTicketType(true)}>
            <Plus size={16} className="mr-2" />
            Add Ticket Type
          </Button>
        </div>
      </div>

      {/* Ticket Types */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-xl font-semibold">Ticket Types</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ticketTypes.map(ticket => (
              <Card key={ticket.id} className="h-full">
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {ticket.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {ticket.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'active'
                        ? 'bg-success-100 text-success-800'
                        : ticket.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-error-100 text-error-800'
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <DollarSign size={16} className="mr-2" />
                      ${ticket.price}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      {ticket.soldCount} / {ticket.quantity} sold
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      {new Date(ticket.startDate).toLocaleDateString()} - {new Date(ticket.endDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Features
                    </h4>
                    <ul className="space-y-1">
                      {ticket.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <Tag size={12} className="mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {/* Handle edit */}}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="px-3"
                      onClick={() => handleDeleteTicketType(ticket.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Pricing Tiers & Discounts</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingTiers.map(tier => (
              <Card key={tier.id} className="h-full">
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tier.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Min. quantity: {tier.minimumQuantity}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-primary-600">
                      {tier.discountType === 'percentage'
                        ? `${tier.discountValue}%`
                        : `$${tier.discountValue}`}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      {new Date(tier.startDate).toLocaleDateString()} - {new Date(tier.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-2" />
                      {tier.usedCount} / {tier.maxUsage} used
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {/* Handle edit */}}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="px-3"
                      onClick={() => handleDeletePricingTier(tier.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketTypes; 