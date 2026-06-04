import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { InspiredPortfolioRoute } from '../features/site/InspiredPortfolioRoute';

function AdminShell() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white sm:px-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-cyan-300/20 bg-slate-900/85 p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">
          Protected Route
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Admin Control Room
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
          Firebase authentication, real-time Firestore editing, and knowledge
          base management will be added in the admin phase.
        </p>
      </div>
    </main>
  );
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <InspiredPortfolioRoute />,
  },
  {
    path: '/admin',
    element: <AdminShell />,
  },
];

export const router = createBrowserRouter(routes);
