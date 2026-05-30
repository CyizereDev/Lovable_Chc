import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const empty = { productCode: '', warehouseCode: '', transactionDate: '', quantityMoved: 0, transactionType: 'IN' };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [t, p, w] = await Promise.all([
        api.get('/transactions'), 
        api.get('/products'), 
        api.get('/warehouses')
      ]);
      setList(t.data);
      setProducts(p.data);
      setWarehouses(w.data);
    } catch (error) {
      console.error('Load error:', error);
      setMsg({ type: 'error', text: 'Failed to load data: ' + (error.response?.data?.message || error.message) });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.productCode) {
      newErrors.productCode = 'Product is required';
    }
    if (!form.warehouseCode) {
      newErrors.warehouseCode = 'Warehouse is required';
    }
    if (!form.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
    }
    if (!form.quantityMoved || form.quantityMoved <= 0) {
      newErrors.quantityMoved = 'Valid quantity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMsg({ type: 'error', text: 'Please fill in all required fields' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      return;
    }
    
    setLoading(true);
    try {
      const transactionData = {
        productCode: form.productCode,
        warehouseCode: form.warehouseCode,
        transactionDate: form.transactionDate,
        quantityMoved: Number(form.quantityMoved),
        transactionType: form.transactionType
      };
      
      if (editId) {
        await api.put('/transactions/' + editId, transactionData);
        setMsg({ type: 'success', text: '✅ Transaction updated successfully!' });
      } else {
        await api.post('/transactions', transactionData);
        setMsg({ type: 'success', text: '✅ Transaction added successfully!' });
      }
      setForm(empty);
      setEditId(null);
      setErrors({});
      load();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) { 
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.message || 'Error saving transaction';
      setMsg({ type: 'error', text: '❌ ' + errorMessage });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const edit = t => {
    setEditId(t.transactionId);
    setForm({
      productCode: t.productCode,
      warehouseCode: t.warehouseCode,
      transactionDate: t.transactionDate?.slice(0, 10),
      quantityMoved: t.quantityMoved,
      transactionType: t.transactionType
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const del = async id => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete('/transactions/' + id);
      setMsg({ type: 'success', text: '✅ Transaction deleted successfully!' });
      load();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: '❌ Failed to delete transaction' });
    }
  };

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setErrors({});
  };

  // Filter transactions
  const filteredTransactions = list.filter(transaction => {
    const matchesSearch = 
      transaction.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionId?.toString().includes(searchTerm);
    
    const matchesType = filterType === 'ALL' || transaction.transactionType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Stats
  const totalTransactions = filteredTransactions.length;
  const totalIn = filteredTransactions.filter(t => t.transactionType === 'IN').reduce((sum, t) => sum + t.quantityMoved, 0);
  const totalOut = filteredTransactions.filter(t => t.transactionType === 'OUT').reduce((sum, t) => sum + t.quantityMoved, 0);
  const netStock = totalIn - totalOut;

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Transaction Management</h2>
            <p className="text-slate-300">Track inventory movements and stock changes</p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <p className="text-xs text-slate-300 mt-1">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-300">{totalIn}</p>
            <p className="text-xs text-slate-300 mt-1">Stock IN</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-300">{totalOut}</p>
            <p className="text-xs text-slate-300 mt-1">Stock OUT</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{netStock}</p>
            <p className="text-xs text-slate-300 mt-1">Net Movement</p>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {msg.text && (
        <div 
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-lg
                      ${msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="flex items-center gap-2">
            <span>{msg.type === 'success' ? '✓' : '⚠'}</span>
            <span>{msg.text}</span>
          </div>
        </div>
      )}

      {/* Add/Edit Transaction Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <span className="text-2xl">{editId ? '✏️' : '➕'}</span>
            {editId ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          <p className="text-white/80 text-sm mt-1">
            {editId ? 'Update transaction details' : 'Record a new inventory movement'}
          </p>
        </div>
        
        <form onSubmit={submit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Product *
              </label>
              <select 
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.productCode ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}
                         ${editId ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                required 
                disabled={!!editId}
                value={form.productCode} 
                onChange={e => {
                  setForm({...form, productCode: e.target.value});
                  if (errors.productCode) setErrors({...errors, productCode: ''});
                }}
              >
                <option value="">-- Select Product --</option>
                {products.map(p => (
                  <option key={p.productCode} value={p.productCode}>
                    {p.productName} ({p.productCode})
                  </option>
                ))}
              </select>
              {errors.productCode && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.productCode}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Warehouse *
              </label>
              <select 
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.warehouseCode ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}
                         ${editId ? 'bg-slate-100 cursor-not-allowed' : 'bg-white'}`}
                required 
                disabled={!!editId}
                value={form.warehouseCode} 
                onChange={e => {
                  setForm({...form, warehouseCode: e.target.value});
                  if (errors.warehouseCode) setErrors({...errors, warehouseCode: ''});
                }}
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map(w => (
                  <option key={w.warehouseCode} value={w.warehouseCode}>
                    {w.warehouseName} ({w.warehouseLocation})
                  </option>
                ))}
              </select>
              {errors.warehouseCode && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.warehouseCode}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transaction Date *
              </label>
              <input 
                type="date"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.transactionDate ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                required 
                value={form.transactionDate} 
                onChange={e => {
                  setForm({...form, transactionDate: e.target.value});
                  if (errors.transactionDate) setErrors({...errors, transactionDate: ''});
                }}
              />
              {errors.transactionDate && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.transactionDate}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantity *
              </label>
              <input 
                type="number"
                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent transition-all
                         ${errors.quantityMoved ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                required 
                value={form.quantityMoved} 
                onChange={e => {
                  setForm({...form, quantityMoved: e.target.value});
                  if (errors.quantityMoved) setErrors({...errors, quantityMoved: ''});
                }}
                placeholder="Enter quantity"
                min="1"
              />
              {errors.quantityMoved && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.quantityMoved}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Transaction Type *
              </label>
              <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value="IN"
                    checked={form.transactionType === 'IN'}
                    onChange={e => setForm({...form, transactionType: e.target.value})}
                    className="hidden peer"
                  />
                  <div className={`text-center py-2.5 rounded-xl border-2 transition-all duration-200
                                ${form.transactionType === 'IN' 
                                  ? 'border-green-500 bg-green-50 text-green-700 font-semibold' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'}`}>
                    📥 Stock IN
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    value="OUT"
                    checked={form.transactionType === 'OUT'}
                    onChange={e => setForm({...form, transactionType: e.target.value})}
                    className="hidden peer"
                  />
                  <div className={`text-center py-2.5 rounded-xl border-2 transition-all duration-200
                                ${form.transactionType === 'OUT' 
                                  ? 'border-red-500 bg-red-50 text-red-700 font-semibold' 
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-red-300'}`}>
                    📤 Stock OUT
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                       py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 
                       transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50
                       flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>{editId ? '💾' : '➕'}</span>
                  <span>{editId ? 'Update Transaction' : 'Save Transaction'}</span>
                </>
              )}
            </button>
            {editId && (
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 
                         font-semibold hover:bg-slate-50 hover:border-slate-400 
                         transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Transactions List Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Transaction History
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">📊 All Types</option>
                <option value="IN">📥 Stock IN</option>
                <option value="OUT">📤 Stock OUT</option>
              </select>
              
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent w-full sm:w-64
                           bg-slate-50 hover:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>
        
        {loading && !list.length ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-8xl mb-4">📊</div>
            <p className="text-slate-500 text-lg mb-2">No transactions found</p>
            <p className="text-slate-400 text-sm mb-4">Record your first inventory movement</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Warehouse</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction.transactionId} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">
                        #{transaction.transactionId.slice(-6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{transaction.productName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{transaction.productCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">{transaction.warehouseName}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {transaction.quantityMoved} units
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full
                          ${transaction.transactionType === 'IN' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'}`}>
                          {transaction.transactionType === 'IN' ? '📥 IN' : '📤 OUT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => edit(transaction)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200
                                     transform hover:scale-110"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => del(transaction.transactionId)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200
                                     transform hover:scale-110"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer Stats */}
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-600">
                    📊 <strong className="text-slate-800">{totalTransactions}</strong> Transactions
                  </span>
                  <span className="text-slate-600">
                    📥 <strong className="text-green-600">{totalIn}</strong> IN
                  </span>
                  <span className="text-slate-600">
                    📤 <strong className="text-red-600">{totalOut}</strong> OUT
                  </span>
                </div>
                <div className="text-slate-600">
                  Net Movement: <strong className="text-blue-600">{netStock}</strong> units
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}