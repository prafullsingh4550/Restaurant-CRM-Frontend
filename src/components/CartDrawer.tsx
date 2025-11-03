import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CartItem } from '@/hooks/useCart';
import { VegIndicator } from './VegIndicator';
import { Badge } from './ui/badge';

interface CartDrawerProps {
  items: CartItem[];
  total: number;
  itemCount: number;
  onUpdateQty: (menuItemId: string, qty: number) => void;
  onRemove: (menuItemId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer = ({
  items,
  total,
  itemCount,
  onUpdateQty,
  onRemove,
  onCheckout,
}: CartDrawerProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="fixed top-5 right-6 z-50 rounded-full shadow-lg h-14 w-14 md:w-auto md:px-6"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {itemCount}
              </Badge>
            )}
          </div>
          <span className="hidden md:inline ml-2">Cart</span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
          <SheetDescription>
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 flex-1 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-secondary/50 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start gap-3">
                  <VegIndicator veg={item.veg || false} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onRemove(item.menuItemId)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-background rounded-lg p-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onUpdateQty(item.menuItemId, Math.max(1, item.qty - 1))}
                      disabled={item.qty <= 1}
                      className="h-7 w-7"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onUpdateQty(item.menuItemId, item.qty + 1)}
                      className="h-7 w-7"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <p className="font-semibold text-primary">
                    ₹{(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
