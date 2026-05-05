import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from '@/pages/LoginPage'

// Mock useLogin hook
const mockMutate = vi.fn()
vi.mock('@/features/auth/hooks/useAuth', () => ({
  useLogin: () => ({ mutate: mockMutate, isPending: false, error: null }),
}))

const createQC = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderLogin = () =>
  render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument()
  })

  it('shows validation error for empty submission', async () => {
    renderLogin()
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'not-an-email')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
  })

  it('calls login mutate with valid credentials', async () => {
    renderLogin()
    await userEvent.type(screen.getByPlaceholderText(/you@example\.com/i), 'test@test.com')
    await userEvent.type(screen.getByPlaceholderText(/••••••••/), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: /login/i }))
    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password123!',
      })
    })
  })

  it('toggles password visibility', async () => {
    renderLogin()
    const passwordInput = screen.getByPlaceholderText(/••••••••/)
    expect(passwordInput).toHaveAttribute('type', 'password')
    await userEvent.click(screen.getByRole('button', { name: '' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('has link to register page', () => {
    renderLogin()
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register')
  })
})
