import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Wifi, Wind, Car, Utensils, Tv, Shield, Heart,
  ArrowLeft, BedDouble, MessageSquare, Phone, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePGListing } from '@/hooks/usePG';
import { useToggleSave, useCreateInquiry, useSavedListings } from '@/hooks/useInquiry';
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
  const [inquirySent, setInquirySent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  const { data: savedData } = useSavedListings({
    enabled: isAuthenticated && user?.role === 'student',
  });
  const savedListings = savedData?.data?.saved ?? [];
  const isSaved = savedListings.some((item: any) => item.pg?._id === id);

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
      reset();
      setShowInquiryForm(false);
      setInquirySent(true);
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
      <p className="text-slate-500">PG not found.</p>
      <Link to="/pg" className="mt-4 inline-block text-blue-600 hover:underline font-semibold">← Back to listings</Link>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Back */}
      <Link to="/pg" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-white premium-shadow">
        <div className="relative h-72 bg-slate-50 lg:h-96">
          {pg.images?.[activeImage] ? (
            <>
              <img
                src={pg.images[activeImage].url}
                alt={pg.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden absolute inset-0 flex items-center justify-center bg-slate-100">
                <BedDouble className="h-20 w-20 text-slate-200" />
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-100">
              <BedDouble className="h-20 w-20 text-slate-200" />
            </div>
          )}
        </div>
        {pg.images?.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50 p-3 scrollbar-hide">
            {pg.images.map((img, i) => (
              <button
                key={img.publicId}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 transition-all ${i === activeImage ? 'border-blue-600' : 'border-transparent'}`}
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
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{pg.title}</h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <MapPin className="h-4 w-4" />
              <span>{pg.location.address}, {pg.location.city}, {pg.location.state} - {pg.location.pincode}</span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow">
            <h2 className="mb-3 font-bold text-slate-800 text-lg">About this PG</h2>
            <p className="text-sm leading-relaxed text-slate-600">{pg.description}</p>
          </div>

          {/* Amenities */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow">
            <h2 className="mb-3 font-bold text-slate-800 text-lg">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {pg.amenities.map((a) => (
                <span key={a} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-700">
                  {amenityIcons[a] || null}
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </span>
              ))}
            </div>
          </div>

          {/* Location Map */}
          {pg.location.coordinates?.lat && pg.location.coordinates?.lng ? (
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white premium-shadow">
              <iframe
                title="PG Location Map"
                className="h-52 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${pg.location.coordinates.lat},${pg.location.coordinates.lng}&z=15&output=embed`}
              />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${pg.location.coordinates.lat},${pg.location.coordinates.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 py-2.5 text-xs text-slate-500 transition-colors hover:text-blue-600 font-semibold"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Google Maps
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-4 premium-shadow">
              <MapPin className="h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-bold text-slate-800">{pg.location.address}</p>
                <p className="text-xs text-slate-500">{pg.location.city}, {pg.location.state} – {pg.location.pincode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing Card */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow sticky top-24">
            <div className="mb-4 text-center">
              <div className="text-4xl font-black text-slate-900">{formatCurrency(pg.rent)}</div>
              <div className="text-sm text-slate-500">per month</div>
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm border border-slate-100">
              <span className="text-slate-500 font-medium">Security Deposit</span>
              <span className="font-bold text-slate-800">{formatCurrency(pg.deposit)}</span>
            </div>

            {/* Rent Breakdown */}
            {(() => {
              const ext = pg as unknown as { rentIncludes?: string[]; additionalCharges?: string };
              const included = ext.rentIncludes ?? [];
              const extras = ext.additionalCharges;
              if (included.length === 0 && !extras) return (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                  ⚠ Owner hasn't specified what's included. Ask before signing.
                </div>
              );
              return (
                <div className="mb-4 space-y-2">
                  {included.length > 0 && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">
                      <p className="text-xs font-bold text-emerald-700 mb-1.5">✓ Included in rent</p>
                      <div className="flex flex-wrap gap-1.5">
                        {included.map((item: string) => (
                          <span key={item} className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs capitalize text-emerald-800 font-medium">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {extras && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Additional charges</p>
                      <p className="text-xs text-slate-650 leading-relaxed">{extras}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm border border-slate-100">
              <span className="text-slate-500 font-medium">Total Rooms</span>
              <span className="font-bold text-slate-800">{pg.totalRooms}</span>
            </div>
            <div className="space-y-2">
              {isAuthenticated && user?.role === 'student' && !inquirySent && (
                <Button
                  className="w-full"
                  onClick={() => setShowInquiryForm(!showInquiryForm)}
                  id="inquiry-toggle"
                >
                  <MessageSquare className="h-4 w-4" />
                  {showInquiryForm ? 'Cancel' : 'Send Inquiry'}
                </Button>
              )}
              {inquirySent && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-150 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Inquiry submitted!</p>
                    <p className="mt-0.5 text-xs text-emerald-700/80">The owner will see your inquiry when they check their dashboard. You can track it in <a href="/dashboard/inquiries" className="underline hover:text-emerald-900">My Inquiries</a>.</p>
                  </div>
                </div>
              )}
              {isAuthenticated && user?.role === 'student' && (
                <Button
                  variant={isSaved ? "default" : "outline"}
                  className={`w-full transition-all duration-200 ${isSaved ? 'bg-red-50 hover:bg-red-100 text-red-600 border-red-100 hover:border-red-200' : ''}`}
                  onClick={() => toggleSave.mutate(pg._id)}
                  id="save-pg-btn"
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                  {isSaved ? 'Saved ✓' : 'Save Listing'}
                </Button>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="block w-full">
                  <Button className="w-full" id="login-to-inquire">
                    Sign in to Inquire
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          {showInquiryForm && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow animate-fade-in">
              <h3 className="mb-4 font-bold text-slate-800">Send Inquiry</h3>
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
                  className={user?.phone ? 'opacity-75 cursor-not-allowed' : ''}
                  {...register('phone')}
                />
                {user?.phone && (
                  <p className="-mt-1 text-xs text-slate-400">Auto-filled from your profile</p>
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

          {/* Owner info */}
          {typeof pg.owner === 'object' && (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 premium-shadow">
              <h3 className="mb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Listed by</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                  {pg.owner.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{pg.owner.name}</p>
                  <p className="text-xs text-slate-500">PG Owner</p>
                </div>
              </div>
              {/* WhatsApp quick contact — only visible to authenticated students */}
              {isAuthenticated && user?.role === 'student' && pg.owner.phone && (
                <a
                  href={`https://wa.me/${pg.owner.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I saw your PG listing "${pg.title}" on Anei Ghar and I'm interested. Could you share more details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="whatsapp-owner"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-250 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100/60"
                >
                  <Phone className="h-4 w-4" />
                  WhatsApp Owner
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
