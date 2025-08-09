import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <AppNavbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}