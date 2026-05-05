import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PGCard from '@/features/pg/components/PGCard'
import { mockPG } from '@/test/mocks/handlers'

// Mock auth store — not authenticated
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => ({ isAuthenticated: false, user: null }),
}))

// Mock toggle save hook
vi.mock('@/features/pg/hooks/usePG', () => ({
  useToggleSave: () => ({ mutate: vi.fn(), isPending: false }),
}))

const createQC = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const renderCard = (pg = mockPG, isSaved = false) =>
  render(
    <QueryClientProvider client={createQC()}>
      <MemoryRouter>
        <PGCard pg={pg as Parameters<typeof PGCard>[0]['pg']} isSaved={isSaved} />
      </MemoryRouter>
    </QueryClientProvider>
  )

describe('PGCard', () => {
  it('renders the PG title', () => {
    renderCard()
    expect(screen.getByText(mockPG.title)).toBeInTheDocument()
  })

  it('renders the rent amount', () => {
    renderCard()
    expect(screen.getByText(/8,000/)).toBeInTheDocument()
  })

  it('renders availability badge', () => {
    renderCard()
    expect(screen.getByText(/5 Available/i)).toBeInTheDocument()
  })

  it('renders Co-ed badge for any gender', () => {
    renderCard()
    expect(screen.getByText('Co-ed')).toBeInTheDocument()
  })

  it('renders Full badge when not available', () => {
    renderCard({ ...mockPG, isAvailable: false, availableRooms: 0 })
    expect(screen.getByText('Full')).toBeInTheDocument()
  })

  it('does NOT render save button when not authenticated', () => {
    renderCard()
    expect(screen.queryByLabelText(/save listing/i)).not.toBeInTheDocument()
  })

  it('links to the PG detail page', () => {
    renderCard()
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', `/listings/${mockPG._id}`)
  })
})
