import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
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
        if (res.data.user.role === 'owner') navigate('/dashboard')
        else navigate('/listings')
      },
    })
  }

  return (
    <div className="min-h-screen bg-bg relative flex items-center justify-center p-4 overflow-hidden fade-in">
      <div className="absolute inset-0 bg-[var(--background-image-gradient-subtle)] pointer-events-none" />
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-deep/20 rounded-full blur-[120px] pointer-events-none" />

      <Link to="/" className="absolute top-8 left-8 text-white font-bold text-xl tracking-tight no-underline z-20 flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-[#1E90FF] to-[#0B3D91] rounded-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2L3 9v13h18V9L12 2z" fill="white"/></svg>
        </div>
        <span>anei<span className="text-primary-light">ghar</span></span>
      </Link>

      <div className="glass-card w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Enter your details to access your account</p>
        </div>

        {login.error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-center text-center">
            {login.error.response?.data?.message || 'Login failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full bg-black/20 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all`}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs ml-1 mt-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full bg-black/20 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-3 pl-10 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all`}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs ml-1 mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-[var(--background-image-gradient-primary)] text-white font-semibold py-3.5 rounded-xl shadow-lg hover:shadow-primary/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {login.isPending ? 'Logging in...' : 'Log In'}
            {!login.isPending && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light hover:text-white font-medium transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
