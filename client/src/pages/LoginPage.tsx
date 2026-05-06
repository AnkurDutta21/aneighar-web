import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useLogin } from '@/features/auth/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type LoginInput = z.infer<typeof loginSchema>

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)
  const login = useLogin()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    login.mutate(data, {
      onSuccess: (res) => {
        navigate(res.data.user.role === 'owner' ? '/dashboard' : '/listings')
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/12 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-orb" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none animate-orb delay-300" />

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
      <div className="glass-card w-full max-w-md p-8 sm:p-10 relative z-10 animate-scale-in border-white/10 shadow-2xl shadow-black/40">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary mb-4 shadow-lg shadow-primary-glow/30">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-h2 text-white mb-2">Welcome back</h1>
          <p className="text-text-secondary">Sign in to your Anei Ghar account</p>
        </div>

        {/* Error */}
        {login.error && (
          <div className="flex items-center gap-2 bg-error/10 border border-error/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6">
            <span>⚠</span>
            {(login.error as any).response?.data?.message || 'Invalid credentials. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full bg-white/4 border rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? 'border-error/50 focus:ring-error/20'
                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/15'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error flex items-center gap-1 ml-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full bg-white/4 border rounded-xl py-3 pl-10 pr-11 text-white placeholder:text-text-muted text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? 'border-error/50 focus:ring-error/20'
                    : 'border-white/10 focus:border-primary/50 focus:ring-primary/15'
                }`}
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
            {errors.password && (
              <p className="text-xs text-error flex items-center gap-1 ml-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={login.isPending}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-primary shadow-lg shadow-primary-glow/25 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1"
          >
            {login.isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in...</>
            ) : (
              <>Sign In <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light font-semibold hover:text-white transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
