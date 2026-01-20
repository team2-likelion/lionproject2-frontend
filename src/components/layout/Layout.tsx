import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  onToggleDarkMode: () => void;
}

export default function Layout({ onToggleDarkMode }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar onToggleDarkMode={onToggleDarkMode} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
