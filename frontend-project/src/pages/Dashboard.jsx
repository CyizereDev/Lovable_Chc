import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [s, setS] = useState({ products:0, warehouses:0, transactions:0, totalStock:0 });
  useEffect(() => {
    (async () => {
      const [p,w,t] = await Promise.all([api.get('/products'), api.get('/warehouses'), api.get('/transactions')]);
      setS({ products:p.data.length, warehouses:w.data.length, transactions:t.data.length,
             totalStock: p.data.reduce((a,b)=>a+Number(b.quantityInStock||0),0) });
    })();
  }, []);
  const cards = [
    { label:'Products', value:s.products, color:'from-blue-500 to-blue-700' },
    { label:'Warehouses', value:s.warehouses, color:'from-emerald-500 to-emerald-700' },
    { label:'Transactions', value:s.transactions, color:'from-amber-500 to-amber-700' },
    { label:'Total Stock', value:s.totalStock, color:'from-purple-500 to-purple-700' },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-6 shadow-md`}>
            <p className="text-sm opacity-90">{c.label}</p>
            <p className="text-4xl font-bold mt-2">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="card mt-6">
        <h3 className="font-semibold mb-2">Welcome to StockHub SMS</h3>
        <p className="text-slate-600">Use the menu to manage Products, Warehouses, Transactions and view Reports.</p>
      </div>
    </div>
  );
}
