import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import MainLayout from '@/layouts/MainLayout'
import { usePGDetail, useUpdatePG } from '@/features/pg/hooks/usePG'
import { useForm } from 'react-hook-form'

const EditPGPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: pg, isLoading } = usePGDetail(id!)
  const updatePG = useUpdatePG()

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {}
  })

  React.useEffect(() => {
    if (pg) {
      reset({
        title: pg.title,
        description: pg.description,
        rent: pg.rent,
        deposit: pg.deposit,
        totalRooms: pg.totalRooms,
        availableRooms: pg.availableRooms,
        genderPreference: pg.genderPreference,
        roomType: pg.roomType,
        isAvailable: pg.isAvailable,
      })
    }
  }, [pg, reset])

  const onSubmit = (data: Record<string, unknown>) => {
    updatePG.mutate({ id: id!, data }, { onSuccess: () => navigate('/dashboard/listings') })
  }

  if (isLoading) return (
    <MainLayout>
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    </MainLayout>
  )

  return (
    <MainLayout>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <h1 className="text-h1 text-white mb-8">Edit Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)} id="edit-pg-form" className="max-w-2xl flex flex-col gap-5">
        <div className="glass-card p-6 flex flex-col gap-4">
          <div>
            <label className="input-label">Title</label>
            <input id="edit-title" className="input" {...register('title')} />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea id="edit-desc" rows={5} className="input resize-none" style={{ borderRadius: '0.75rem' }} {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Monthly Rent (₹)</label>
              <input id="edit-rent" type="number" className="input" {...register('rent')} />
            </div>
            <div>
              <label className="input-label">Deposit (₹)</label>
              <input id="edit-deposit" type="number" className="input" {...register('deposit')} />
            </div>
            <div>
              <label className="input-label">Total Rooms</label>
              <input id="edit-total-rooms" type="number" className="input" {...register('totalRooms')} />
            </div>
            <div>
              <label className="input-label">Available Rooms</label>
              <input id="edit-avail-rooms" type="number" className="input" {...register('availableRooms')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Gender Preference</label>
              <select id="edit-gender" className="input" style={{ borderRadius: 'var(--radius-button)' }} {...register('genderPreference')}>
                <option value="any">Co-ed</option>
                <option value="male">Boys Only</option>
                <option value="female">Girls Only</option>
              </select>
            </div>
            <div>
              <label className="input-label">Room Type</label>
              <select id="edit-room-type" className="input" style={{ borderRadius: 'var(--radius-button)' }} {...register('roomType')}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
                <option value="dormitory">Dormitory</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input id="edit-available" type="checkbox" className="w-4 h-4 accent-primary" {...register('isAvailable')} />
            <label htmlFor="edit-available" className="text-sm text-gray-300 cursor-pointer">Mark as available</label>
          </div>
        </div>

        <button id="update-pg-btn" type="submit" disabled={updatePG.isPending} className="btn btn-primary btn-lg w-full max-w-xs">
          {updatePG.isPending ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Save Changes'}
        </button>
      </form>
    </MainLayout>
  )
}

export default EditPGPage
