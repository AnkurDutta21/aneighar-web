/**
 * Navigation type definitions — all route param lists.
 * These enable full TypeScript type safety across all navigation calls.
 */

// ─── Root Stack ───────────────────────────────────────────────────────────────
export type RootStackParamList = {
  // Public screens
  Home: undefined;
  Login: undefined;
  Register: undefined;
  PhoneLogin: undefined;
  ResetPassword: { token: string };

  // PG browsing (public)
  PGList: { city?: string } | undefined;
  PGDetail: { id: string };

  // Auth post-registration
  Onboarding: undefined;

  // Protected — App tab navigator
  AppTabs: undefined;
};

// ─── App Tab Navigator ────────────────────────────────────────────────────────
export type AppTabParamList = {
  HomeTab: undefined;
  BrowseTab: undefined;
  DashboardTab: undefined;
  InquiriesTab: undefined;
  SavedTab: undefined;      // student only
  ListingsTab: undefined;   // owner only
  ProfileTab: undefined;
};

// ─── Dashboard Stack (nested inside AppTabs) ──────────────────────────────────
export type DashboardStackParamList = {
  Dashboard: undefined;
  MyListings: undefined;
  NewPG: { id?: string };   // id present = edit mode
  Inquiries: undefined;
  Saved: undefined;
};
