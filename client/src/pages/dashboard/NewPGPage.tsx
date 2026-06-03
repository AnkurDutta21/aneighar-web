import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePG, useUpdatePG, usePGListing, useUploadImages, useDeleteImage } from '@/hooks/usePG';
import { useUIStore } from '@/stores/uiStore';
import type { PGImage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, ArrowRight, Upload, Check, X, Loader2, Trash2, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const AMENITY_OPTIONS = [
  'wifi', 'ac', 'parking', 'meals', 'tv', 'security',
  'laundry', 'gym', 'garden', 'cctv', 'power-backup',
];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  address: z.string().min(5, 'Address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  rent: z.coerce.number().min(500, 'Rent must be at least ₹500'),
  deposit: z.coerce.number().min(0, 'Deposit cannot be negative'),
  genderPreference: z.enum(['male', 'female', 'any']),
  roomType: z.enum(['single', 'double', 'triple', 'dormitory']),
  totalRooms: z.coerce.number().min(1, 'At least 1 room'),
  availableRooms: z.coerce.number().min(0),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
});
type FormData = z.infer<typeof schema>;

const STEPS = ['Basic Info', 'Location', 'Pricing & Rooms', 'Amenities', 'Images'];

const stepFields: (keyof FormData)[][] = [
  ['title', 'description'],
  ['address', 'city', 'state', 'pincode'],
  ['rent', 'deposit', 'genderPreference', 'roomType', 'totalRooms', 'availableRooms'],
  ['amenities'],
  [],
];

// ─── Loading Overlay ──────────────────────────────────────────────────────────
function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(222,47%,4%)]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-white/10 bg-[hsl(222,47%,8%)] px-10 py-8 shadow-2xl">
        {/* Spinning ring */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-white/10" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-violet-500" />
          <div className="absolute inset-2 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400" />
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-white">{message}</p>
          <p className="mt-1 text-sm text-white/40">Please don't close or refresh this page</p>
        </div>
        {/* Animated progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="h-full animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-violet-500" />
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
interface StepIndicatorProps {
  currentStep: number;
  maxVisited: number;
  steps: string[];
  onStepClick: (index: number) => void;
  disabled: boolean;
}

function StepIndicator({ currentStep, maxVisited, steps, onStepClick, disabled }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isVisited = i <= maxVisited;
        const isClickable = isVisited && !disabled && i !== currentStep;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick(i)}
                disabled={!isClickable}
                title={isVisited ? step : undefined}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-medium transition-all duration-300',
                  isCompleted
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : isCurrent
                    ? 'border-violet-500 bg-violet-500/20 text-violet-400'
                    : 'border-white/20 bg-transparent text-white/30',
                  isClickable && 'cursor-pointer hover:scale-110 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/20',
                  !isClickable && 'cursor-default',
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <span
                className={cn(
                  'mt-1 hidden text-xs sm:block transition-colors',
                  isCurrent ? 'text-violet-300 font-medium' : isVisited ? 'text-white/60' : 'text-white/30'
                )}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 mb-4 h-0.5 flex-1 transition-all duration-500',
                  i < currentStep ? 'bg-violet-600' : 'bg-white/10'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function NewPGPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const { data: existingData } = usePGListing(id ?? '');
  const existing = existingData?.data?.pg;

  const createPG = useCreatePG();
  const updatePG = useUpdatePG();
  const uploadImages = useUploadImages();
  const deleteImage = useDeleteImage();
  const { addToast } = useUIStore();

  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Track which publicId is currently being deleted for per-image loading state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Local mirror of existing images so deletes reflect instantly without refetch lag
  const [existingImages, setExistingImages] = useState<PGImage[]>([]);

  const isSubmitting = createPG.isPending || updatePG.isPending || uploadImages.isPending;

  const handleDeleteExistingImage = async (publicId: string) => {
    if (!id) return;
    setDeletingId(publicId);
    try {
      await deleteImage.mutateAsync({ id, publicId });
      setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    } catch {
      addToast({ title: 'Failed to delete image', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const loadingMessage = uploadImages.isPending
    ? `Uploading ${selectedFiles.length} image${selectedFiles.length !== 1 ? 's' : ''}…`
    : isEdit
    ? 'Updating your listing…'
    : 'Creating your listing…';

  // Block browser tab close / refresh while submitting
  useEffect(() => {
    if (!isSubmitting) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isSubmitting]);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      title: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      rent: 0,
      deposit: 0,
      genderPreference: 'any',
      roomType: 'single',
      totalRooms: 1,
      availableRooms: 0,
      amenities: [],
    },
  });

  // Populate form in edit mode
  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description,
        address: existing.location.address,
        city: existing.location.city,
        state: existing.location.state,
        pincode: existing.location.pincode,
        rent: existing.rent,
        deposit: existing.deposit,
        genderPreference: existing.genderPreference,
        roomType: existing.roomType,
        totalRooms: existing.totalRooms,
        availableRooms: existing.availableRooms,
        amenities: existing.amenities,
      });
      setExistingImages(existing.images ?? []);
      setMaxVisited(STEPS.length - 1); // all steps unlocked in edit mode
    }
  }, [existing, reset]);

  // ── Navigation helpers ───────────────────────────────────────────────────
  const goToStep = useCallback(
    async (target: number) => {
      if (isSubmitting) return;
      if (target < step) {
        setStep(target);
      } else if (target > step && target <= maxVisited) {
        const valid = await trigger(stepFields[step] as (keyof FormData)[]);
        if (valid) setStep(target);
      }
    },
    [isSubmitting, step, maxVisited, trigger]
  );

  const nextStep = async () => {
    const valid = await trigger(stepFields[step] as (keyof FormData)[]);
    if (valid) {
      const next = Math.min(step + 1, STEPS.length - 1);
      setStep(next);
      setMaxVisited((prev) => Math.max(prev, next));
    }
  };

  const prevStep = () => {
    if (isSubmitting) return;
    setStep((s) => Math.max(s - 1, 0));
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    const payload = {
      title: data.title,
      description: data.description,
      location: {
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      rent: data.rent,
      deposit: data.deposit,
      genderPreference: data.genderPreference,
      roomType: data.roomType,
      totalRooms: data.totalRooms,
      availableRooms: data.availableRooms,
      amenities: data.amenities,
    };

    const uploadIfAny = async (pgId: string) => {
      if (selectedFiles.length === 0) return;
      try {
        await uploadImages.mutateAsync({ id: pgId, files: selectedFiles });
      } catch {
        addToast({
          title: 'Images failed to upload.',
          description: 'You can retry from the Edit Listing page.',
          variant: 'destructive',
        });
      }
    };

    try {
      if (isEdit && id) {
        await updatePG.mutateAsync({ id, payload });
        await uploadIfAny(id);
        addToast({ title: 'Listing updated!', variant: 'success' });
      } else {
        const res = await createPG.mutateAsync(payload);
        const newId = res.data?.pg?._id;
        if (newId) await uploadIfAny(newId);
        addToast({ title: 'Listing created!', description: 'Your PG is now live.', variant: 'success' });
      }
      navigate('/dashboard/listings');
    } catch {
      addToast({ title: 'Failed to save listing', variant: 'destructive' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSelectedFiles((prev) => [...prev, ...files].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Loading overlay — covers screen and blocks all interaction */}
      {isSubmitting && <LoadingOverlay message={loadingMessage} />}

      <div className="mx-auto max-w-2xl animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-white/20">/</span>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? 'Edit PG Listing' : 'Add New PG Listing'}
          </h1>
        </div>

        <StepIndicator
          currentStep={step}
          maxVisited={maxVisited}
          steps={STEPS}
          onStepClick={goToStep}
          disabled={isSubmitting}
        />

        <form
          onSubmit={handleSubmit(onSubmit as never)}
          id="pg-form"
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
        >
          <Card>
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    id="pg-title"
                    label="PG Title"
                    placeholder="e.g. Bright & Spacious PG in HSR Layout"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                  <Textarea
                    id="pg-description"
                    label="Description"
                    placeholder="Describe your PG — location benefits, nearby colleges, house rules..."
                    rows={5}
                    error={errors.description?.message}
                    {...register('description')}
                  />
                </CardContent>
              </>
            )}

            {/* Step 1: Location */}
            {step === 1 && (
              <>
                <CardHeader><CardTitle>Location Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    id="pg-address"
                    label="Street Address"
                    placeholder="123 Main Street, near XYZ College"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="pg-city"
                      label="City"
                      placeholder="Bangalore"
                      error={errors.city?.message}
                      {...register('city')}
                    />
                    <Input
                      id="pg-state"
                      label="State"
                      placeholder="Karnataka"
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>
                  <Input
                    id="pg-pincode"
                    label="Pincode"
                    placeholder="560001"
                    maxLength={6}
                    error={errors.pincode?.message}
                    {...register('pincode')}
                  />
                </CardContent>
              </>
            )}

            {/* Step 2: Pricing & Rooms */}
            {step === 2 && (
              <>
                <CardHeader><CardTitle>Pricing & Room Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="pg-rent"
                      label="Monthly Rent (₹)"
                      type="number"
                      placeholder="8000"
                      error={errors.rent?.message}
                      {...register('rent')}
                    />
                    <Input
                      id="pg-deposit"
                      label="Security Deposit (₹)"
                      type="number"
                      placeholder="16000"
                      error={errors.deposit?.message}
                      {...register('deposit')}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                      id="pg-gender"
                      label="Gender Preference"
                      error={errors.genderPreference?.message}
                      options={[
                        { value: 'any', label: 'Any (Co-ed)' },
                        { value: 'male', label: 'Males Only' },
                        { value: 'female', label: 'Females Only' },
                      ]}
                      {...register('genderPreference')}
                    />
                    <Select
                      id="pg-room-type"
                      label="Room Type"
                      error={errors.roomType?.message}
                      options={[
                        { value: 'single', label: 'Single' },
                        { value: 'double', label: 'Double Sharing' },
                        { value: 'triple', label: 'Triple Sharing' },
                        { value: 'dormitory', label: 'Dormitory' },
                      ]}
                      {...register('roomType')}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      id="pg-total-rooms"
                      label="Total Rooms"
                      type="number"
                      placeholder="10"
                      error={errors.totalRooms?.message}
                      {...register('totalRooms')}
                    />
                    <Input
                      id="pg-available-rooms"
                      label="Available Rooms"
                      type="number"
                      placeholder="3"
                      error={errors.availableRooms?.message}
                      {...register('availableRooms')}
                    />
                  </div>
                </CardContent>
              </>
            )}

            {/* Step 3: Amenities */}
            {step === 3 && (
              <>
                <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                <CardContent>
                  {errors.amenities && (
                    <p className="mb-3 text-xs text-red-400">{errors.amenities.message}</p>
                  )}
                  <Controller
                    name="amenities"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2">
                        {AMENITY_OPTIONS.map((amenity) => {
                          const selected = (field.value ?? []).includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => {
                                const current = field.value ?? [];
                                field.onChange(
                                  selected
                                    ? current.filter((a) => a !== amenity)
                                    : [...current, amenity]
                                );
                              }}
                              className={cn(
                                'rounded-xl border px-4 py-2 text-sm font-medium capitalize transition-all duration-200',
                                selected
                                  ? 'border-violet-500/50 bg-violet-500/20 text-violet-300'
                                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
                              )}
                              id={`amenity-${amenity}`}
                            >
                              {selected && <Check className="mr-1 inline h-3 w-3" />}
                              {amenity.replace('-', ' ')}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                </CardContent>
              </>
            )}

            {/* Step 4: Images */}
            {step === 4 && (
              <>
                <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                <CardContent className="space-y-5">

                  {/* ── Existing images (edit mode only) ───────────────── */}
                  {isEdit && existingImages.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-medium text-white/60">Current images</p>
                      <div className="grid grid-cols-3 gap-3">
                        {existingImages.map((img) => (
                          <div key={img.publicId} className="relative group">
                            <img
                              src={img.url}
                              alt="listing"
                              className={cn(
                                'h-24 w-full rounded-xl object-cover transition-opacity',
                                deletingId === img.publicId && 'opacity-40'
                              )}
                            />
                            {/* Delete button */}
                            <button
                              type="button"
                              disabled={deletingId !== null}
                              onClick={() => handleDeleteExistingImage(img.publicId)}
                              className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100 disabled:cursor-not-allowed"
                            >
                              {deletingId === img.publicId ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 shadow">
                                  <Trash2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state for edit with no images */}
                  {isEdit && existingImages.length === 0 && (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-6 text-center">
                      <ImageIcon className="h-8 w-8 text-white/20" />
                      <p className="text-sm text-white/40">No images yet — add some below</p>
                    </div>
                  )}

                  {/* ── New image upload dropzone ───────────────────────── */}
                  <div>
                    {isEdit && <p className="mb-3 text-sm font-medium text-white/60">Add new images</p>}
                    {!isEdit && selectedFiles.length === 0 && (
                      <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
                        <Upload className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>Listings with photos get significantly more views. Add at least one image.</p>
                      </div>
                    )}

                    <label
                      htmlFor="pg-images"
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-8 cursor-pointer hover:border-violet-500/40 hover:bg-white/8 transition-all"
                    >
                      <Upload className="h-8 w-8 text-white/30" />
                      <div className="text-center">
                        <p className="font-medium text-white/60">Click to upload images</p>
                        <p className="text-xs text-white/30 mt-1">PNG, JPG, WEBP · up to 10 MB · max 5 files</p>
                      </div>
                      <input
                        id="pg-images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>

                    {selectedFiles.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {selectedFiles.map((file, i) => (
                          <div key={i} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-24 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    id="pg-submit-btn"
                  >
                    {isSubmitting
                      ? loadingMessage
                      : isEdit
                      ? selectedFiles.length > 0
                        ? `Save & Upload ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`
                        : 'Save Changes'
                      : selectedFiles.length > 0
                      ? `Create Listing with ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`
                      : 'Create Without Images'}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 0 || isSubmitting}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button type="button" onClick={nextStep} disabled={isSubmitting} id="pg-next-btn">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
