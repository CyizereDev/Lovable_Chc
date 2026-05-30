import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Warehouses() {
  const [list, setList] = useState([]);
  const empty = { warehouseCode:'', warehouseName:'', warehouseLocation:'' };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');
  const load = async () => setList((await api.get('/warehouses')).data);
  useEffect(()=>{ load(); }, []);
  const submit = async e => {
    e.preventDefault();
    try { await api.post('/warehouses', form); setMsg('✅ Added'); setForm(empty); load(); setTimeout(()=>setMsg(''),2000); }
    catch (err) { setMsg('❌ '+(err.response?.data?.message||'Error')); }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Add Warehouse</h2>
        {msg && <div className="p-2 rounded bg-slate-100 mb-3">{msg}</div>}
        <form onSubmit={submit} className="space-y-3">
          {Object.keys(empty).map(k=>(
            <div key={k}><label className="label">{k}</label>
              <input className="input" required value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>
          ))}
          <button className="btn btn-primary w-full">Save Warehouse</button>
        </form>
      </div>
      <div className="card overflow-auto">
        <h2 className="text-xl font-bold mb-4">Warehouses ({list.length})</h2>
        <table className="table">
          <thead><tr><th>Code</th><th>Name</th><th>Location</th></tr></thead>
          <tbody>{list.map(w=>(
            <tr key={w.warehouseCode}><td>{w.warehouseCode}</td><td>{w.warehouseName}</td><td>{w.warehouseLocation}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
