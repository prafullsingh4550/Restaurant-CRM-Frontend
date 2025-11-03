import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Package, Download, RefreshCw, ArrowLeft, Users, Award, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Custom hook for fetching analytics data
const useAnalyticsData = (endpoint, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      const response = await api.get(url);
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${endpoint}:`, err);
      // Don't show toast for every error, just log it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint, JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};

// Error Display Component
const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
    <AlertCircle className="w-12 h-12 mb-2 text-gray-400" />
    <p className="text-sm">{message || 'Unable to load data'}</p>
    <p className="text-xs text-gray-400 mt-1">This endpoint may not be implemented yet</p>
  </div>
);

// KPI Card Component
const KPICard = ({ title, value, icon: Icon, trend = null, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

// Summary Cards Component
const SummaryCards = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/summary', dateRange);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ErrorDisplay message="Failed to load summary data" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Total Orders"
        value={data?.totalOrders?.toLocaleString() || '0'}
        icon={ShoppingCart}
        color="blue"
      />
      <KPICard
        title="Total Revenue"
        value={`₹${data?.totalRevenue?.toLocaleString() || '0'}`}
        icon={DollarSign}
        color="green"
      />
      <KPICard
        title="Avg Order Value"
        value={`₹${data?.avgOrderValue?.toFixed(2) || '0.00'}`}
        icon={TrendingUp}
        color="purple"
      />
      <KPICard
        title="Items Sold"
        value={data?.totalItemsSold?.toLocaleString() || '0'}
        icon={Package}
        color="orange"
      />
    </div>
  );
};

// Daily Trends Chart
const DailyTrendsChart = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/orders/daily', dateRange);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Orders & Revenue Trends</h3>
        <ErrorDisplay message={error ? "Failed to load daily trends" : "No data available for this period"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Orders & Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="_id" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="totalOrders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
          <Line yAxisId="right" type="monotone" dataKey="totalRevenue" stroke="#10b981" strokeWidth={2} name="Revenue (₹)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Hourly Orders Chart
const HourlyOrdersChart = ({ selectedDate }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/orders/hourly', { date: selectedDate });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Order Distribution</h3>
        <ErrorDisplay message={error ? "Failed to load hourly data" : "No data available"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Order Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="totalRevenue" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Bar dataKey="totalOrders" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Veg vs Non-Veg Pie Chart
const VegVsNonVegPie = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/veg-vs-nonveg', dateRange);
  const COLORS = ['#10b981', '#ef4444'];
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }
  
  // Transform the API response into chart data
  const transformData = (apiData) => {
    if (!apiData || typeof apiData !== 'object') return [];
    
    const chartData = [];
    
    if (apiData.veg) {
      chartData.push({
        name: 'Veg',
        value: apiData.veg.totalSold || 0,
        revenue: apiData.veg.totalRevenue || 0
      });
    }
    
    if (apiData.nonVeg) {
      chartData.push({
        name: 'Non-Veg',
        value: apiData.nonVeg.totalSold || 0,
        revenue: apiData.nonVeg.totalRevenue || 0
      });
    }
    
    return chartData;
  };
  
  const chartData = transformData(data);
  const totalSold = chartData.reduce((sum, item) => sum + item.value, 0);
  
  if (error || !chartData || chartData.length === 0 || totalSold === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Veg vs Non-Veg Sales</h3>
        <ErrorDisplay message={error ? "Failed to load veg/non-veg data" : "No data available"} />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Veg vs Non-Veg Sales</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => 
              `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              `${value} items (₹${props.payload.revenue})`,
              name
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Top Items Chart
const TopItemsChart = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/items/top', dateRange);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
        <ErrorDisplay message={error ? "Failed to load top items" : "No data available"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis dataKey="_id" type="category" stroke="#6b7280" fontSize={12} width={100} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Bar dataKey="totalSold" fill="#f59e0b" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Category Sales Chart
const CategorySalesChart = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/sales/category', dateRange);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
        <ErrorDisplay message={error ? "Failed to load category sales" : "No data available"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" stroke="#6b7280" fontSize={12} />
          <YAxis dataKey="_id" type="category" stroke="#6b7280" fontSize={12} width={100} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Repeat Customers Table
const RepeatCustomersTable = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/customers/repeat', dateRange);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Top Repeat Customers
        </h3>
        <ErrorDisplay message={error ? "Failed to load customer data" : "No repeat customers data available"} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Top Repeat Customers
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{customer.name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{customer._id}</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">{customer.totalOrders}</td>
                <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">₹{customer.totalSpent?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Most Profitable Item Card
const MostProfitableCard = ({ dateRange }) => {
  const { data, loading, error } = useAnalyticsData('/admin/analytics/items/profitable', dateRange);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
        <div className="h-32 animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Most Profitable Item</h3>
        </div>
        <p className="text-sm opacity-90">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Most Profitable Item</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{data._id}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/20">
        <div>
          <p className="text-sm opacity-90">Total Sales</p>
          <p className="text-xl font-bold">{data.revenue}</p>
        </div>
        <div>
          <p className="text-sm opacity-90">Profit</p>
          <p className="text-xl font-bold">₹{data.profit?.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm opacity-90">Margin</p>
          <p className="text-xl font-bold">{data.profitMargin}%</p>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Set default date range (last 7 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  }, []);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success('Dashboard refreshed');
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/analytics/summary', { 
        params: dateRange
      });
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleDateRangeChange = (preset) => {
    const end = new Date();
    const start = new Date();
    
    if (preset === '7days') {
      start.setDate(start.getDate() - 7);
    } else if (preset === '30days') {
      start.setDate(start.getDate() - 30);
    }
    
    setDateRange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Restaurant Analytics Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Real-time insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-2">
                <button
                  onClick={() => handleDateRangeChange('7days')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  7 Days
                </button>
                <button
                  onClick={() => handleDateRangeChange('30days')}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  30 Days
                </button>
              </div>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                onClick={handleRefresh}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* KPI Cards */}
          <SummaryCards dateRange={dateRange} key={`summary-${refreshKey}`} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <DailyTrendsChart dateRange={dateRange} key={`daily-${refreshKey}`} />
            </div>
            <div>
              <HourlyOrdersChart selectedDate={selectedDate} key={`hourly-${refreshKey}`} />
              <div className="mt-4 px-4">
                <label className="text-sm text-gray-600 mb-2 block">Select date for hourly view:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <VegVsNonVegPie dateRange={dateRange} key={`veg-${refreshKey}`} />
            <TopItemsChart dateRange={dateRange} key={`top-${refreshKey}`} />
            <CategorySalesChart dateRange={dateRange} key={`category-${refreshKey}`} />
          </div>

          {/* Tables and Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RepeatCustomersTable dateRange={dateRange} key={`repeat-${refreshKey}`} />
            </div>
            <MostProfitableCard dateRange={dateRange} key={`profitable-${refreshKey}`} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;