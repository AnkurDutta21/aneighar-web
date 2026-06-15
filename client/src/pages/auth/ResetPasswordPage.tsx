import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useResetPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import logo from '@/assets/logo-dark.png';

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setErrorMsg('Invalid or missing reset token.');
      return;
    }
    setErrorMsg('');
    try {
      await resetPassword.mutateAsync({ token, password: data.password });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to reset password. The link might be invalid or expired.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex justify-center">
            <Link to="/" className="hover:opacity-90 transition-opacity duration-200">
              <img src={logo} className="h-[64px] w-auto object-contain" alt="Anei Ghar Logo" />
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Reset Password</h1>
          <p className="mt-1 text-slate-500 font-medium">Enter a secure new password for your account</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-8 shadow-2xl premium-shadow">
          {success ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-250 bg-emerald-50 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-550" />
                <div>
                  <h3 className="text-sm font-bold text-emerald-800">Password reset successful!</h3>
                  <p className="mt-1 text-xs text-emerald-700/80">
                    Your password has been updated. You can now log in with your new password.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="lg"
                className="w-full mt-2"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="reset-password-form">
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              <Input
                id="reset-password-new"
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                id="reset-password-confirm"
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2 animate-pulse-glow"
                loading={isSubmitting}
                id="reset-submit-btn"
              >
                Reset Password
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition-colors hover:text-slate-800 font-medium"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
