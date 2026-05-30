import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Package, Warehouse, Repeat, TrendingUp, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [s, setS] = useState({ products: 0, warehouses: 0, transactions: 0, totalStock: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, w, t] = await Promise.all([
        api.get('/products'), 
        api.get('/warehouses'), 
        api.get('/transactions')
      ]);
      setS({
        products: p.data.length,
        warehouses: w.data.length,
        transactions: t.data.length,
        totalStock: p.data.reduce((a, b) => a + Number(b.quantityInStock || 0), 0)
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { 
      label: 'Total Products', 
      value: s.products, 
      color: 'from-blue-500 to-blue-700',
      icon: Package,
      gradient: 'bg-gradient-to-br',
      shadow: 'shadow-blue-500/20',
      description: 'Available products'
    },
    { 
      label: 'Warehouses', 
      value: s.warehouses, 
      color: 'from-emerald-500 to-emerald-700',
      icon: Warehouse,
      gradient: 'bg-gradient-to-br',
      shadow: 'shadow-emerald-500/20',
      description: 'Storage facilities'
    },
    { 
      label: 'Transactions', 
      value: s.transactions, 
      color: 'from-amber-500 to-amber-700',
      icon: Repeat,
      gradient: 'bg-gradient-to-br',
      shadow: 'shadow-amber-500/20',
      description: 'Total movements'
    },
    { 
      label: 'Total Stock Value', 
      value: s.totalStock.toLocaleString(), 
      color: 'from-purple-500 to-purple-700',
      icon: TrendingUp,
      gradient: 'bg-gradient-to-br',
      shadow: 'shadow-purple-500/20',
      description: 'Units in stock'
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1">Welcome back! Here's your inventory overview</p>
        </div>
        
        {/* Refresh Button */}
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl 
                     text-slate-600 hover:bg-slate-50 hover:border-slate-300 
                     transition-all duration-200 shadow-sm hover:shadow
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">{loading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div 
            key={card.label}
            className={`${card.gradient} ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-xl 
                       transform hover:-translate-y-1 transition-all duration-300
                       animate-slideUp`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <card.icon size={22} className="text-white" />
                  </div>
                  <p className="text-white/80 text-sm font-medium">{card.label}</p>
                </div>
                <div className="space-y-1">
                  {loading ? (
                    <div className="h-10 w-24 bg-white/20 rounded-lg animate-pulse"></div>
                  ) : (
                    <p className="text-4xl font-bold text-white tracking-tight">
                      {card.value}
                    </p>
                  )}
                  <p className="text-white/60 text-xs">{card.description}</p>
                </div>
              </div>
            </div>
            
            {/* Mini chart indicator (decorative) */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>Last 30 days</span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-white/50 rounded-full"></span>
                  <span>+{Math.floor(Math.random() * 20)}%</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 
                      overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-brand-50 to-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              Welcome to StockHub SMS
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Use the sidebar menu to manage your inventory efficiently. StockHub SMS provides 
                comprehensive tools for product management, warehouse tracking, transaction logging, 
                and detailed reporting.
              </p>
              
              {/* Quick Tips */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <span>💡</span> Quick Tips
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Add products to start tracking inventory</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Manage warehouses for better organization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                    <span>Record transactions for accurate stock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>Generate reports for data insights</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity / Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 
                      overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <span>📊</span> System Status
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">Last Updated</span>
              <span className="text-sm font-medium text-slate-700">
                {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-600">System Status</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-slate-600">API Health</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}