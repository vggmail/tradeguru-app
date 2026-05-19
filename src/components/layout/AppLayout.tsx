import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-tv-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e222d',
            border: '1px solid #2a2e39',
            color: '#d1d4dc',
          },
        }}
      />
    </div>
  );
}
