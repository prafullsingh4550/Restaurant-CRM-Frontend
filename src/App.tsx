import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderTracking from "./pages/OrderTracking";
import Review from "./pages/Review";
import CustomerOrders from "./pages/CustomerOrdersDetailsPage";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import OrderDetailsPage from "./pages/admin/OrderDetailsPage";
import AnalyticsDashboard from "./pages/admin/useAnalyticsData";
import MenuManagement from "./pages/admin/MenuManagement";
import ReviewsDashboard from "./pages/admin/ReviewsTable";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderTracking />} />
          <Route path="/order/:orderId/review" element={<Review />} />
          <Route path="/track-order/:searchValue" element={<CustomerOrders />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders/:orderId" element={<OrderDetailsPage />} />
          <Route path="/admin/menu" element={<MenuManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/reviews-table" element={<ReviewsDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;