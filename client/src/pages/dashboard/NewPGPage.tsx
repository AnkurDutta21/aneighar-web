import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Upload, X, ArrowLeft } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { useCreatePG, useUploadImages } from '@/features/pg/hooks/usePG'

const pgSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  rent: z.coerce.number().min(1, 'Rent is required'),
  deposit: z.coerce.number().min(0),
  genderPreference: z.enum(['male', 'female', 'any']),
  roomType: z.enum(['single', 'double', 'triple', 'dormitory']),
  totalRooms: z.coerce.number().min(1),
  availableRooms: z.coerce.number().min(0),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
})

type PGFormInput = z.infer<typeof pgSchema>

const AMENITIES = [
  'wifi', 'ac', 'parking', 'laundry', 'meals',
  'gym', 'cctv', 'housekeeping', 'water_purifier', 'power_backup'
]

const NewPGPage: React.FC = () => {
  const navigate = useNavigate()
  const createPG = useCreatePG()
  const uploadImages = useUploadImages()
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([])
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<PGFormInput>({
    resolver: zodResolver(pgSchema),
    defaultValues: { deposit: 0, genderPreference: 'any', roomType: 'single' },
  })

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    )

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const combined = [...imageFiles, ...files].slice(0, 10)
    setImageFiles(combined)
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)))
  }

  const removeImage = (i: number) => {
    const updated = imageFiles.filter((_, idx) => idx !== i)
    setImageFiles(updated)
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)))
  }

  const onSubmit = async (data: PGFormInput) => {
    const payload = {
      ...data,
      location: {
        address: data.address,
        city: data.city.toLowerCase(),
        state: data.state,
        pincode: data.pincode,
      },
      amenities: selectedAmenities,
      rules: data.rules ? data.rules.split('\n').filter(Boolean) : [],
      isAvailable: true,
    }

    createPG.mutate(payload as Parameters<typeof createPG.mutate>[0], {
      onSuccess: async (pg) => {
        if (imageFiles.length > 0) {
          const formData = new FormData()
          imageFiles.forEach((f) => formData.append('images', f))
          await uploadImages.mutateAsync({ id: pg._id, formData })
        }
        navigate('/dashboard/listings')
      },
    })
  }

  const InputError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs mt-1 text-red-400">{msg}</p> : null

  return (
    <MainLayout>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="text-h1 text-white mb-8">Add New Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)} id="new-pg-form" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Form */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Basic Info */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-h3 text-white">Basic Information</h2>
            <div>
              <label className="input-label">Listing Title</label>
              <input id="pg-title" className={`input ${errors.title ? 'error' : ''}`} placeholder="e.g. Cozy PG near BITS Pilani" {...register('title')} />
              <InputError msg={errors.title?.message} />
            </div>
            <div>
              <label className="input-label">Description</label>
              <textarea id="pg-desc" rows={5} className={`input resize-none ${errors.description ? 'error' : ''}`} style={{ borderRadius: '0.75rem' }}
                placeholder="Describe your PG — facilities, nearby landmarks, rules..." {...register('description')} />
              <InputError msg={errors.description?.message} />
            </div>
          </div>

          {/* Location */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-h3 text-white">Location</h2>
            <div>
              <label className="input-label">Address</label>
              <input id="pg-address" className={`input ${errors.address ? 'error' : ''}`} placeholder="123 Main Street, Area" {...register('address')} />
              <InputError msg={errors.address?.message} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">City</label>
                <input id="pg-city" className={`input ${errors.city ? 'error' : ''}`} placeholder="Mumbai" {...register('city')} />
                <InputError msg={errors.city?.message} />
              </div>
              <div>
                <label className="input-label">State</label>
                <input id="pg-state" className={`input ${errors.state ? 'error' : ''}`} placeholder="Maharashtra" {...register('state')} />
                <InputError msg={errors.state?.message} />
              </div>
            </div>
            <div>
              <label className="input-label">Pincode</label>
              <input id="pg-pincode" className={`input w-40 ${errors.pincode ? 'error' : ''}`} placeholder="400001" maxLength={6} {...register('pincode')} />
              <InputError msg={errors.pincode?.message} />
            </div>
          </div>

          {/* Pricing */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-h3 text-white">Pricing & Rooms</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Monthly Rent (₹)</label>
                <input id="pg-rent" type="number" min={0} className={`input ${errors.rent ? 'error' : ''}`} placeholder="8000" {...register('rent')} />
                <InputError msg={errors.rent?.message} />
              </div>
              <div>
                <label className="input-label">Security Deposit (₹)</label>
                <input id="pg-deposit" type="number" min={0} className="input" placeholder="16000" {...register('deposit')} />
              </div>
              <div>
                <label className="input-label">Total Rooms</label>
                <input id="pg-total-rooms" type="number" min={1} className={`input ${errors.totalRooms ? 'error' : ''}`} placeholder="10" {...register('totalRooms')} />
                <InputError msg={errors.totalRooms?.message} />
              </div>
              <div>
                <label className="input-label">Available Rooms</label>
                <input id="pg-avail-rooms" type="number" min={0} className={`input ${errors.availableRooms ? 'error' : ''}`} placeholder="5" {...register('availableRooms')} />
                <InputError msg={errors.availableRooms?.message} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h2 className="text-h3 text-white">Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Gender Preference</label>
                <select id="pg-gender" className="input cursor-pointer" style={{ borderRadius: 'var(--radius-button)' }} {...register('genderPreference')}>
                  <option value="any">Co-ed (Any)</option>
                  <option value="male">Boys Only</option>
                  <option value="female">Girls Only</option>
                </select>
              </div>
              <div>
                <label className="input-label">Room Type</label>
                <select id="pg-room-type" className="input cursor-pointer" style={{ borderRadius: 'var(--radius-button)' }} {...register('roomType')}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="triple">Triple</option>
                  <option value="dormitory">Dormitory</option>
                </select>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="glass-card p-6">
            <h2 className="text-h3 text-white mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  id={`amenity-${a}`}
                  onClick={() => toggleAmenity(a)}
                  className={`btn btn-sm capitalize ${selectedAmenities.includes(a) ? 'btn-primary' : 'btn-outline'}`}
                >
                  {a.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div className="glass-card p-6">
            <h2 className="text-h3 text-white mb-4">House Rules <span className="text-gray-500 text-sm font-normal">(optional)</span></h2>
            <textarea id="pg-rules" rows={4} className="input resize-none" style={{ borderRadius: '0.75rem' }}
              placeholder="One rule per line:&#10;No smoking&#10;Gates close at 10PM&#10;No guests after 8PM"
              {...register('rules')} />
          </div>
        </div>

        {/* Right: Images & Submit */}
        <div className="flex flex-col gap-4">
          {/* Image Upload */}
          <div className="glass-card p-5">
            <h2 className="text-h3 text-white mb-4">Photos</h2>
            <label
              htmlFor="pg-images"
              className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all hover:border-primary"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Upload size={28} className="text-gray-400" />
              <div className="text-center">
                <p className="text-sm text-white">Click to upload images</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  JPG, PNG, WebP — max 5MB each, up to 10
                </p>
              </div>
              <input id="pg-images" type="file" multiple accept="image/*" className="hidden" onChange={handleImageSelect} />
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      id={`remove-img-${i}`}
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                <label htmlFor="pg-images" className="flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
                  style={{ borderColor: 'var(--color-border)', aspectRatio: '1' }}>
                  <Plus size={20} className="text-gray-400" />
                </label>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            id="submit-pg-btn"
            type="submit"
            disabled={createPG.isPending || uploadImages.isPending}
            className="btn btn-primary btn-lg w-full"
          >
            {createPG.isPending || uploadImages.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Publishing...</>
            ) : (
              <><Plus size={18} /> Publish Listing</>
            )}
          </button>

          {createPG.isError && (
            <p className="text-xs text-red-400 text-center">
              Failed to create listing. Please try again.
            </p>
          )}
        </div>
      </form>
    </MainLayout>
  )
}

export default NewPGPage
