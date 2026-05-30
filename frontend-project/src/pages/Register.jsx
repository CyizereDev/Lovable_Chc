import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setMsg('Registered! Redirecting...');
      setTimeout(()=>navigate('/login'), 1200);
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-500 to-brand-700 p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-1">Create Account</h2>
        <p className="text-center text-slate-500 mb-6">Join StockHub SMS</p>
        {err && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{err}</div>}
        {msg && <div className="bg-green-100 text-green-700 p-2 rounded mb-3">{msg}</div>}
        <label className="label">Username</label>
        <input className="input mb-3" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
        <label className="label">Password</label>
        <input type="password" className="input mb-4" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        <button className="btn btn-primary w-full">Register</button>
        <p className="text-center mt-4 text-sm">Have an account? <Link to="/login" className="text-brand-600 font-medium">Login</Link></p>
      </form>
    </div>
  );
}
