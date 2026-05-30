import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Warehouses() {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const empty = { warehouseCode: '', warehouseName: '', warehouseLocation: '' };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouses');
      setList(response.data);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to load warehouses' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.warehouseCode.trim()) {
      newErrors.warehouseCode = 'Warehouse code is required';
    }
    if (!form.warehouseName.trim()) {
      newErrors.warehouseName = 'Warehouse name is required';
    }
    if (!form.warehouseLocation.trim()) {
      newErrors.warehouseLocation = 'Warehouse location is required';
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
      const warehouseData = {
        warehouseCode: form.warehouseCode.trim(),
        warehouseName: form.warehouseName.trim(),
        warehouseLocation: form.warehouseLocation.trim()
      };
      
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.warehouseCode}`, warehouseData);
        setMsg({ type: 'success', text: '✅ Warehouse updated successfully!' });
      } else {
        await api.post('/warehouses', warehouseData);
        setMsg({ type: 'success', text: '✅ Warehouse added successfully!' });
      }
      setForm(empty);
      setErrors({});
      setEditingWarehouse(null);
      setShowForm(false);
      load();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: '❌ ' + (err.response?.data?.message || 'Error saving warehouse') });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setForm({
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
      warehouseLocation: warehouse.warehouseLocation
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (warehouseCode) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await api.delete(`/warehouses/${warehouseCode}`);
        setMsg({ type: 'success', text: '✅ Warehouse deleted successfully!' });
        load();
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } catch (err) {
        setMsg({ type: 'error', text: '❌ Failed to delete warehouse' });
      }
    }
  };

  const resetForm = () => {
    setForm(empty);
    setEditingWarehouse(null);
    setErrors({});
    setShowForm(false);
  };

  const filteredWarehouses = list.filter(warehouse =>
    warehouse.warehouseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.warehouseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalWarehouses = filteredWarehouses.length;
  const uniqueLocations = [...new Set(filteredWarehouses.map(w => w.warehouseLocation))].length;

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Warehouse Management</h2>
            <p className="text-slate-300">Manage your storage facilities and locations</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl 
                     font-medium hover:bg-slate-100 transition-all duration-200 shadow-lg"
          >
            <span className="text-xl">{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Add Warehouse'}</span>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalWarehouses}</p>
            <p className="text-xs text-slate-300 mt-1">Total Warehouses</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{uniqueLocations}</p>
            <p className="text-xs text-slate-300 mt-1">Unique Locations</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{list.length}</p>
            <p className="text-xs text-slate-300 mt-1">Total Registered</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">🏭</p>
            <p className="text-xs text-slate-300 mt-1">Storage Facilities</p>
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

      {/* Add/Edit Warehouse Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slideDown">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">{editingWarehouse ? '✏️' : '🏭'}</span>
              {editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {editingWarehouse ? 'Update warehouse information' : 'Fill in the details to add a new warehouse'}
            </p>
          </div>
          
          <form onSubmit={submit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warehouse Code *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.warehouseCode ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.warehouseCode} 
                  onChange={e => {
                    setForm({...form, warehouseCode: e.target.value.toUpperCase()});
                    if (errors.warehouseCode) setErrors({...errors, warehouseCode: ''});
                  }}
                  disabled={!!editingWarehouse}
                  placeholder="e.g., WH-001"
                />
                {errors.warehouseCode && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.warehouseCode}
                  </p>
                )}
                {!editingWarehouse && (
                  <p className="mt-1 text-xs text-slate-400">Unique identifier for the warehouse</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warehouse Name *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.warehouseName ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.warehouseName} 
                  onChange={e => {
                    setForm({...form, warehouseName: e.target.value});
                    if (errors.warehouseName) setErrors({...errors, warehouseName: ''});
                  }}
                  placeholder="e.g., Main Warehouse, North Storage"
                />
                {errors.warehouseName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.warehouseName}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Warehouse Location *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.warehouseLocation ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.warehouseLocation} 
                  onChange={e => {
                    setForm({...form, warehouseLocation: e.target.value});
                    if (errors.warehouseLocation) setErrors({...errors, warehouseLocation: ''});
                  }}
                  placeholder="e.g., Kigali City, Industrial Area"
                />
                {errors.warehouseLocation && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.warehouseLocation}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">Physical address or area of the warehouse</p>
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
                    <span className="animate-spin">⏳</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{editingWarehouse ? '💾' : '➕'}</span>
                    <span>{editingWarehouse ? 'Update Warehouse' : 'Save Warehouse'}</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border-2 border-slate-300 rounded-xl text-slate-700 
                         font-semibold hover:bg-slate-50 hover:border-slate-400 
                         transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Warehouses List Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Warehouse Directory
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {filteredWarehouses.length} warehouse{filteredWarehouses.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent w-full sm:w-80
                         bg-slate-50 hover:bg-white transition-all"
              />
            </div>
          </div>
        </div>
        
        {loading && !list.length ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading warehouses...</p>
          </div>
        ) : filteredWarehouses.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-8xl mb-4">🏭</div>
            <p className="text-slate-500 text-lg mb-2">No warehouses found</p>
            <p className="text-slate-400 text-sm mb-4">Get started by adding your first warehouse</p>
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                       rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 
                       transition-all duration-200 shadow-md"
            >
              + Add Warehouse
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Warehouse Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWarehouses.map((warehouse, index) => (
                    <tr key={warehouse.warehouseCode} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">
                        <span className="inline-flex items-center gap-2">
                          <span>🏪</span>
                          {warehouse.warehouseCode}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{warehouse.warehouseName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <span>📍</span>
                          {warehouse.warehouseLocation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(warehouse)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200
                                     transform hover:scale-110"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse.warehouseCode)}
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
                    📊 <strong className="text-slate-800">{filteredWarehouses.length}</strong> Warehouses
                  </span>
                  <span className="text-slate-600">
                    📍 <strong className="text-slate-800">{uniqueLocations}</strong> Locations
                  </span>
                </div>
                <div className="text-slate-600">
                  🏭 Total Storage Capacity: <strong className="text-blue-600">Coming Soon</strong>
                </div>
              </div>
            </div>
          </>
        )}
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
      `}</style>
    </div>
  );
}