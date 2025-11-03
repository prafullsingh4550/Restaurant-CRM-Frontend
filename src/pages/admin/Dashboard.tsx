import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2, Clock, BarChart3, Search, RefreshCw, Star } from 'lucide-react';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  total: number;
  createdAt: string;
  estimatedReadyAt?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<{ orderId: string; status: string; eta?: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const { on, off } = useSocket();

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 4 minutes
    const refreshInterval = setInterval(() => {
      fetchOrders();
    }, 4 * 60 * 1000);

    const handleAdminOrderUpdate = (data: any) => {
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data._id || order.orderId === data.orderId
            ? { ...order, ...data }
            : order
        )
      );
    };

    on('admin_order_updated', handleAdminOrderUpdate);

    return () => {
      clearInterval(refreshInterval);
      off('admin_order_updated', handleAdminOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const response = await api.get('/orders');
      setOrders(response.data.orders || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch orders');
        console.error('Fetch orders error:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchOrders();
    toast.success('Orders refreshed');
  };

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/admin/login');
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    const eta = statusUpdate?.orderId === orderId ? statusUpdate.eta : undefined;
    
    try {
      const payload: any = { status };
      if (eta) {
        payload.estimatedReadyAt = new Date(Date.now() + parseInt(eta) * 60000).toISOString();
      }

      await api.patch(`/admin/orders/${orderId}/status`, payload);
      toast.success('Order status updated');
      setStatusUpdate(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteOrderId) return;

    try {
      await api.delete(`/orders/${deleteOrderId}`);
      toast.success('Order deleted');
      setDeleteOrderId(null);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    const matchesSearch = 
      searchQuery === '' ||
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage orders and menu</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/analytics')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/reviews-table')}
              className="flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Review Table
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/menu')}>
              Menu Management
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex gap-4 mt-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Order ID or Phone Number"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="served">Served</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleManualRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone No</TableHead>                      
                      <TableHead>Status</TableHead>
                      {/* <TableHead>ETA (min)</TableHead> */}
                      <TableHead>Total</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-medium">
                          <button
                            onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                            className="text-primary hover:underline cursor-pointer"
                          >
                            {order.orderId}
                          </button>
                        </TableCell>
                        <TableCell>{order.tableNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.customerPhone}</TableCell>
                        <TableCell>
                          <Select
                            value={order.orderStatus}
                            onValueChange={(value) => handleStatusChange(order.orderId, value)}
                          >
                            <SelectTrigger className="w-32">
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
                        </TableCell>
                        {/* <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="Min"
                              className="w-20"
                              onChange={(e) =>
                                setStatusUpdate({
                                  orderId: order.orderId,
                                  status: order.orderStatus,
                                  eta: e.target.value,
                                })
                              }
                            />
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </TableCell> */}
                        <TableCell>₹{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteOrderId(order.orderId)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDashboard;