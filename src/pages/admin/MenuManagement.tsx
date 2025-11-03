// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';
// import { api } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { VegIndicator } from '@/components/VegIndicator';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// interface MenuItem {
//   _id: string;
//   name: string;
//   description: string;
//   price: number;
//   veg: boolean;
//   available: boolean;
//   isChefsSpecial?: boolean;
//   isAllTimeFavorite?: boolean;
//   categoryId?: { _id: string; name: string };
// }

// interface SeedMenuItem {
//   name: string;
//   veg: boolean;
//   category: string;
//   description: string;
//   price: number;
//   isAllTimeFavorite: boolean;
//   isChefsSpecial: boolean;
//   imageUrl: string;
// }

// const CATEGORIES = [
//   'Starters',
//   'Main Course',
//   'Desserts',
//   'South Indian',
//   'Coastal Specials',
//   'Chinese',
//   'Beverages',
//   'Breads',
//   'Rice',
//   'Salads',
// ];

// const MenuManagement = () => {
//   const navigate = useNavigate();
//   const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showSeedDialog, setShowSeedDialog] = useState(false);
//   const [seedItems, setSeedItems] = useState<SeedMenuItem[]>([
//     {
//       name: '',
//       veg: true,
//       category: 'Starters',
//       description: '',
//       price: 0,
//       isAllTimeFavorite: false,
//       isChefsSpecial: false,
//       imageUrl: '',
//     },
//   ]);
//   const [uploading, setUploading] = useState(false);

//   useEffect(() => {
//     fetchMenuItems();
//   }, []);

//   const fetchMenuItems = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/admin/menu');
//       setMenuItems(response.data.items || response.data || []);
//     } catch (error: any) {
//       if (error.response?.status === 401) {
//         toast.error('Please login to continue');
//         navigate('/admin/login');
//       } else {
//         toast.error('Failed to fetch menu items');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this item?')) return;

//     try {
//       await api.delete(`/admin/menu/${id}`);
//       toast.success('Menu item deleted');
//       fetchMenuItems();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to delete item');
//     }
//   };

//   const handleAddSeedItem = () => {
//     setSeedItems([
//       ...seedItems,
//       {
//         name: '',
//         veg: true,
//         category: 'Starters',
//         description: '',
//         price: 0,
//         isAllTimeFavorite: false,
//         isChefsSpecial: false,
//         imageUrl: '',
//       },
//     ]);
//   };

//   const handleRemoveSeedItem = (index: number) => {
//     if (seedItems.length === 1) {
//       toast.error('At least one item is required');
//       return;
//     }
//     setSeedItems(seedItems.filter((_, i) => i !== index));
//   };

//   const handleSeedItemChange = (index: number, field: keyof SeedMenuItem, value: any) => {
//     const updated = [...seedItems];
//     updated[index] = { ...updated[index], [field]: value };
//     setSeedItems(updated);
//   };

//   const handleBulkUpload = async () => {
//     // Validate all items
//     const invalidItems = seedItems.filter(
//       (item) => !item.name || !item.description || item.price <= 0
//     );

//     if (invalidItems.length > 0) {
//       toast.error('Please fill all required fields (name, description, price > 0)');
//       return;
//     }

//     try {
//       setUploading(true);
//       const response = await api.post('/admin/menu/seed', { items: seedItems });
      
//       toast.success(
//         `${response.data.inserted} items added successfully: ${response.data.items.join(', ')}`
//       );
      
//       setShowSeedDialog(false);
//       setSeedItems([
//         {
//           name: '',
//           veg: true,
//           category: 'Starters',
//           description: '',
//           price: 0,
//           isAllTimeFavorite: false,
//           isChefsSpecial: false,
//           imageUrl: '',
//         },
//       ]);
//       fetchMenuItems();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to upload items');
//     } finally {
//       setUploading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
//           <p className="text-muted-foreground">Loading menu...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="bg-card border-b border-border">
//         <div className="container mx-auto px-4 py-4">
//           <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Dashboard
//           </Button>
//           <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
//         </div>
//       </header>

//       <main className="container mx-auto px-4 py-6">
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Menu Items</CardTitle>
//               <Button onClick={() => setShowSeedDialog(true)}>
//                 <Plus className="w-4 h-4 mr-2" />
//                 Add Items (Bulk Upload)
//               </Button>
//             </div>
//           </CardHeader>
//           <CardContent>
//             {menuItems.length === 0 ? (
//               <div className="text-center py-12 text-muted-foreground">
//                 <p className="mb-4">No menu items found</p>
//                 <p className="text-sm">Use the bulk upload to add menu items</p>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Type</TableHead>
//                       <TableHead>Name</TableHead>
//                       <TableHead>Category</TableHead>
//                       <TableHead>Price</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Badges</TableHead>
//                       <TableHead>Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {menuItems.map((item) => (
//                       <TableRow key={item._id}>
//                         <TableCell>
//                           <VegIndicator veg={item.veg} />
//                         </TableCell>
//                         <TableCell className="font-medium">{item.name}</TableCell>
//                         <TableCell>{item.categoryId?.name || 'N/A'}</TableCell>
//                         <TableCell>₹{item.price}</TableCell>
//                         <TableCell>
//                           <Badge variant={item.available ? 'default' : 'secondary'}>
//                             {item.available ? 'Available' : 'Unavailable'}
//                           </Badge>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-1">
//                             {item.isChefsSpecial && (
//                               <Badge variant="secondary" className="text-xs">Special</Badge>
//                             )}
//                             {item.isAllTimeFavorite && (
//                               <Badge variant="secondary" className="text-xs">Favorite</Badge>
//                             )}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex gap-2">
//                             <Button size="icon" variant="ghost">
//                               <Pencil className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               onClick={() => handleDelete(item._id)}
//                               className="text-destructive"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </main>

//       {/* Bulk Upload Dialog */}
//       <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Bulk Upload Menu Items</DialogTitle>
//             <DialogDescription>
//               Add multiple menu items at once. Fill in the details for each item and click Upload All.
//             </DialogDescription>
//           </DialogHeader>

//           <div className="space-y-6 mt-4">
//             {seedItems.map((item, index) => (
//               <Card key={index} className="relative">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <CardTitle className="text-lg">Item {index + 1}</CardTitle>
//                     {seedItems.length > 1 && (
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         onClick={() => handleRemoveSeedItem(index)}
//                         className="h-8 w-8"
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor={`name-${index}`}>
//                         Name <span className="text-destructive">*</span>
//                       </Label>
//                       <Input
//                         id={`name-${index}`}
//                         value={item.name}
//                         onChange={(e) => handleSeedItemChange(index, 'name', e.target.value)}
//                         placeholder="e.g., Paneer Tikka"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor={`category-${index}`}>
//                         Category <span className="text-destructive">*</span>
//                       </Label>
//                       <Select
//                         value={item.category}
//                         onValueChange={(value) => handleSeedItemChange(index, 'category', value)}
//                       >
//                         <SelectTrigger id={`category-${index}`}>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {CATEGORIES.map((cat) => (
//                             <SelectItem key={cat} value={cat}>
//                               {cat}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <Label htmlFor={`description-${index}`}>
//                       Description <span className="text-destructive">*</span>
//                     </Label>
//                     <Textarea
//                       id={`description-${index}`}
//                       value={item.description}
//                       onChange={(e) => handleSeedItemChange(index, 'description', e.target.value)}
//                       placeholder="Describe the dish..."
//                       rows={2}
//                     />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <Label htmlFor={`price-${index}`}>
//                         Price (₹) <span className="text-destructive">*</span>
//                       </Label>
//                       <Input
//                         id={`price-${index}`}
//                         type="number"
//                         value={item.price || ''}
//                         onChange={(e) =>
//                           handleSeedItemChange(index, 'price', parseFloat(e.target.value) || 0)
//                         }
//                         placeholder="0"
//                         min="0"
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label htmlFor={`imageUrl-${index}`}>Image URL</Label>
//                       <Input
//                         id={`imageUrl-${index}`}
//                         value={item.imageUrl}
//                         onChange={(e) => handleSeedItemChange(index, 'imageUrl', e.target.value)}
//                         placeholder="/images/dish.jpg"
//                       />
//                     </div>
//                   </div>

//                   <div className="flex gap-6">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`veg-${index}`}
//                         checked={item.veg}
//                         onCheckedChange={(checked) =>
//                           handleSeedItemChange(index, 'veg', checked)
//                         }
//                       />
//                       <Label htmlFor={`veg-${index}`} className="cursor-pointer">
//                         Vegetarian
//                       </Label>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`favorite-${index}`}
//                         checked={item.isAllTimeFavorite}
//                         onCheckedChange={(checked) =>
//                           handleSeedItemChange(index, 'isAllTimeFavorite', checked)
//                         }
//                       />
//                       <Label htmlFor={`favorite-${index}`} className="cursor-pointer">
//                         All-Time Favorite
//                       </Label>
//                     </div>

//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`special-${index}`}
//                         checked={item.isChefsSpecial}
//                         onCheckedChange={(checked) =>
//                           handleSeedItemChange(index, 'isChefsSpecial', checked)
//                         }
//                       />
//                       <Label htmlFor={`special-${index}`} className="cursor-pointer">
//                         Chef's Special
//                       </Label>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <div className="flex gap-3 mt-6">
//             <Button variant="outline" onClick={handleAddSeedItem} className="flex-1">
//               <Plus className="w-4 h-4 mr-2" />
//               Add Another Item
//             </Button>
//             <Button onClick={handleBulkUpload} disabled={uploading} className="flex-1">
//               {uploading ? 'Uploading...' : `Upload All (${seedItems.length} items)`}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default MenuManagement;






import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VegIndicator } from '@/components/VegIndicator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  veg: boolean;
  available: boolean;
  isChefsSpecial?: boolean;
  isAllTimeFavorite?: boolean;
  categoryId?: { _id: string; name: string };
}

interface SeedMenuItem {
  name: string;
  veg: boolean;
  category: string;
  description: string;
  price: number;
  isAllTimeFavorite: boolean;
  isChefsSpecial: boolean;
  imageUrl: string;
}

const CATEGORIES = [
  'Starters',
  'Main Course',
  'Desserts',
  'South Indian',
  'Coastal Specials',
  'Chinese',
  'Beverages',
  'Breads',
  'Rice',
  'Salads',
];

const MenuManagement = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSeedDialog, setShowSeedDialog] = useState(false);
  const [seedItems, setSeedItems] = useState<SeedMenuItem[]>([
    {
      name: '',
      veg: true,
      category: 'Starters',
      description: '',
      price: 0,
      isAllTimeFavorite: false,
      isChefsSpecial: false,
      imageUrl: '',
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    veg: true,
    available: true,
    isChefsSpecial: false,
    isAllTimeFavorite: false,
    category: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/menu');
      setMenuItems(response.data.items || response.data || []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login to continue');
        navigate('/admin/login');
      } else {
        toast.error('Failed to fetch menu items');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/admin/menu/${id}`);
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleAddSeedItem = () => {
    setSeedItems([
      ...seedItems,
      {
        name: '',
        veg: true,
        category: 'Starters',
        description: '',
        price: 0,
        isAllTimeFavorite: false,
        isChefsSpecial: false,
        imageUrl: '',
      },
    ]);
  };

  const handleRemoveSeedItem = (index: number) => {
    if (seedItems.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setSeedItems(seedItems.filter((_, i) => i !== index));
  };

  const handleSeedItemChange = (index: number, field: keyof SeedMenuItem, value: any) => {
    const updated = [...seedItems];
    updated[index] = { ...updated[index], [field]: value };
    setSeedItems(updated);
  };

  const handleBulkUpload = async () => {
    // Validate all items
    const invalidItems = seedItems.filter(
      (item) => !item.name || !item.description || item.price <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Please fill all required fields (name, description, price > 0)');
      return;
    }

    try {
      setUploading(true);
      const response = await api.post('/admin/menu/seed', { items: seedItems });
      
      toast.success(
        `${response.data.inserted} items added successfully: ${response.data.items.join(', ')}`
      );
      
      setShowSeedDialog(false);
      setSeedItems([
        {
          name: '',
          veg: true,
          category: 'Starters',
          description: '',
          price: 0,
          isAllTimeFavorite: false,
          isChefsSpecial: false,
          imageUrl: '',
        },
      ]);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload items');
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      veg: item.veg,
      available: item.available,
      isChefsSpecial: item.isChefsSpecial || false,
      isAllTimeFavorite: item.isAllTimeFavorite || false,
      category: item.categoryId?.name || '',
      imageUrl: '',
    });
    setShowEditDialog(true);
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    // Build payload with only modified fields
    const payload: any = {};
    
    if (editFormData.name !== editingItem.name) {
      payload.name = editFormData.name;
    }
    if (editFormData.description !== editingItem.description) {
      payload.description = editFormData.description;
    }
    if (editFormData.price !== editingItem.price) {
      payload.price = editFormData.price;
    }
    if (editFormData.veg !== editingItem.veg) {
      payload.veg = editFormData.veg;
    }
    if (editFormData.available !== editingItem.available) {
      payload.available = editFormData.available;
    }
    if (editFormData.isChefsSpecial !== (editingItem.isChefsSpecial || false)) {
      payload.isChefsSpecial = editFormData.isChefsSpecial;
    }
    if (editFormData.isAllTimeFavorite !== (editingItem.isAllTimeFavorite || false)) {
      payload.isAllTimeFavorite = editFormData.isAllTimeFavorite;
    }
    if (editFormData.category && editFormData.category !== editingItem.categoryId?.name) {
      payload.category = editFormData.category;
    }
    if (editFormData.imageUrl) {
      payload.imageUrl = editFormData.imageUrl;
    }

    // Check if there are any changes
    if (Object.keys(payload).length === 0) {
      toast.error('No changes detected');
      return;
    }

    try {
      setUploading(true);
      await api.patch(`/admin/menu/${editingItem._id}`, payload);
      
      toast.success('Menu item updated successfully');
      setShowEditDialog(false);
      setEditingItem(null);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setUploading(false);
    }
  };

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
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Menu Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Menu Items</CardTitle>
              <Button onClick={() => setShowSeedDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Items (Bulk Upload)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {menuItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-4">No menu items found</p>
                <p className="text-sm">Use the bulk upload to add menu items</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Badges</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <VegIndicator veg={item.veg} />
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.categoryId?.name || 'N/A'}</TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>
                          <Badge variant={item.available ? 'default' : 'secondary'}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.isChefsSpecial && (
                              <Badge variant="secondary" className="text-xs">Special</Badge>
                            )}
                            {item.isAllTimeFavorite && (
                              <Badge variant="secondary" className="text-xs">Favorite</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="icon" 
                              variant="ghost"
                              onClick={() => handleEditClick(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(item._id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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

      {/* Bulk Upload Dialog */}
      <Dialog open={showSeedDialog} onOpenChange={setShowSeedDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Upload Menu Items</DialogTitle>
            <DialogDescription>
              Add multiple menu items at once. Fill in the details for each item and click Upload All.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {seedItems.map((item, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                    {seedItems.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveSeedItem(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>
                        Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`name-${index}`}
                        value={item.name}
                        onChange={(e) => handleSeedItemChange(index, 'name', e.target.value)}
                        placeholder="e.g., Paneer Tikka"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`category-${index}`}>
                        Category <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) => handleSeedItemChange(index, 'category', value)}
                      >
                        <SelectTrigger id={`category-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => handleSeedItemChange(index, 'description', e.target.value)}
                      placeholder="Describe the dish..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`price-${index}`}>
                        Price (₹) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`price-${index}`}
                        type="number"
                        value={item.price || ''}
                        onChange={(e) =>
                          handleSeedItemChange(index, 'price', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`imageUrl-${index}`}>Image URL</Label>
                      <Input
                        id={`imageUrl-${index}`}
                        value={item.imageUrl}
                        onChange={(e) => handleSeedItemChange(index, 'imageUrl', e.target.value)}
                        placeholder="/images/dish.jpg"
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`veg-${index}`}
                        checked={item.veg}
                        onCheckedChange={(checked) =>
                          handleSeedItemChange(index, 'veg', checked)
                        }
                      />
                      <Label htmlFor={`veg-${index}`} className="cursor-pointer">
                        Vegetarian
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`favorite-${index}`}
                        checked={item.isAllTimeFavorite}
                        onCheckedChange={(checked) =>
                          handleSeedItemChange(index, 'isAllTimeFavorite', checked)
                        }
                      />
                      <Label htmlFor={`favorite-${index}`} className="cursor-pointer">
                        All-Time Favorite
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`special-${index}`}
                        checked={item.isChefsSpecial}
                        onCheckedChange={(checked) =>
                          handleSeedItemChange(index, 'isChefsSpecial', checked)
                        }
                      />
                      <Label htmlFor={`special-${index}`} className="cursor-pointer">
                        Chef's Special
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={handleAddSeedItem} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Item
            </Button>
            <Button onClick={handleBulkUpload} disabled={uploading} className="flex-1">
              {uploading ? 'Uploading...' : `Upload All (${seedItems.length} items)`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the menu item details. Only modified fields will be updated.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => handleEditFormChange('name', e.target.value)}
                placeholder="e.g., Paneer Tikka"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) => handleEditFormChange('category', value)}
              >
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => handleEditFormChange('description', e.target.value)}
                placeholder="Describe the dish..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editFormData.price || ''}
                  onChange={(e) =>
                    handleEditFormChange('price', parseFloat(e.target.value) || 0)
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-imageUrl">Image URL</Label>
                <Input
                  id="edit-imageUrl"
                  value={editFormData.imageUrl}
                  onChange={(e) => handleEditFormChange('imageUrl', e.target.value)}
                  placeholder="/images/dish.jpg"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-veg"
                  checked={editFormData.veg}
                  onCheckedChange={(checked) => handleEditFormChange('veg', checked)}
                />
                <Label htmlFor="edit-veg" className="cursor-pointer">
                  Vegetarian
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-available"
                  checked={editFormData.available}
                  onCheckedChange={(checked) => handleEditFormChange('available', checked)}
                />
                <Label htmlFor="edit-available" className="cursor-pointer">
                  Available
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-favorite"
                  checked={editFormData.isAllTimeFavorite}
                  onCheckedChange={(checked) =>
                    handleEditFormChange('isAllTimeFavorite', checked)
                  }
                />
                <Label htmlFor="edit-favorite" className="cursor-pointer">
                  All-Time Favorite
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-special"
                  checked={editFormData.isChefsSpecial}
                  onCheckedChange={(checked) =>
                    handleEditFormChange('isChefsSpecial', checked)
                  }
                />
                <Label htmlFor="edit-special" className="cursor-pointer">
                  Chef's Special
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)} 
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateItem} 
              disabled={uploading} 
              className="flex-1"
            >
              {uploading ? 'Updating...' : 'Update Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagement;