import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reports() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState({ stockIn: [], stockOut: [], available: [] });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadReports();
  }, [period]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/' + period);
      setData(response.data);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to load reports' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const Section = ({ title, rows, cols, icon }) => {
    // Format column headers for display
    const formatHeader = (col) => {
      const headers = {
        'productCode': 'Product Code',
        'productName': 'Product Name',
        'quantityInStock': 'In Stock',
        'unitPrice': 'Unit Price',
        'transactionDate': 'Date',
        'warehouseName': 'Warehouse',
        'quantityMoved': 'Quantity'
      };
      return headers[col] || col;
    };

    // Format cell values
    const formatValue = (col, value) => {
      if (col === 'unitPrice' && value) {
        return `$${parseFloat(value).toFixed(2)}`;
      }
      if (col === 'transactionDate' && value) {
        return new Date(value).toLocaleDateString();
      }
      return value;
    };

    const totalValue = col => {
      if (col === 'quantityMoved') {
        return rows.reduce((sum, r) => sum + (r[col] || 0), 0);
      }
      if (col === 'unitPrice') {
        return rows.reduce((sum, r) => sum + (r[col] || 0), 0);
      }
      return null;
    };

    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                {title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {rows.length} record{rows.length !== 1 ? 's' : ''} found
              </p>
            </div>
            {rows.length > 0 && (
              <div className="text-sm bg-blue-50 px-3 py-1 rounded-lg">
                Total: {totalValue('quantityMoved') || rows.length}
              </div>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-3 text-slate-500">Loading data...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-6xl mb-3 inline-block">📊</span>
            <p className="text-slate-500 text-lg mb-2">No data available</p>
            <p className="text-slate-400 text-sm">No records found for this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                <tr>
                  {cols.map(col => (
                    <th key={col} className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {formatHeader(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                    {cols.map(col => (
                      <td key={col} className="px-6 py-4 text-sm text-slate-600">
                        {formatValue(col, row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {cols.includes('quantityMoved') && rows.length > 0 && (
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={cols.length - 1} className="px-6 py-3 text-sm font-semibold text-slate-700 text-right">
                      Total Quantity:
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-blue-600">
                      {rows.reduce((sum, r) => sum + (r.quantityMoved || 0), 0)}
                    </td>
                  </tr>
                </tfoot>
              )}
              {cols.includes('unitPrice') && cols.includes('quantityInStock') && rows.length > 0 && (
                <tfoot className="bg-slate-50 border-t border-slate-200">
                  <tr>
                    <td colSpan={cols.length - 1} className="px-6 py-3 text-sm font-semibold text-slate-700 text-right">
                      Total Value:
                    </td>
                    <td className="px-6 py-3 text-sm font-bold text-green-600">
                      ${rows.reduce((sum, r) => sum + ((r.quantityInStock || 0) * (r.unitPrice || 0)), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    );
  };

  // Calculate summary statistics
  const totalStockValue = data.available.reduce((sum, p) => sum + ((p.quantityInStock || 0) * (p.unitPrice || 0)), 0);
  const totalStockIn = data.stockIn.reduce((sum, t) => sum + (t.quantityMoved || 0), 0);
  const totalStockOut = data.stockOut.reduce((sum, t) => sum + (t.quantityMoved || 0), 0);
  const netMovement = totalStockIn - totalStockOut;

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Reports & Analytics</h2>
            <p className="text-slate-300">View inventory reports and track stock movements</p>
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl 
                     font-medium hover:bg-slate-100 transition-all duration-200 shadow-lg"
          >
            <span className="text-xl">🖨️</span>
            <span>Print Report</span>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{data.available.length}</p>
            <p className="text-xs text-slate-300 mt-1">Total Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-300">${totalStockValue.toFixed(2)}</p>
            <p className="text-xs text-slate-300 mt-1">Inventory Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-300">{totalStockIn}</p>
            <p className="text-xs text-slate-300 mt-1">Stock IN ({period})</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-300">{totalStockOut}</p>
            <p className="text-xs text-slate-300 mt-1">Stock OUT ({period})</p>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {msg.text && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg animate-slideInRight
                      ${msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <div className="flex items-center gap-2">
            <span>{msg.type === 'success' ? '✓' : '⚠'}</span>
            <span>{msg.text}</span>
          </div>
        </div>
      )}

      {/* Period Selection Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Select Report Period
          </h3>
          <p className="text-white/80 text-sm mt-1">
            Choose a time period to view inventory movement reports
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {['daily', 'weekly', 'monthly'].map(p => (
              <button 
                key={p} 
                onClick={() => setPeriod(p)}
                className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200
                  ${period === p 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                {p === 'daily' && '📅 Daily'}
                {p === 'weekly' && '📊 Weekly'}
                {p === 'monthly' && '📈 Monthly'}
              </button>
            ))}
          </div>
          
          {/* Period Info */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span>ℹ️</span>
              <span>Showing reports for <strong className="font-semibold">{period.toUpperCase()}</strong> period</span>
            </div>
          </div>
        </div>
      </div>

      {/* Report Sections */}
      <Section 
        title="Available Stock" 
        rows={data.available} 
        cols={['productCode', 'productName', 'quantityInStock', 'unitPrice']}
        icon="📦"
      />
      
      <Section 
        title={`Stock IN (${period.toUpperCase()})`} 
        rows={data.stockIn} 
        cols={['transactionDate', 'productName', 'warehouseName', 'quantityMoved']}
        icon="📥"
      />
      
      <Section 
        title={`Stock OUT (${period.toUpperCase()})`} 
        rows={data.stockOut} 
        cols={['transactionDate', 'productName', 'warehouseName', 'quantityMoved']}
        icon="📤"
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Period Summary
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="text-3xl mb-2">📥</div>
              <div className="text-2xl font-bold text-green-600">{totalStockIn}</div>
              <div className="text-sm text-slate-600 mt-1">Total Stock IN</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="text-3xl mb-2">📤</div>
              <div className="text-2xl font-bold text-red-600">{totalStockOut}</div>
              <div className="text-sm text-slate-600 mt-1">Total Stock OUT</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-3xl mb-2">🔄</div>
              <div className="text-2xl font-bold text-blue-600">{netMovement}</div>
              <div className="text-sm text-slate-600 mt-1">Net Movement</div>
            </div>
          </div>
          
          {/* Export Options (Optional) */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <p className="text-center text-sm text-slate-500">
              💡 Tip: Use the Print button to export this report as PDF
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        @media print {
          .fixed {
            display: none;
          }
          button {
            display: none;
          }
          body {
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}