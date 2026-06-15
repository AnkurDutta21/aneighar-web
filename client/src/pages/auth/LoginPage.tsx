import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLogin, useForgotPassword } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import logo from '@/assets/logo-dark.png';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const forgotPassword = useForgotPassword();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const [
    forgotMode, setForgotMode,
  ] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login.mutateAsync(data);
      navigate('/dashboard');
    } catch {
      // error handled by mutation
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail.trim()) return;
    setResetError('');
    setResetLoading(true);
    try {
      await forgotPassword.mutateAsync(resetEmail.trim());
      setResetSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to send reset email. Please try again.';
      setResetError(msg);
    } finally {
      setResetLoading(false);
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
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="mt-1 text-slate-500 font-medium">Sign in to your Anei Ghar account</p>
        </div>

        {/* Card */}
        <div className="rounded-[20px] border border-slate-100 bg-white p-8 shadow-2xl premium-shadow">
          {/* ── Forgot Password Sub-form ── */}
          {forgotMode ? (
            <div className="space-y-4">
              <button
                onClick={() => { setForgotMode(false); setResetSent(false); setResetError(''); }}
                className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800 font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Reset your password</h2>
                <p className="mt-1 text-sm text-slate-500">We'll send a reset link to your email.</p>
              </div>
              {resetSent ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Reset link sent!</p>
                    <p className="mt-0.5 text-xs text-emerald-700/80">Check your inbox (and spam folder) for the link.</p>
                  </div>
                </div>
              ) : (
                <>
                  <Input
                    id="reset-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                    autoFocus
                  />
                  {resetError && (
                    <p className="text-xs text-red-500">⚠ {resetError}</p>
                  )}
                  <Button
                    type="button"
                    size="lg"
                    className="w-full animate-pulse-glow"
                    onClick={handleResetPassword}
                    loading={resetLoading}
                    id="send-reset-btn"
                  >
                    Send Reset Link
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
          {login.isError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          {/* Phone OTP Button */}
          <button
            id="login-phone-btn"
            type="button"
            onClick={() => navigate('/phone-login')}
            className="group mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-750 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100/60 hover:shadow-sm cursor-pointer"
          >
            <Phone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Continue with Phone Number
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400 font-medium">or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="login-form">
            <Input
              id="login-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <div>
              <Input
                id="login-password"
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  id="forgot-password-btn"
                  onClick={() => { setForgotMode(true); setResetEmail(''); setResetSent(false); }}
                  className="text-xs text-slate-400 transition-colors hover:text-blue-600 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 animate-pulse-glow"
              loading={login.isPending}
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-650 hover:text-blue-700">
              Create one
            </Link>
          </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
