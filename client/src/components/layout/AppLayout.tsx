import { Outlet } from 'react-router-dom';
import { Sidebar, Topbar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
