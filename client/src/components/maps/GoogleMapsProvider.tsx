import { APIProvider } from '@vis.gl/react-google-maps';
import type { ReactNode } from 'react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

interface GoogleMapsProviderProps {
  children: ReactNode;
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  if (!API_KEY || API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    // Render children without Maps support — components will show fallback UI
    return <>{children}</>;
  }
  return (
    <APIProvider apiKey={API_KEY} libraries={['places', 'geocoding', 'marker']}>
      {children}
    </APIProvider>
  );
}
