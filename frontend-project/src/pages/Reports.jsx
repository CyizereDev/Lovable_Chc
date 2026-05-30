import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reports() {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState({ stockIn:[], stockOut:[], available:[] });
  useEffect(()=>{ api.get('/reports/'+period).then(r=>setData(r.data)); }, [period]);

  const Section = ({ title, rows, cols }) => (
    <div className="card overflow-auto">
      <h3 className="font-bold mb-3">{title} ({rows.length})</h3>
      <table className="table">
        <thead><tr>{cols.map(c=><th key={c}>{c}</th>)}</tr></thead>
        <tbody>{rows.map((r,i)=>(<tr key={i}>{cols.map(c=><td key={c}>{r[c]}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">Reports</h2>
        <div className="flex gap-2 ml-auto">
          {['daily','weekly','monthly'].map(p => (
            <button key={p} onClick={()=>setPeriod(p)}
              className={`btn ${period===p?'btn-primary':'bg-slate-200'}`}>{p.toUpperCase()}</button>
          ))}
          <button className="btn bg-emerald-600 text-white" onClick={()=>window.print()}>🖨 Print</button>
        </div>
      </div>
      <Section title="Available Stock" rows={data.available} cols={['productCode','productName','quantityInStock','unitPrice']}/>
      <Section title={`Stock IN (${period})`} rows={data.stockIn} cols={['transactionDate','productName','warehouseName','quantityMoved']}/>
      <Section title={`Stock OUT (${period})`} rows={data.stockOut} cols={['transactionDate','productName','warehouseName','quantityMoved']}/>
    </div>
  );
}
