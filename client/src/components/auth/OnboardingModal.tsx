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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(222,47%,4%)]/90 backdrop-blur-sm p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <span className="text-xl">🏠</span>
          </div>
          <h2 className="text-xl font-bold text-white">Almost there!</h2>
          <p className="mt-1 text-sm text-white/50">Just a few quick details to get you started</p>
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
                    ? 'bg-violet-500'
                    : i === currentStepIndex
                    ? 'bg-violet-400'
                    : 'bg-white/10',
                ].join(' ')}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-[hsl(222,47%,8%)] p-8 shadow-2xl">
          {/* ── Step: Name ─────────────────────────────────── */}
          {currentStep === 'name' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20 ring-1 ring-violet-500/30">
                  <User className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">What should we call you?</h3>
                <p className="mt-1 text-sm text-white/40">Your name will appear on your profile and inquiries</p>
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
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          )}

          {/* ── Step: Role ─────────────────────────────────── */}
          {currentStep === 'role' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">How will you use Anei Ghar?</h3>
                <p className="mt-1 text-sm text-white/40">This helps us personalise your experience</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {/* Student card */}
                <button
                  id="onboarding-role-student"
                  type="button"
                  onClick={() => setRole('student')}
                  className={[
                    'group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-left transition-all duration-200',
                    role === 'student'
                      ? 'border-violet-500/70 bg-violet-600/15 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                  ].join(' ')}
                >
                  {role === 'student' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    role === 'student' ? 'bg-violet-500/30' : 'bg-white/10 group-hover:bg-white/15',
                  ].join(' ')}>
                    <GraduationCap className={['h-6 w-6', role === 'student' ? 'text-violet-300' : 'text-white/60'].join(' ')} />
                  </div>
                  <div>
                    <div className={['font-semibold text-sm', role === 'student' ? 'text-violet-200' : 'text-white/80'].join(' ')}>
                      Student
                    </div>
                    <div className="mt-0.5 text-xs text-white/40 leading-relaxed">
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
                    'group relative flex flex-col items-center gap-3 rounded-2xl border p-6 text-left transition-all duration-200',
                    role === 'owner'
                      ? 'border-violet-500/70 bg-violet-600/15 shadow-lg shadow-violet-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8',
                  ].join(' ')}
                >
                  {role === 'owner' && (
                    <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    role === 'owner' ? 'bg-violet-500/30' : 'bg-white/10 group-hover:bg-white/15',
                  ].join(' ')}>
                    <Home className={['h-6 w-6', role === 'owner' ? 'text-violet-300' : 'text-white/60'].join(' ')} />
                  </div>
                  <div>
                    <div className={['font-semibold text-sm', role === 'owner' ? 'text-violet-200' : 'text-white/80'].join(' ')}>
                      Owner
                    </div>
                    <div className="mt-0.5 text-xs text-white/40 leading-relaxed">
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
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20 ring-1 ring-violet-500/30">
                  <Phone className="h-6 w-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Add your phone number</h3>
                <p className="mt-1 text-sm text-white/40">
                  {role === 'owner'
                    ? 'Required so students can reach you about your listings'
                    : 'Owners will use this to follow up on your inquiries'}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white/60">
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
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20"
                    maxLength={10}
                  />
                </div>
                {phoneError && (
                  <p className="text-xs text-red-400">⚠ {phoneError}</p>
                )}
              </div>
              {/* Role-specific info chip */}
              {role === 'owner' && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                  <span className="mt-0.5 text-amber-400">💡</span>
                  <p className="text-xs text-amber-300/80">Owners with a verified phone get 3× more inquiries</p>
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:bg-violet-500 hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="w-full rounded-xl px-4 py-2.5 text-sm text-white/30 transition-colors hover:text-white/50"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/20">
          Step {currentStepIndex + 1} of {totalSteps}
        </p>
      </div>
    </div>
  );
}
