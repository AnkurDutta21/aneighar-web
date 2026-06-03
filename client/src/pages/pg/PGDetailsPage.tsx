import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Wifi, Wind, Car, Utensils, Tv, Shield, Heart,
  ArrowLeft, BedDouble, MessageSquare, Phone, Eye,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePGListing } from '@/hooks/usePG';
import { useToggleSave, useCreateInquiry } from '@/hooks/useInquiry';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Badge, Skeleton } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { CreateInquiryPayload } from '@/types';

const amenityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  meals: <Utensils className="h-4 w-4" />,
  tv: <Tv className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
};

const inquirySchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
});
type InquiryFormData = z.infer<typeof inquirySchema>;

export function PGDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = usePGListing(id!);
  const toggleSave = useToggleSave();
  const createInquiry = useCreateInquiry();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useUIStore();
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      // Pre-fill phone from user profile — strip non-digits then reformat
      phone: user?.phone ?? '',
      message: '',
    },
  });

  const pg = data?.data.pg;

  const onInquiry = async (formData: InquiryFormData) => {
    if (!id) return;
    try {
      await createInquiry.mutateAsync({ pgId: id, ...formData } as CreateInquiryPayload);
      addToast({ title: 'Inquiry sent!', description: 'The owner will get back to you soon.', variant: 'success' });
      reset();
      setShowInquiryForm(false);
    } catch {
      addToast({ title: 'Failed to send inquiry', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-80 w-full rounded-2xl" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!pg) return (
    <div className="py-20 text-center">
      <p className="text-white/40">PG not found.</p>
      <Link to="/pg" className="mt-4 inline-block text-violet-400 hover:underline">← Back to listings</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/pg" className="mb-6 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-white/8">
        <div className="relative h-72 bg-gradient-to-br from-violet-900/20 to-slate-900 lg:h-96">
          {pg.images?.[activeImage] ? (
            <img
              src={pg.images[activeImage].url}
              alt={pg.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BedDouble className="h-20 w-20 text-white/10" />
            </div>
          )}
        </div>
        {pg.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-white/8 bg-white/5 p-3 scrollbar-hide">
            {pg.images.map((img, i) => (
              <button
                key={img.publicId}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${i === activeImage ? 'border-violet-500' : 'border-transparent'}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant={pg.availableRooms > 0 ? 'success' : 'destructive'}>
                {pg.availableRooms > 0 ? `${pg.availableRooms} rooms available` : 'No rooms available'}
              </Badge>
              <Badge variant="default">{pg.roomType} room</Badge>
              <Badge variant="outline">{pg.genderPreference === 'any' ? 'Co-ed' : pg.genderPreference === 'male' ? 'Males only' : 'Females only'}</Badge>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{pg.title}</h1>
            <div className="flex items-center gap-2 text-white/50">
              <MapPin className="h-4 w-4" />
              <span>{pg.location.address}, {pg.location.city}, {pg.location.state} - {pg.location.pincode}</span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
            <h2 className="mb-3 font-semibold text-white">About this PG</h2>
            <p className="text-sm leading-relaxed text-white/60">{pg.description}</p>
          </div>

          {/* Amenities */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
            <h2 className="mb-3 font-semibold text-white">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {pg.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">
                  {amenityIcons[a] || null}
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Eye className="h-4 w-4" />, value: pg.analytics?.views ?? 0, label: 'Views' },
              { icon: <MessageSquare className="h-4 w-4" />, value: pg.analytics?.inquiries ?? 0, label: 'Inquiries' },
              { icon: <Heart className="h-4 w-4" />, value: pg.analytics?.saves ?? 0, label: 'Saves' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                <div className="mb-1 flex justify-center text-violet-400">{s.icon}</div>
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/40">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Map placeholder */}
          {pg.location.coordinates && (
            <div className="rounded-2xl border border-white/8 overflow-hidden h-48 bg-white/5 flex items-center justify-center">
              <MapPin className="h-8 w-8 text-white/20" />
              <span className="ml-2 text-sm text-white/30">Map view available</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <div className="mb-4 text-center">
              <div className="text-4xl font-bold text-white">{formatCurrency(pg.rent)}</div>
              <div className="text-sm text-white/40">per month</div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
              <span className="text-white/50">Security Deposit</span>
              <span className="font-semibold text-white">{formatCurrency(pg.deposit)}</span>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
              <span className="text-white/50">Total Rooms</span>
              <span className="font-semibold text-white">{pg.totalRooms}</span>
            </div>
            <div className="space-y-2">
              {isAuthenticated && user?.role === 'student' && (
                <Button
                  className="w-full"
                  onClick={() => setShowInquiryForm(!showInquiryForm)}
                  id="inquiry-toggle"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Inquiry
                </Button>
              )}
              {isAuthenticated && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleSave.mutate(pg._id)}
                  id="save-pg-btn"
                >
                  <Heart className="h-4 w-4" />
                  Save Listing
                </Button>
              )}
              {!isAuthenticated && (
                <Link to="/login">
                  <Button className="w-full" id="login-to-inquire">
                    Sign in to Inquire
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          {showInquiryForm && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-fade-in">
              <h3 className="mb-4 font-semibold text-white">Send Inquiry</h3>
              <form onSubmit={handleSubmit(onInquiry)} className="space-y-3" id="inquiry-form">
                <Textarea
                  id="inquiry-message"
                  label="Your Message"
                  placeholder="I'm interested in this PG, I'd like to know more about..."
                  rows={4}
                  error={errors.message?.message}
                  {...register('message')}
                />
                <Input
                  id="inquiry-phone"
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.phone?.message}
                  readOnly={!!user?.phone}
                  className={user?.phone ? 'opacity-70 cursor-not-allowed' : ''}
                  {...register('phone')}
                />
                {user?.phone && (
                  <p className="-mt-1 text-xs text-white/30">Auto-filled from your profile</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  loading={createInquiry.isPending}
                  id="send-inquiry"
                >
                  Send Inquiry
                </Button>
              </form>
            </div>
          )}

          {/* Owner info (partial) */}
          {typeof pg.owner === 'object' && (
            <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white/60 uppercase tracking-wider">Listed by</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white font-semibold text-sm">
                  {pg.owner.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{pg.owner.name}</p>
                  <p className="text-xs text-white/40">PG Owner</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
