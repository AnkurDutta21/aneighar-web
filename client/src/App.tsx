import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';
import { OnboardingModal } from '@/components/auth/OnboardingModal';
import { useAuthStore } from '@/stores/authStore';

// Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { PhoneLoginPage } from '@/pages/auth/PhoneLoginPage';
import { PGListPage } from '@/pages/pg/PGListPage';
import { PGDetailsPage } from '@/pages/pg/PGDetailsPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MyListingsPage } from '@/pages/dashboard/MyListingsPage';
import { NewPGPage } from '@/pages/dashboard/NewPGPage';
import { InquiriesPage } from '@/pages/dashboard/InquiriesPage';
import { SavedListingsPage } from '@/pages/dashboard/SavedListingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

/**
 * Shows the onboarding modal when user is authenticated but hasn't completed onboarding.
 * `isOnboarded === false` is strict — undefined (legacy users) is treated as onboarded.
 */
function OnboardingGate() {
  const { user, isAuthenticated } = useAuthStore();
  const needsOnboarding = isAuthenticated && user && user.isOnboarded === false;
  if (!needsOnboarding) return null;
  return <OnboardingModal />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/phone-login" element={<PhoneLoginPage />} />

          <Route element={<PublicLayout />}>
            <Route path="/pg" element={<PGListPage />} />
            <Route path="/pg/:id" element={<PGDetailsPage />} />
          </Route>

          {/* Protected routes (any authenticated user) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/inquiries" element={<InquiriesPage />} />

              {/* Student-only */}
              <Route element={<ProtectedRoute role="student" />}>
                <Route path="/dashboard/saved" element={<SavedListingsPage />} />
              </Route>

              {/* Owner-only */}
              <Route element={<ProtectedRoute role="owner" />}>
                <Route path="/dashboard/listings" element={<MyListingsPage />} />
                <Route path="/dashboard/listings/new" element={<NewPGPage />} />
                <Route path="/dashboard/listings/:id/edit" element={<NewPGPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global onboarding gate — renders over any page */}
        <OnboardingGate />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
