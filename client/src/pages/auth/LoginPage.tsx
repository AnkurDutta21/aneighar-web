import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import logo from '@/assets/logo.png';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(222,47%,6%)] p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <img src={logo} className="h-8 w-8 object-contain" alt="Anei Ghar Logo" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-white/50">Sign in to your Anei Ghar account</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          {login.isError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {(login.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid credentials. Please try again.'}
            </div>
          )}

          {/* Phone OTP Button */}
          <button
            id="login-phone-btn"
            type="button"
            onClick={() => navigate('/phone-login')}
            className="group mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-violet-500/40 bg-violet-600/10 px-4 py-3 text-sm font-semibold text-violet-300 transition-all duration-200 hover:border-violet-500/70 hover:bg-violet-600/20 hover:text-violet-200 hover:shadow-lg hover:shadow-violet-500/10"
          >
            <Phone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Continue with Phone Number
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-transparent px-3 text-xs text-white/30">or sign in with email</span>
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
            <Input
              id="login-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={login.isPending}
              id="login-submit"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-violet-400 hover:text-violet-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
