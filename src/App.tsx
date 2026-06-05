import { RouterProvider } from 'react-router-dom';

import { AppProviders } from './app/providers';
import { router } from './app/router';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
      <div className="landscape-lock-overlay">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        <h2>Rotate your device</h2>
        <p>This experience is designed for landscape mode.</p>
      </div>
    </AppProviders>
  );
}
