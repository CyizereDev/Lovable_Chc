import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  Repeat, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  UserCircle
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/products', label: 'Products', icon: Package },
    { to: '/warehouses', label: 'Warehouses', icon: Warehouse },
    { to: '/transactions', label: 'Transactions', icon: Repeat },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
  ];
  
  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-30
        w-72 h-screen bg-gradient-to-b from-slate-900 to-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-2xl
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">StockHub SMS</h1>
              <p className="text-xs text-slate-400">Inventory Management</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="mx-4 mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-500/20 rounded-full flex items-center justify-center">
                <UserCircle size={24} className="text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.username}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-4 mt-6 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-500/20' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <link.icon size={20} className={`transition-transform group-hover:scale-110 ${sidebarOpen ? '' : 'lg:mx-auto'}`} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       text-red-300 hover:text-white hover:bg-red-500/20
                       transition-all duration-200 group"
          >
            <LogOut size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-lg">📦</span>
              </div>
              <h2 className="text-lg font-bold text-slate-800">StockHub SMS</h2>
            </div>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="px-4 md:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-slate-500">
              <span>© 2026 StockHub Ltd — Kigali, Rwanda</span>
              <div className="flex gap-4">
                <span>📞 +250 788 123 456</span>
                <span>✉️ support@stockhub.rw</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}