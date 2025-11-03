import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Printer } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
}

interface OrderDetails {
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
  estimatedReadyAt?: string;
}

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [etaInput, setEtaInput] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data);
    } catch (error: any) {
      toast.error('Failed to fetch order details');
      console.error('Order details fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!order) return;

    try {
      const payload: any = { status };
      await api.patch(`/admin/orders/${order.orderId}/status`, payload);
      toast.success('Order status updated');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (paymentStatus: string) => {
    if (!order) return;

    try {
      await api.patch(`/admin/orders/${order.orderId}/status`, { paymentStatus });
      toast.success('Payment status updated');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  const handleEtaUpdate = async () => {
    if (!order || !etaInput) return;

    try {
      const payload = {
        status: order.orderStatus,
        estimatedReadyAt: new Date(Date.now() + parseInt(etaInput) * 60000).toISOString()
      };
      await api.patch(`/admin/orders/${order.orderId}/status`, payload);
      toast.success('ETA updated');
      setEtaInput('');
      fetchOrderDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update ETA');
    }
  };

  const handlePrint = () => {
    if (order?.orderStatus !== 'completed' && order?.paymentStatus !== 'completed') {
      toast.error('Print will only be enabled when either order status is completed or payment status is completed');
      return;
    }
    window.print();
  };

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

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border print:hidden">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders for {order.customerPhone}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-2">Order ID: {order.orderId}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Table:</span>
                    <span>{order.tableNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Status:</span>
                    <span className="capitalize">{order.orderStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Payment:</span>
                    <span className="capitalize">{order.paymentStatus}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{item.name} × {item.qty}</span>
                        <span>₹{(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 print:hidden">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={order.orderStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="served">Served</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={order.paymentStatus} onValueChange={handlePaymentStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">ETA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Minutes"
                    value={etaInput}
                    onChange={(e) => setEtaInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleEtaUpdate} disabled={!etaInput}>
                    <Clock className="w-4 h-4" />
                  </Button>
                </div>
                {order.estimatedReadyAt && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Ready at: {new Date(order.estimatedReadyAt).toLocaleTimeString()}
                  </p>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handlePrint} 
              className="w-full"
              disabled={order.orderStatus !== 'completed' && order.paymentStatus !== 'completed'}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            {order.orderStatus !== 'completed' && order.paymentStatus !== 'completed' && (
              <p className="text-xs text-muted-foreground text-center">
                Print will only be enabled when either order status is completed or payment status is completed
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderDetailsPage;