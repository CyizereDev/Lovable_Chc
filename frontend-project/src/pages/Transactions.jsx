import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Transactions() {
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const empty = { productCode:'', warehouseCode:'', transactionDate:'', quantityMoved:0, transactionType:'IN' };
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    const [t,p,w] = await Promise.all([api.get('/transactions'), api.get('/products'), api.get('/warehouses')]);
    setList(t.data); setProducts(p.data); setWarehouses(w.data);
  };
  useEffect(()=>{ load(); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put('/transactions/'+editId, form);
        setMsg('✅ Updated');
      } else {
        await api.post('/transactions', form);
        setMsg('✅ Added');
      }
      setForm(empty); setEditId(null); load();
      setTimeout(()=>setMsg(''),2000);
    } catch (err) { setMsg('❌ '+(err.response?.data?.message||'Error')); }
  };

  const edit = t => {
    setEditId(t.transactionId);
    setForm({ productCode:t.productCode, warehouseCode:t.warehouseCode,
      transactionDate:t.transactionDate?.slice(0,10), quantityMoved:t.quantityMoved, transactionType:t.transactionType });
  };
  const del = async id => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete('/transactions/'+id); load();
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{editId?'Edit':'Add'} Transaction</h2>
        {msg && <div className="p-2 rounded bg-slate-100 mb-3">{msg}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div><label className="label">Product</label>
            <select className="input" required disabled={!!editId} value={form.productCode} onChange={e=>setForm({...form,productCode:e.target.value})}>
              <option value="">--Select--</option>
              {products.map(p=><option key={p.productCode} value={p.productCode}>{p.productName}</option>)}
            </select></div>
          <div><label className="label">Warehouse</label>
            <select className="input" required disabled={!!editId} value={form.warehouseCode} onChange={e=>setForm({...form,warehouseCode:e.target.value})}>
              <option value="">--Select--</option>
              {warehouses.map(w=><option key={w.warehouseCode} value={w.warehouseCode}>{w.warehouseName}</option>)}
            </select></div>
          <div><label className="label">Date</label>
            <input type="date" className="input" required value={form.transactionDate} onChange={e=>setForm({...form,transactionDate:e.target.value})}/></div>
          <div><label className="label">Quantity</label>
            <input type="number" className="input" required value={form.quantityMoved} onChange={e=>setForm({...form,quantityMoved:e.target.value})}/></div>
          <div><label className="label">Type</label>
            <select className="input" value={form.transactionType} onChange={e=>setForm({...form,transactionType:e.target.value})}>
              <option value="IN">IN</option><option value="OUT">OUT</option>
            </select></div>
          <div className="lg:col-span-5 flex gap-2">
            <button className="btn btn-primary">{editId?'Update':'Save'}</button>
            {editId && <button type="button" className="btn bg-slate-300" onClick={()=>{setEditId(null);setForm(empty);}}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card overflow-auto">
        <h2 className="text-xl font-bold mb-4">Transactions ({list.length})</h2>
        <table className="table">
          <thead><tr><th>ID</th><th>Date</th><th>Product</th><th>Warehouse</th><th>Qty</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>{list.map(t=>(
            <tr key={t.transactionId}>
              <td>{t.transactionId}</td>
              <td>{t.transactionDate?.slice(0,10)}</td>
              <td>{t.productName}</td>
              <td>{t.warehouseName}</td>
              <td>{t.quantityMoved}</td>
              <td><span className={`px-2 py-1 rounded text-xs ${t.transactionType==='IN'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{t.transactionType}</span></td>
              <td className="flex gap-1">
                <button className="btn bg-amber-500 text-white text-xs" onClick={()=>edit(t)}>Edit</button>
                <button className="btn btn-danger text-xs" onClick={()=>del(t.transactionId)}>Delete</button>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
