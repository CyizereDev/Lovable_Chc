import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Products() {
  const [list, setList] = useState([]);
  const empty = { productCode:'', productName:'', category:'', quantityInStock:0, unitPrice:0, supplierName:'', dateReceived:'' };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const load = async () => setList((await api.get('/products')).data);
  useEffect(()=>{ load(); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/products', form);
      setMsg('✅ Product added'); setForm(empty); load();
      setTimeout(()=>setMsg(''),2000);
    } catch (err) { setMsg('❌ '+(err.response?.data?.message||'Error')); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Add Product</h2>
        {msg && <div className="p-2 rounded bg-slate-100 mb-3">{msg}</div>}
        <form onSubmit={submit} className="grid grid-cols-2 gap-3">
          {['productCode','productName','category','supplierName'].map(k=>(
            <div key={k} className="col-span-2 sm:col-span-1">
              <label className="label">{k}</label>
              <input className="input" required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>
            </div>
          ))}
          <div><label className="label">Quantity</label><input type="number" className="input" required value={form.quantityInStock} onChange={e=>setForm({...form,quantityInStock:e.target.value})}/></div>
          <div><label className="label">Unit Price</label><input type="number" step="0.01" className="input" required value={form.unitPrice} onChange={e=>setForm({...form,unitPrice:e.target.value})}/></div>
          <div className="col-span-2"><label className="label">Date Received</label><input type="date" className="input" required value={form.dateReceived} onChange={e=>setForm({...form,dateReceived:e.target.value})}/></div>
          <button className="btn btn-primary col-span-2">Save Product</button>
        </form>
      </div>
      <div className="card overflow-auto">
        <h2 className="text-xl font-bold mb-4">Products ({list.length})</h2>
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Cat</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>{list.map(p=>(
            <tr key={p.productCode}><td>{p.productCode}</td><td>{p.productName}</td><td>{p.category}</td><td>{p.quantityInStock}</td><td>{p.unitPrice}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
