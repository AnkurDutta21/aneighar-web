import React from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin, Bed, Users, Phone, Mail, Wifi, AirVent, Car, Utensils, Dumbbell,
  Shield, WashingMachine, Droplets, Zap, Bookmark, BookmarkCheck,
  ArrowLeft, Eye, MessageSquare, Share2, Loader2
} from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { usePGDetail, useToggleSave, useCreateInquiry } from '@/features/pg/hooks/usePG'
import { useAuthStore } from '@/stores/auth.store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const amenityMap: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi:          { icon: <Wifi size={16} />,          label: 'WiFi' },
  ac:            { icon: <AirVent size={16} />,        label: 'AC' },
  parking:       { icon: <Car size={16} />,            label: 'Parking' },
  meals:         { icon: <Utensils size={16} />,       label: 'Meals' },
  gym:           { icon: <Dumbbell size={16} />,       label: 'Gym' },
  cctv:          { icon: <Shield size={16} />,         label: 'CCTV' },
  laundry:       { icon: <WashingMachine size={16} />, label: 'Laundry' },
  water_purifier:{ icon: <Droplets size={16} />,       label: 'Water Purifier' },
  power_backup:  { icon: <Zap size={16} />,            label: 'Power Backup' },
  housekeeping:  { icon: <Shield size={16} />,         label: 'Housekeeping' },
}

const inquirySchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(500),
  phone: z.string().optional(),
})
type InquiryInput = z.infer<typeof inquirySchema>

const PGDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, user } = useAuthStore()
  const { data: pg, isLoading, isError } = usePGDetail(id!)
  const toggleSave = useToggleSave()
  const createInquiry = useCreateInquiry()
  const [activeImg, setActiveImg] = React.useState(0)
  const [inquirySent, setInquirySent] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
  })

  const onInquiry = (data: InquiryInput) => {
    createInquiry.mutate(
      { pgId: id!, ...data },
      {
        onSuccess: () => {
          setInquirySent(true)
          reset()
        },
      }
    )
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="skeleton h-8 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/2 rounded" />
              <div className="skeleton h-32 rounded-xl" />
            </div>
            <div className="skeleton h-64 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    )
  }

  if (isError || !pg) {
    return (
      <MainLayout>
        <div className="glass-card p-16 text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-h2 text-white mb-2">PG not found</h2>
          <Link to="/listings" className="btn btn-primary mt-4">Browse Listings</Link>
        </div>
      </MainLayout>
    )
  }

  const images = pg.images.length > 0
    ? pg.images
    : [{ url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80', publicId: 'fallback' }]

  const genderLabel = { male: 'Boys Only', female: 'Girls Only', any: 'Co-ed' }

  return (
    <MainLayout>
      {/* Back */}
      <Link to="/listings" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Back to listings
      </Link>

      {/* Image Gallery */}
      <div className="mb-8 rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)' }}>
        <div className="relative" style={{ aspectRatio: '21/9' }}>
          <img
            src={images[activeImg]?.url}
            alt={`${pg.title} — image ${activeImg + 1}`}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  id={`gallery-dot-${i}`}
                  onClick={() => setActiveImg(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeImg ? 'bg-white scale-125' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.publicId}
                id={`gallery-thumb-${i}`}
                onClick={() => setActiveImg(i)}
                className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  i === activeImg ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-h1 text-white">{pg.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  id="share-btn"
                  onClick={() => navigator.share?.({ title: pg.title, url: window.location.href })}
                  className="btn btn-ghost btn-sm p-2"
                >
                  <Share2 size={16} />
                </button>
                {isAuthenticated && user?.role === 'student' && (
                  <button
                    id="save-detail-btn"
                    onClick={() => toggleSave.mutate(pg._id)}
                    className="btn btn-outline btn-sm"
                  >
                    {toggleSave.isPending ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Bookmark size={15} />
                    )}
                    Save
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin size={15} />
              <span className="text-sm">{pg.location.address}, {pg.location.city}, {pg.location.state} — {pg.location.pincode}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className={`badge ${pg.isAvailable ? 'badge-green' : 'badge-red'}`}>
                {pg.isAvailable ? `${pg.availableRooms} rooms available` : 'Currently Full'}
              </span>
              <span className="badge badge-blue">{genderLabel[pg.genderPreference]}</span>
              <span className="badge badge-blue capitalize">{pg.roomType} Room</span>
            </div>

            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Monthly Rent</p>
                <p className="text-2xl font-bold text-white">₹{pg.rent.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Deposit</p>
                <p className="text-2xl font-bold text-white">₹{pg.deposit.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Total Rooms</p>
                <p className="text-2xl font-bold text-white">{pg.totalRooms}</p>
              </div>
            </div>

            {/* Analytics */}
            <div className="flex gap-5 mt-5 pt-5" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Eye size={13} /> {pg.analytics.views} views
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <Bookmark size={13} /> {pg.analytics.saves} saves
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <MessageSquare size={13} /> {pg.analytics.inquiries} inquiries
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-h3 text-white mb-3">About this PG</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {pg.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="glass-card p-6">
            <h2 className="text-h3 text-white mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {pg.amenities.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span className="text-primary">{amenityMap[a]?.icon}</span>
                  {amenityMap[a]?.label || a}
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          {pg.rules?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-h3 text-white mb-4">House Rules</h2>
              <ul className="flex flex-col gap-2">
                {pg.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span className="text-primary mt-0.5">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map */}
          {pg.location.coordinates?.lat && pg.location.coordinates?.lng && (
            <div className="glass-card p-6">
              <h2 className="text-h3 text-white mb-4">Location</h2>
              <div className="rounded-xl overflow-hidden" style={{ height: 280 }}>
                <iframe
                  title="PG Location"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${pg.location.coordinates.lat},${pg.location.coordinates.lng}&z=15&output=embed`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Owner + Inquiry */}
        <div className="flex flex-col gap-4">
          {/* Owner Card */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Listed By</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                {pg.owner.name[0].toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{pg.owner.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>PG Owner</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a href={`mailto:${pg.owner.email}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                <Mail size={13} /> {pg.owner.email}
              </a>
              {pg.owner.phone && (
                <a href={`tel:${pg.owner.phone}`} className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
                  <Phone size={13} /> {pg.owner.phone}
                </a>
              )}
            </div>
          </div>

          {/* Inquiry Form */}
          {isAuthenticated && user?.role === 'student' ? (
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Send Inquiry</h3>
              {inquirySent ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-3">✅</div>
                  <p className="text-green-400 font-medium text-sm">Inquiry sent!</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    The owner will contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onInquiry)} className="flex flex-col gap-4" id="inquiry-form">
                  <div>
                    <label className="input-label">Your Message</label>
                    <textarea
                      id="inquiry-message"
                      rows={4}
                      placeholder="Hi, I'm interested in this PG. Could you share more details?"
                      className={`input resize-none ${errors.message ? 'error' : ''}`}
                      style={{ borderRadius: '0.75rem' }}
                      {...register('message')}
                    />
                    {errors.message && <p className="text-xs mt-1 text-red-400">{errors.message.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Phone <span className="text-gray-500">(optional)</span></label>
                    <input
                      id="inquiry-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="input"
                      {...register('phone')}
                    />
                  </div>
                  <button
                    id="send-inquiry-btn"
                    type="submit"
                    disabled={createInquiry.isPending}
                    className="btn btn-primary w-full"
                  >
                    {createInquiry.isPending ? (
                      <><Loader2 size={16} className="animate-spin" /> Sending...</>
                    ) : (
                      <><MessageSquare size={16} /> Send Inquiry</>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : !isAuthenticated ? (
            <div className="glass-card p-5 text-center">
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Login as a student to send an inquiry
              </p>
              <Link to="/login" className="btn btn-primary w-full">Login to Inquire</Link>
            </div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  )
}

export default PGDetailPage
