import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Package, ChefHat, Utensils, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface OrderItem {
  _id: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  paymentStatus: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

const CustomerOrdersDetailsPage = () => {
  const navigate = useNavigate();
  const { searchValue } = useParams<{ searchValue: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderData();
  }, [searchValue]);

  const fetchOrderData = async () => {
    if (!searchValue) return;

    setLoading(true);
    setError(null);
    setOrders([]);
    setSingleOrder(null);

    try {
      let url = '';

      // Detect if input is phone or order id
      if (/^\d{10}$/.test(searchValue)) {
        url = `https://restraunt-backend.up.railway.app/api/v1/orders/recent/${searchValue}`;
      } else {
        url = `https://restraunt-backend.up.railway.app/api/v1/orders/${searchValue}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('No order found');

      const data = await res.json();

      if (data.orders) {
        setOrders(data.orders);
      } else {
        setSingleOrder(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch order');
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'received', label: 'Received', icon: Package },
      { key: 'preparing', label: 'Preparing', icon: ChefHat },
      { key: 'ready', label: 'Ready', icon: Utensils },
      { key: 'served', label: 'Served', icon: CheckCircle2 },
      { key: 'completed', label: 'Completed', icon: CheckCircle2 },
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStatus);

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  const OrderStatusTracker = ({ status }: { status: string }) => {
    const steps = getStatusSteps(status);

    return (
      <div className="py-6">
        <h3 className="text-xl font-bold mb-6">Order Status</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      step.completed
                        ? step.current
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-12 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1 pt-2">
                  <p
                    className={`font-semibold text-lg ${
                      step.completed
                        ? step.current
                          ? 'text-orange-500'
                          : 'text-green-500'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.current && step.key === 'completed' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Your order is currently completed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Order ID: {order.orderId}</CardTitle>
        <CardDescription>
          {new Date(order.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Table:</p>
            <p>{order.tableNumber}</p>
          </div>
          <div>
            <p className="font-semibold">Payment:</p>
            <p className="capitalize">{order.paymentStatus}</p>
          </div>
        </div>

        <OrderStatusTracker status={order.orderStatus} />

        <div>
          <h4 className="font-semibold text-lg mb-3">Items</h4>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item._id} className="flex justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground">Notes: {item.notes}</p>
                  )}
                </div>
                <p className="font-semibold">₹{(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax:</span>
            <span>₹{order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₹{order.total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/order/${order.orderId}/review`)}
          disabled={order.orderStatus !== 'completed'}
          className="w-full"
          size="lg"
        >
          <Star className="w-4 h-4 mr-2" />
          {order.orderStatus === 'completed' ? 'Write a Review' : 'Review Available After Completion'}
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {singleOrder && (
          <>
            <h1 className="text-2xl font-bold mb-6">Order Details</h1>
            <OrderCard order={singleOrder} />
          </>
        )}

        {orders.length > 0 && (
          <>
            <h1 className="text-2xl font-bold mb-6">
              Recent Orders for {orders[0]?.customerPhone}
            </h1>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </>
        )}
      </main>
    </div>
  );
};

export default CustomerOrdersDetailsPage;