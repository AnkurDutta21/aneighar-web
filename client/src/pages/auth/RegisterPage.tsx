import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import logo from '@/assets/logo-dark.png';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  role: z.enum(['student', 'owner']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register_ = useRegister();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await register_.mutateAsync(data);
      navigate('/dashboard');
    } catch {
      // handled by mutation state
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-sky-500/5 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex justify-center">
            <Link to="/" className="hover:opacity-90 transition-opacity duration-200">
              <img src={logo} className="h-[64px] w-auto object-contain" alt="Anei Ghar Logo" />
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create your account</h1>
          <p className="mt-1 text-slate-500 font-medium">Join Anei Ghar — find or list PGs</p>
        </div>

        <div className="rounded-[20px] border border-slate-100 bg-white p-8 shadow-2xl premium-shadow">
          {register_.isError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(register_.error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.'}
            </div>
          )}

          {/* Phone sign-up button */}
          <button
            id="register-phone-btn"
            type="button"
            onClick={() => navigate('/phone-login')}
            className="group mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-750 transition-all duration-200 hover:border-blue-300 hover:bg-blue-100/60 hover:text-blue-800 hover:shadow-sm cursor-pointer"
          >
            <Phone className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
            Sign up with Phone Number
          </button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-slate-400 font-medium">or create account with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" id="register-form">
            <Input
              id="register-name"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="register-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="register-password"
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Select
              id="register-role"
              label="I am a..."
              error={errors.role?.message}
              options={[
                { value: 'student', label: '🎓 Student — Looking for a PG' },
                { value: 'owner', label: '🏠 Owner — Listing my PG' },
              ]}
              {...register('role')}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2 animate-pulse-glow"
              loading={register_.isPending}
              id="register-submit"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-650 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
