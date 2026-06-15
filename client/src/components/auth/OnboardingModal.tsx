import { useState } from 'react';
import { GraduationCap, Home, Phone, User, Check, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useAuth';

type Role = 'student' | 'owner';

interface OnboardingModalProps {
  onComplete?: () => void;
}

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const { user, accessToken, setAuth } = useAuthStore();
  const updateProfile = useUpdateProfile();

  // Determine which steps are needed
  const isPhoneUser = Boolean(user?.firebaseUid && !user?.email);
  const needsName = isPhoneUser && (!user?.name || user.name === '');
  const needsRole = isPhoneUser; // phone users skip role selection during login
  const needsPhone = !isPhoneUser && !user?.phone; // email users may need phone

  // Build the step list dynamically
  const steps: Array<'name' | 'role' | 'phone'> = [];
  if (needsName) steps.push('name');
  if (needsRole) steps.push('role');
  if (needsPhone) steps.push('phone');

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<Role>(user?.role || 'student');
  const [phone, setPhone] = useState(user?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [skippedPhone, setSkippedPhone] = useState(false);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const totalSteps = steps.length;

  if (!user || steps.length === 0) return null;

  const validatePhone = (val: string) => /^\+?[0-9]{10,15}$/.test(val.replace(/\s/g, ''));

  const handleNext = async () => {
    // Validate current step
    if (currentStep === 'name' && !name.trim()) return;
    if (currentStep === 'phone') {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length > 0 && !validatePhone(cleaned)) {
        setPhoneError('Enter a valid 10-digit number.');
        return;
      }
    }

    if (isLastStep) {
      await handleFinish();
    } else {
      setCurrentStepIndex((i) => i + 1);
    }
  };

  const handleSkipPhone = async () => {
    setSkippedPhone(true);
    await handleFinish(true);
  };

  const handleFinish = async (skipped = false) => {
    setSubmitting(true);
    try {
      const payload: { name?: string; role?: Role; phone?: string } = {};
      if (needsName) payload.name = name.trim();
      if (needsRole) payload.role = role;
      if (needsPhone && !skipped && phone) payload.phone = `+91${phone.replace(/\D/g, '')}`;

      const res = await updateProfile.mutateAsync(payload);
      if (accessToken) {
        setAuth(res.data.user, accessToken);
      }
      onComplete?.();
    } catch {
      // error is handled by mutation
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-500/15">
            <span className="text-xl">🏠</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Almost there!</h2>
          <p className="mt-1 text-slate-500 font-medium">Just a few quick details to get you started</p>
        </div>

        {/* Progress bar */}
        {totalSteps > 1 && (
          <div className="mb-6 flex items-center gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1.5 flex-1 rounded-full transition-all duration-500',
                  i < currentStepIndex
                    ? 'bg-blue-600'
                    : i === currentStepIndex
                    ? 'bg-blue-400'
                    : 'bg-slate-200',
                ].join(' ')}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-8 shadow-2xl premium-shadow">
          {/* ── Step: Name ─────────────────────────────────── */}
          {currentStep === 'name' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-150">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">What should we call you?</h3>
                <p className="mt-1 text-sm text-slate-500">Your name will appear on your profile and inquiries</p>
              </div>
              <div>
                <input
                  id="onboarding-name"
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && name.trim() && handleNext()}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-855 placeholder-slate-400 outline-none transition-all focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          )}

          {/* ── Step: Role ─────────────────────────────────── */}
          {currentStep === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-900">How will you use Anei Ghar?</h3>
                <p className="mt-1 text-sm text-slate-500">This helps us personalise your experience</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Student card */}
                <button
                  id="onboarding-role-student"
                  type="button"
                  onClick={() => setRole('student')}
                  className={[
                    'group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-left transition-all duration-200 cursor-pointer',
                    role === 'student'
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                      : 'border-slate-250 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {role === 'student' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    role === 'student' ? 'bg-blue-100 text-blue-750' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                  ].join(' ')}>
                    <GraduationCap className={['h-6 w-6', role === 'student' ? 'text-blue-600' : 'text-slate-500'].join(' ')} />
                  </div>
                  <div>
                    <div className={['font-bold text-sm text-center', role === 'student' ? 'text-blue-700' : 'text-slate-700'].join(' ')}>
                      Student
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 text-center leading-relaxed">
                      Looking for a PG to stay
                    </div>
                  </div>
                </button>

                {/* Owner card */}
                <button
                  id="onboarding-role-owner"
                  type="button"
                  onClick={() => setRole('owner')}
                  className={[
                    'group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-left transition-all duration-200 cursor-pointer',
                    role === 'owner'
                      ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                      : 'border-slate-250 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50',
                  ].join(' ')}
                >
                  {role === 'owner' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    role === 'owner' ? 'bg-blue-100 text-blue-755' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                  ].join(' ')}>
                    <Home className={['h-6 w-6', role === 'owner' ? 'text-blue-600' : 'text-slate-500'].join(' ')} />
                  </div>
                  <div>
                    <div className={['font-bold text-sm text-center', role === 'owner' ? 'text-blue-700' : 'text-slate-700'].join(' ')}>
                      Owner
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500 text-center leading-relaxed">
                      Listing my PG property
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step: Phone ────────────────────────────────── */}
          {currentStep === 'phone' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-150">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Add your phone number</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {role === 'owner'
                    ? 'Required so students can reach you about your listings'
                    : 'Owners will use this to follow up on your inquiries'}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                    🇮🇳 +91
                  </div>
                  <input
                    id="onboarding-phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setPhoneError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-855 placeholder-slate-400 outline-none transition-all focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
                    maxLength={10}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-500">⚠ {phoneError}</p>
                )}
              </div>
              {/* Role-specific info chip */}
              {role === 'owner' && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <span className="mt-0.5 text-amber-500">💡</span>
                  <p className="text-xs text-amber-800">Owners with a verified phone get 3× more inquiries</p>
                </div>
              )}
            </div>
          )}

          {/* ── Action buttons ─────────────────────────────── */}
          <div className={['mt-8', currentStep === 'phone' ? 'space-y-2' : ''].join(' ')}>
            <button
              id="onboarding-next-btn"
              onClick={handleNext}
              disabled={
                submitting ||
                (currentStep === 'name' && !name.trim()) ||
                (currentStep === 'phone' && phone.length > 0 && phone.length < 10)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-500/15 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 animate-pulse-glow cursor-pointer"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  {currentStep === 'phone' && !phone ? 'Finish without phone' : 'Finish Setup'}
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Skip phone (for email users) */}
            {currentStep === 'phone' && !skippedPhone && (
              <button
                id="onboarding-skip-phone"
                onClick={handleSkipPhone}
                disabled={submitting}
                className="w-full rounded-xl px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-slate-600 font-semibold cursor-pointer"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Step {currentStepIndex + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
