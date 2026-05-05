import React from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Building2, GraduationCap } from 'lucide-react'
import { registerSchema, type RegisterInput } from '@/features/auth/auth.types'
import { useRegister } from '@/features/auth/hooks/useAuth'

const RegisterPage: React.FC = () => {
  const [showPass, setShowPass] = React.useState(false)
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'student' },
  })

  const selectedRole = watch('role')
  const onSubmit = (data: RegisterInput) => registerMutation.mutate(data)

  const apiError =
    registerMutation.error &&
    (registerMutation.error as { response?: { data?: { message?: string } } }).response?.data?.message

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #1E90FF 0%, #0B3D91 100%)' }}
    >
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="relative w-full max-w-md fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 9v13h18V9L12 2z" fill="white" opacity="0.9"/>
                <path d="M12 2L3 9l9-2 9 2L12 2z" fill="white"/>
              </svg>
            </div>
            <span className="text-white text-2xl font-semibold tracking-tight">anieghar</span>
          </div>
        </div>

        <div className="glass-card p-8"
          style={{ background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(24px)' }}
        >
          <h1 className="text-h2 text-white text-center mb-2">Create Account</h1>
          <p className="text-center text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Register your account
          </p>

          {/* Role Selector — matches Figma */}
          <div className="flex gap-3 mb-6" role="group" aria-label="Account type">
            <button
              id="role-owner-btn"
              type="button"
              onClick={() => setValue('role', 'owner')}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                selectedRole === 'owner'
                  ? 'border-primary bg-primary/15 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <Building2 size={22} />
              <span className="text-sm font-medium">Owner</span>
            </button>
            <button
              id="role-student-btn"
              type="button"
              onClick={() => setValue('role', 'student')}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all duration-200 ${
                selectedRole === 'student'
                  ? 'border-primary bg-primary/15 text-white'
                  : 'border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              <GraduationCap size={22} />
              <span className="text-sm font-medium">Student</span>
            </button>
          </div>

          {apiError && (
            <div className="badge badge-red w-full text-center mb-5 py-3 rounded-xl text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" id="register-form">
            <div>
              <label htmlFor="reg-name" className="input-label">Full Name</label>
              <input
                id="reg-name"
                type="text"
                placeholder="John Doe"
                className={`input ${errors.name ? 'error' : ''}`}
                {...register('name')}
              />
              {errors.name && <p className="text-xs mt-1.5 text-red-400">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-email" className="input-label">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'error' : ''}`}
                {...register('email')}
              />
              {errors.email && <p className="text-xs mt-1.5 text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="reg-phone" className="input-label">
                Phone <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="reg-phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="input"
                {...register('phone')}
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  className={`input pr-12 ${errors.password ? 'error' : ''}`}
                  {...register('password')}
                />
                <button
                  type="button"
                  id="reg-toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1.5 text-red-400">{errors.password.message}</p>}
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={registerMutation.isPending}
              className="btn btn-primary btn-lg w-full mt-2"
            >
              {registerMutation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Creating Account...</>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:text-white transition-colors font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
