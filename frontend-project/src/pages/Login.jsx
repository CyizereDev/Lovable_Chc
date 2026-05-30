import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.username);
      navigate('/');
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 p-4">
      <form onSubmit={submit} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-1">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-6">Sign in to StockHub SMS</p>
        {err && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{err}</div>}
        <label className="label">Username</label>
        <input className="input mb-3" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
        <label className="label">Password</label>
        <input type="password" className="input mb-4" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        <button className="btn btn-primary w-full">Login</button>
        <p className="text-center mt-4 text-sm">No account? <Link to="/register" className="text-brand-600 font-medium">Register</Link></p>
      </form>
    </div>
  );
}
