import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star, ChefHat, Filter } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { MenuItemCard, MenuItem } from '@/components/MenuItemCard';
import { CartDrawer } from '@/components/CartDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Menu = () => {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  
  const cart = useCart(tableNumber);

  useEffect(() => {
    if (!tableNumber) {
      navigate('/');
      return;
    }
    
    fetchMenu();
  }, [tableNumber]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu');
      setMenuItems(response.data.items || []);
    } catch (error: any) {
      toast.error('Failed to load menu');
      console.error('Menu fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item: MenuItem, qty: number, notes?: string) => {
    cart.addItem({
      menuItemId: item._id,
      name: item.name,
      price: item.price,
      qty,
      notes,
      veg: item.veg,
      imageUrl: item.imageUrl,
    });
    toast.success(`Added ${item.name} to cart`);
  };

  const handleCheckout = () => {
    navigate(`/checkout?table=${tableNumber}`);
  };

  // Get unique categories
  const categories = Array.from(new Set(menuItems.map(item => item.categoryId?.name).filter(Boolean))) as string[];

  // Apply all filters
  const getFilteredItems = () => {
    return menuItems.filter((item) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = item.name?.toLowerCase() || '';
        const description = item.description?.toLowerCase() || '';
        if (!name.includes(query) && !description.includes(query)) {
          return false;
        }
      }

      // Veg filter
      if (vegFilter === 'veg' && !item.veg) return false;
      if (vegFilter === 'non-veg' && item.veg) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.categoryId?.name !== categoryFilter) {
        return false;
      }

      // Label filter
      if (labelFilter === 'chef-special' && !item.isChefsSpecial) return false;
      if (labelFilter === 'all-time-favorite' && !item.isAllTimeFavorite) return false;

      return true;
    });
  };

  const filteredItems = getFilteredItems();

  // Group filtered items by category
  const categorizedItems = filteredItems.reduce((acc, item) => {
    const categoryName = item.categoryId?.name || 'Other';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="space-y-4 mb-4">
          {/* Track Order Button - Separate from header */}
            <div className="space-y-4 mb-4">
          {/* Track Order Button - Separate from header */}
            <div className="flex justify-center">
                <Button 
                  className="fixed top-7 right-6 z-50 rounded-full shadow-lg h-14 w-14 md:w-auto md:px-6" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Track and review your order
                </Button>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Our Menu</h1>
              <p className="text-sm text-muted-foreground">Table {tableNumber}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select value={vegFilter} onValueChange={(value: any) => setVegFilter(value)}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Veg & Non-Veg</SelectItem>
                  <SelectItem value="veg">Veg Only</SelectItem>
                  <SelectItem value="non-veg">Non-Veg Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Labels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Specialities</SelectItem>
                  <SelectItem value="chef-special">Chef's Special</SelectItem>
                  <SelectItem value="all-time-favorite">All-Time Favorite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-12">
        {Object.entries(categorizedItems).map(([category, items]) => {
          if (items.length === 0) return null;
          
          return (
            <section key={category}>
              <h2 className="text-2xl font-bold text-foreground mb-6">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <MenuItemCard key={item._id} item={item} onAddToCart={handleAddToCart} />
                ))}
              </div>
            </section>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items match your filters</p>
          </div>
        )}
      </main>

      <CartDrawer
        items={cart.items}
        total={cart.total}
        itemCount={cart.itemCount}
        onUpdateQty={(id, qty) => cart.updateItem(id, { qty })}
        onRemove={cart.removeItem}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Menu;