import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, Lock, GraduationCap, Building2, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRegister } from '@/features/auth/hooks/useAuth'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'owner']),
})
type RegisterInput = z.infer<typeof registerSchema>

const InputField: React.FC<{
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}> = ({ icon, error, children }) => (
  <div className="flex flex-col gap-1.5">
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">{icon}</div>
      {children}
    </div>
    {error && <p className="text-xs text-error ml-1">{error}</p>}
  </div>
)

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegister()
  const navigate = useNavigate()

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')

  const onSubmit = (data: RegisterInput) => {
    registerMutation.mutate(data, {
      onSuccess: (res) => {
        navigate(res.data.user.role === 'owner' ? '/dashboard' : '/listings')
      },
    })
  }

  const inputClass = (hasError: boolean) =>
    `w-full bg-white/4 border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
      hasError
        ? 'border-error/50 focus:ring-error/20'
        : 'border-white/10 focus:border-primary/50 focus:ring-primary/15'
    }`

  return (
    <div className="min-h-screen bg-bg relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-orb" />
      <div className="absolute -bottom-64 -left-64 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none animate-orb delay-400" />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Back to home */}
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2.5 no-underline group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 9v13h6v-6h6v6h6V9L12 2z" fill="white" />
            </svg>
          </div>
        </div>
        <span className="font-bold text-xl tracking-tight text-white">
          anei<span className="gradient-text">ghar</span>
        </span>
      </Link>

      {/* Card */}
      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10 animate-scale-in border-white/10 shadow-2xl shadow-black/40 my-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h2 text-white mb-2">Create Your Account</h1>
          <p className="text-text-secondary">Join thousands finding great PGs</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {([
            { val: 'student', label: 'I\'m a Student', sub: 'Looking for PG', icon: GraduationCap, grad: 'from-blue-500 to-cyan-400' },
            { val: 'owner', label: 'I\'m an Owner', sub: 'Listing property', icon: Building2, grad: 'from-emerald-500 to-teal-400' },
          ] as const).map(({ val, label, sub, icon: Icon, grad }) => (
            <button
              key={val}
              type="button"
              onClick={() => setValue('role', val)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                selectedRole === val
                  ? 'border-primary bg-primary/12 shadow-md shadow-primary-glow/15'
                  : 'border-white/8 bg-white/2 text-text-secondary hover:border-white/15 hover:bg-white/4'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <div className={`text-sm font-semibold ${selectedRole === val ? 'text-white' : 'text-text-secondary'}`}>{label}</div>
                <div className="text-xs text-text-muted">{sub}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Error */}
        {registerMutation.error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
            <span>⚠</span>
            {(registerMutation.error as any).response?.data?.message || 'Registration failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Full Name</label>
            <InputField icon={<User size={16} />} error={errors.name?.message}>
              <input
                type="text"
                placeholder="John Doe"
                className={inputClass(!!errors.name)}
                {...register('name')}
              />
            </InputField>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Email Address</label>
            <InputField icon={<Mail size={16} />} error={errors.email?.message}>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass(!!errors.email)}
                {...register('email')}
              />
            </InputField>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                className={`${inputClass(!!errors.password)} pr-11`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-error ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-primary shadow-lg shadow-primary-glow/25 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
          >
            {registerMutation.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Creating account...</>
            ) : (
              <>Create Account <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light font-semibold hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
