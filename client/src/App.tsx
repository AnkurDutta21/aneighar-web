import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'

// Lazy-loaded pages
const HomePage       = lazy(() => import('@/pages/HomePage'))
const LoginPage      = lazy(() => import('@/pages/LoginPage'))
const RegisterPage   = lazy(() => import('@/pages/RegisterPage'))
const ListingsPage   = lazy(() => import('@/pages/ListingsPage'))
const PGDetailPage   = lazy(() => import('@/pages/PGDetailPage'))
const SavedPage      = lazy(() => import('@/pages/SavedPage'))
const InquiriesPage  = lazy(() => import('@/pages/InquiriesPage'))
const DashboardPage  = lazy(() => import('@/pages/dashboard/DashboardPage'))
const MyListingsPage = lazy(() => import('@/pages/dashboard/MyListingsPage'))
const NewPGPage      = lazy(() => import('@/pages/dashboard/NewPGPage'))
const EditPGPage     = lazy(() => import('@/pages/dashboard/EditPGPage'))
const OwnerInquiries = lazy(() => import('@/pages/dashboard/OwnerInquiriesPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center app-bg">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center animate-pulse">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 9v13h18V9L12 2z" fill="white"/>
        </svg>
      </div>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
    </div>
  </div>
)

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<HomePage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<PGDetailPage />} />

        {/* Student only */}
        <Route path="/saved" element={
          <ProtectedRoute allowedRoles={['student']}>
            <SavedPage />
          </ProtectedRoute>
        }/>
        <Route path="/my-inquiries" element={
          <ProtectedRoute allowedRoles={['student']}>
            <InquiriesPage />
          </ProtectedRoute>
        }/>

        {/* Owner only */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <DashboardPage />
          </ProtectedRoute>
        }/>
        <Route path="/dashboard/listings" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <MyListingsPage />
          </ProtectedRoute>
        }/>
        <Route path="/dashboard/listings/new" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <NewPGPage />
          </ProtectedRoute>
        }/>
        <Route path="/dashboard/listings/:id/edit" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <EditPGPage />
          </ProtectedRoute>
        }/>
        <Route path="/dashboard/inquiries" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerInquiries />
          </ProtectedRoute>
        }/>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)

export default App
