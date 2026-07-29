import { useState } from 'react';
import { Star, Trash2, MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { usePGReviews, useAddOrUpdateReview, useDeleteReview } from '@/hooks/useReview';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui';

interface ReviewSectionProps {
  pgId: string;
}

export function ReviewSection({ pgId }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuthStore();
  const { data, isLoading } = usePGReviews(pgId);
  const addOrUpdateReview = useAddOrUpdateReview(pgId);
  const deleteReview = useDeleteReview(pgId);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const reviews = data?.data?.reviews ?? [];
  const total = data?.data?.total ?? 0;
  const ratingDist = data?.data?.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Calculate average rating
  const totalSum = Object.entries(ratingDist).reduce((sum, [star, count]) => sum + Number(star) * count, 0);
  const avgRating = total > 0 ? (totalSum / total).toFixed(1) : '0.0';

  const userExistingReview = reviews.find((r) => r.user?._id === user?._id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await addOrUpdateReview.mutateAsync({ rating, comment });
    setComment('');
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 premium-shadow">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" />
            Student Reviews ({total})
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Real feedback from verified students
          </p>
        </div>

        {/* Action button */}
        {isAuthenticated && user?.role === 'student' && (
          <Button
            size="sm"
            onClick={() => {
              if (userExistingReview) {
                setRating(userExistingReview.rating);
                setComment(userExistingReview.comment);
              }
              setShowForm(!showForm);
            }}
            id="write-review-btn"
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm"
          >
            <Star className="h-4 w-4 fill-current" />
            {userExistingReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}
      </div>

      {/* Summary Ratings & Distribution Bars */}
      <div className="grid gap-6 sm:grid-cols-3 items-center rounded-xl bg-slate-50 p-5 border border-slate-100">
        {/* Rating Big Badge */}
        <div className="text-center sm:border-r sm:border-slate-200/80 pr-2">
          <div className="text-5xl font-black text-slate-900 tracking-tight">{avgRating}</div>
          <div className="my-1.5 flex justify-center gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(Number(avgRating)) ? 'fill-current text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 font-medium">{total} total review{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Rating Breakdown Progress Bars */}
        <div className="sm:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDist[stars] ?? 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 font-bold text-slate-700 flex items-center gap-1">
                  {stars} <Star className="h-3 w-3 fill-current text-amber-400" />
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium text-slate-500">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Write/Edit Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-5 space-y-4 animate-fade-in">
          <h3 className="font-bold text-slate-800 text-sm">
            {userExistingReview ? 'Update Your Rating & Review' : 'Rate & Share Your Experience'}
          </h3>

          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Rating</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-current text-amber-400 drop-shadow-sm'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-amber-600">
                {hoverRating || rating} / 5 Stars
              </span>
            </div>
          </div>

          <Textarea
            id="review-comment"
            label="Your Review"
            placeholder="Share details about cleanliness, room comfort, food quality, safety, or owner behaviour..."
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            minLength={5}
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={addOrUpdateReview.isPending}
              id="submit-review-btn"
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              {userExistingReview ? 'Update Review' : 'Submit Review'}
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4 divide-y divide-slate-100">
          {reviews.map((r) => {
            const isOwner = user?._id === r.user?._id;
            return (
              <div key={r._id} className="pt-4 first:pt-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs uppercase">
                      {r.user?.avatar ? (
                        <img src={r.user.avatar} alt={r.user.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        r.user?.name?.charAt(0) || <UserIcon className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm leading-tight">{r.user?.name || 'Anonymous Student'}</p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Stars & delete button */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                      <Star className="h-3 w-3 fill-current text-amber-400" />
                      {r.rating}.0
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => deleteReview.mutate(r._id)}
                        disabled={deleteReview.isPending}
                        title="Delete your review"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-650 leading-relaxed font-medium pl-12">
                  {r.comment}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center text-slate-400">
          <Star className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-medium">No reviews yet for this PG</p>
          <p className="text-xs text-slate-400 mt-0.5">Be the first student to leave a review!</p>
        </div>
      )}
    </div>
  );
}
