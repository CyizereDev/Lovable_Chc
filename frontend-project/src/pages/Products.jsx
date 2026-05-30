import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Products() {
  const [list, setList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const empty = { 
    productCode: '', 
    productName: '', 
    category: '', 
    quantityInStock: 0, 
    unitPrice: 0, 
    supplierName: '', 
    dateReceived: '' 
  };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setList(response.data);
    } catch (error) {
      setMsg({ type: 'error', text: 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => { load(); }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.productCode.trim()) {
      newErrors.productCode = 'Product code is required';
    }
    if (!form.productName.trim()) {
      newErrors.productName = 'Product name is required';
    }
    if (!form.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!form.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }
    if (!form.quantityInStock && form.quantityInStock !== 0) {
      newErrors.quantityInStock = 'Quantity is required';
    } else if (form.quantityInStock < 0) {
      newErrors.quantityInStock = 'Quantity cannot be negative';
    }
    if (!form.unitPrice && form.unitPrice !== 0) {
      newErrors.unitPrice = 'Unit price is required';
    } else if (form.unitPrice < 0) {
      newErrors.unitPrice = 'Unit price cannot be negative';
    }
    if (!form.dateReceived) {
      newErrors.dateReceived = 'Date received is required';
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
      const productData = {
        productCode: form.productCode.trim(),
        productName: form.productName.trim(),
        category: form.category.trim(),
        quantityInStock: Number(form.quantityInStock),
        unitPrice: Number(form.unitPrice),
        supplierName: form.supplierName.trim(),
        dateReceived: form.dateReceived
      };
      
      if (editingProduct) {
        await api.put(`/products/${editingProduct.productCode}`, productData);
        setMsg({ type: 'success', text: '✅ Product updated successfully!' });
      } else {
        await api.post('/products', productData);
        setMsg({ type: 'success', text: '✅ Product added successfully!' });
      }
      setForm(empty);
      setErrors({});
      setEditingProduct(null);
      setShowForm(false);
      load();
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } catch (err) { 
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || 'Error saving product';
      setMsg({ type: 'error', text: '❌ ' + errorMessage });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      productCode: product.productCode,
      productName: product.productName,
      category: product.category,
      quantityInStock: product.quantityInStock,
      unitPrice: product.unitPrice,
      supplierName: product.supplierName,
      dateReceived: product.dateReceived ? product.dateReceived.split('T')[0] : ''
    });
    setErrors({});
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productCode) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productCode}`);
        setMsg({ type: 'success', text: '✅ Product deleted successfully!' });
        load();
        setTimeout(() => setMsg({ type: '', text: '' }), 3000);
      } catch (err) {
        setMsg({ type: 'error', text: '❌ Failed to delete product' });
      }
    }
  };

  const resetForm = () => {
    setForm(empty);
    setEditingProduct(null);
    setErrors({});
    setShowForm(false);
  };

  const filteredProducts = list.filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(list.map(p => p.category).filter(Boolean))];

  // Stats for dashboard
  const totalProducts = filteredProducts.length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.quantityInStock * p.unitPrice), 0);
  const lowStockProducts = filteredProducts.filter(p => p.quantityInStock < 10).length;
  const categoriesCount = [...new Set(filteredProducts.map(p => p.category))].length;

  return (
    <div className="space-y-6">
      {/* Header Section with Stats */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Products Management</h2>
            <p className="text-slate-300">Manage your inventory products efficiently</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl 
                     font-medium hover:bg-slate-100 transition-all duration-200 shadow-lg"
          >
            <span className="text-xl">{showForm ? '✕' : '+'}</span>
            <span>{showForm ? 'Cancel' : 'Add New Product'}</span>
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-700">
          <div className="text-center">
            <p className="text-2xl font-bold">{totalProducts}</p>
            <p className="text-xs text-slate-300 mt-1">Total Products</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            <p className="text-xs text-slate-300 mt-1">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{lowStockProducts}</p>
            <p className="text-xs text-slate-300 mt-1">Low Stock Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{categoriesCount}</p>
            <p className="text-xs text-slate-300 mt-1">Categories</p>
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

      {/* Add/Edit Product Form - Enhanced */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slideDown">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">{editingProduct ? '✏️' : '➕'}</span>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {editingProduct ? 'Update product information' : 'Fill in the details to add a new product'}
            </p>
          </div>
          
          <form onSubmit={submit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Code *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.productCode ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.productCode} 
                  onChange={e => {
                    setForm({...form, productCode: e.target.value.toUpperCase()});
                    if (errors.productCode) setErrors({...errors, productCode: ''});
                  }}
                  disabled={!!editingProduct}
                  placeholder="e.g., PRD-001"
                />
                {errors.productCode && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.productCode}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Product Name *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.productName ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.productName} 
                  onChange={e => {
                    setForm({...form, productName: e.target.value});
                    if (errors.productName) setErrors({...errors, productName: ''});
                  }}
                  placeholder="Enter product name"
                />
                {errors.productName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.productName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Category *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.category ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.category} 
                  onChange={e => {
                    setForm({...form, category: e.target.value});
                    if (errors.category) setErrors({...errors, category: ''});
                  }}
                  placeholder="e.g., Electronics, Clothing, Food"
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => <option key={cat} value={cat} />)}
                </datalist>
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.category}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Supplier Name *
                </label>
                <input 
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.supplierName ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.supplierName} 
                  onChange={e => {
                    setForm({...form, supplierName: e.target.value});
                    if (errors.supplierName) setErrors({...errors, supplierName: ''});
                  }}
                  placeholder="Supplier name"
                />
                {errors.supplierName && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.supplierName}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Quantity in Stock *
                </label>
                <input 
                  type="number"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.quantityInStock ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.quantityInStock} 
                  onChange={e => {
                    setForm({...form, quantityInStock: e.target.value});
                    if (errors.quantityInStock) setErrors({...errors, quantityInStock: ''});
                  }}
                  placeholder="0"
                  min="0"
                />
                {errors.quantityInStock && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.quantityInStock}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Unit Price ($) *
                </label>
                <input 
                  type="number"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.unitPrice ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.unitPrice} 
                  onChange={e => {
                    setForm({...form, unitPrice: e.target.value});
                    if (errors.unitPrice) setErrors({...errors, unitPrice: ''});
                  }}
                  placeholder="0.00"
                  min="0"
                />
                {errors.unitPrice && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.unitPrice}
                  </p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Date Received *
                </label>
                <input 
                  type="date"
                  className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all
                           ${errors.dateReceived ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-blue-300'}`}
                  required 
                  value={form.dateReceived} 
                  onChange={e => {
                    setForm({...form, dateReceived: e.target.value});
                    if (errors.dateReceived) setErrors({...errors, dateReceived: ''});
                  }}
                />
                {errors.dateReceived && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {errors.dateReceived}
                  </p>
                )}
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
                    <span>{editingProduct ? '💾' : '➕'}</span>
                    <span>{editingProduct ? 'Update Product' : 'Save Product'}</span>
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

      {/* Products List Section - Enhanced */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Product Inventory
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Search products..."
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
            <p className="mt-4 text-slate-500 font-medium">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-8xl mb-4">📦</div>
            <p className="text-slate-500 text-lg mb-2">No products found</p>
            <p className="text-slate-400 text-sm mb-4">Get started by adding your first product</p>
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white 
                       rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 
                       transition-all duration-200 shadow-md"
            >
              + Add New Product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-100 to-slate-50 border-b-2 border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total Value</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, index) => (
                    <tr key={product.productCode} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-slate-700">
                        {product.productCode}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{product.productName}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{product.supplierName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-semibold 
                          ${product.quantityInStock < 10 ? 'text-red-600 bg-red-50 px-2 py-1 rounded-lg' : 'text-slate-600'}`}>
                          {product.quantityInStock < 10 && '⚠'}
                          {product.quantityInStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ${parseFloat(product.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        ${(product.quantityInStock * product.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200
                                     transform hover:scale-110"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(product.productCode)}
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
            
            {/* Enhanced Footer Stats */}
            <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-600">
                    📊 <strong className="text-slate-800">{filteredProducts.length}</strong> Products
                  </span>
                  <span className="text-slate-600">
                    🏷️ <strong className="text-slate-800">{categoriesCount}</strong> Categories
                  </span>
                  <span className="text-slate-600">
                    ⚠️ <strong className="text-red-600">{lowStockProducts}</strong> Low Stock
                  </span>
                </div>
                <div className="text-slate-700 font-semibold">
                  Total Value: <span className="text-green-600 text-lg">${totalValue.toFixed(2)}</span>
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