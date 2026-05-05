import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginSchema, type LoginInput } from '@/features/auth/auth.types'
import { useLogin } from '@/features/auth/hooks/useAuth'

const LoginPage: React.FC = () => {
  const [showPass, setShowPass] = React.useState(false)
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = (data: LoginInput) => login.mutate(data)

  const apiError =
    login.error && (login.error as { response?: { data?: { message?: string } } }).response?.data?.message

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #0B3D91 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center shadow-glow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 9v13h18V9L12 2z" fill="white" opacity="0.9"/>
                <path d="M12 2L3 9l9-2 9 2L12 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">anieghar</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8"
          style={{ background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(24px)' }}
        >
          <h1 className="text-h2 text-white text-center mb-2">Welcome back</h1>
          <p className="text-center text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
            Login to your account
          </p>

          {apiError && (
            <div className="badge badge-red w-full text-center mb-6 py-3 rounded-xl text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" id="login-form">
            {/* Email */}
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-error)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`input pr-12 ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--color-error)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={login.isPending}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {login.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Logging in...</>
              ) : 'Login'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-light hover:text-white transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
