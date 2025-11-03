import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
 
const Review = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table') || '';
  const navigate = useNavigate();
 
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    items: [],
    staffReview: { rating: 0, comment: '' },
    ambienceReview: { rating: 0, comment: '' },
    overallReview: { rating: 0, comment: '' },
    experience: '',
    suggestions: '',
  });
 
  // Fetch order details to display items
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        const order = res.data;
        setOrderDetails(order);
        setFormData((prev) => ({
          ...prev,
          items: order.items.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            rating: 0,
            comment: '',
          })),
        }));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load order details');
      }
    };
 
    fetchOrder();
  }, [orderId]);
 
  // Helper: update rating or comment for any section
  const handleRatingChange = (section, index, value) => {
    if (section === 'items') {
      setFormData((prev) => {
        const updated = [...prev.items];
        updated[index].rating = value;
        return { ...prev, items: updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], rating: value },
      }));
    }
  };
 
  const handleCommentChange = (section, index, value) => {
    if (section === 'items') {
      setFormData((prev) => {
        const updated = [...prev.items];
        updated[index].comment = value;
        return { ...prev, items: updated };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], comment: value },
      }));
    }
  };
 
  const handleSubmit = async (e) => {
  e.preventDefault();
 
  try {
    setLoading(true);
 
    // Construct payload according to backend schema
    const payload = {
      orderId,
      itemReviews: formData.items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        rating: item.rating,
        comment: item.comment,
      })),
      staffRating: formData.staffReview.rating,
      ambienceRating: formData.ambienceReview.rating,
      overallRating: formData.overallReview.rating,
      experience: formData.overallReview.comment || formData.experience,
      suggestions: formData.suggestions,
    };
 
    await api.post('/reviews', payload);
 
    toast.success('Thank you for your feedback!');
    navigate(`/order/${orderId}?table=${tableNumber}`);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Failed to submit review');
  } finally {
    setLoading(false);
  }
};
 
 
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Rate Your Experience</CardTitle>
          <CardDescription>We value your feedback on every part of your visit.</CardDescription>
        </CardHeader>
 
        <CardContent>
          {!orderDetails ? (
            <p className="text-center text-muted-foreground">Loading order details...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Item Reviews */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Food Items</h3>
                {formData.items.map((item, index) => (
                  <div key={item.menuItemId} className="border rounded-lg p-4 space-y-3">
                    <p className="font-medium">{item.name}</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          onClick={() => handleRatingChange('items', index, value)}
                          className={cn(
                            'w-6 h-6 cursor-pointer transition-colors',
                            item.rating >= value ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                          )}
                        />
                      ))}
                    </div>
                    <Textarea
                      placeholder={`Comment about ${item.name}...`}
                      value={item.comment}
                      onChange={(e) => handleCommentChange('items', index, e.target.value)}
                      rows={2}
                    />
                  </div>
                ))}
              </div>
 
              {/* Staff Review */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Staff Service</h3>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      onClick={() => handleRatingChange('staffReview', null, v)}
                      className={cn(
                        'w-6 h-6 cursor-pointer transition-colors',
                        formData.staffReview.rating >= v ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                      )}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Comments about staff..."
                  value={formData.staffReview.comment}
                  onChange={(e) => handleCommentChange('staffReview', null, e.target.value)}
                  rows={2}
                />
              </div>
 
              {/* Ambience Review */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Ambience</h3>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      onClick={() => handleRatingChange('ambienceReview', null, v)}
                      className={cn(
                        'w-6 h-6 cursor-pointer transition-colors',
                        formData.ambienceReview.rating >= v ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                      )}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Comments about ambience..."
                  value={formData.ambienceReview.comment}
                  onChange={(e) => handleCommentChange('ambienceReview', null, e.target.value)}
                  rows={2}
                />
              </div>
 
              {/* Overall Review */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Overall Experience</h3>
                <div className="flex gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      onClick={() => handleRatingChange('overallReview', null, v)}
                      className={cn(
                        'w-6 h-6 cursor-pointer transition-colors',
                        formData.overallReview.rating >= v ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                      )}
                    />
                  ))}
                </div>
                <Textarea
                  placeholder="Your overall experience..."
                  value={formData.overallReview.comment}
                  onChange={(e) => handleCommentChange('overallReview', null, e.target.value)}
                  rows={2}
                />
              </div>
 
              {/* Extra Suggestions */}
              <div>
                <h3 className="font-semibold text-lg mb-2">Suggestions</h3>
                <Textarea
                  placeholder="Any suggestions for us?"
                  value={formData.suggestions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, suggestions: e.target.value }))}
                  rows={3}
                />
              </div>
 
              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/order/${orderId}?table=${tableNumber}`)}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
 
export default Review;