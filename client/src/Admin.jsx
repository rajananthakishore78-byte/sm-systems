import { useEffect, useState } from 'react';
import { rupee, FIELDS, useSettings } from './config.js';

const blank = { name: '', category: '', description: '', price: '', offer_price: '', offer_label: '', in_stock: 1, image_url: '' };

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem('tk') || '');
  const [pw, setPw] = useState('');
  const [tab, setTab] = useState('products');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [file, setFile] = useState(null);
  const [s, setS] = useSettings();
  const [logo, setLogo] = useState(null);
  const [rm, setRm] = useState(false);
  const [fk, setFk] = useState(0);
  const [msg, setMsg] = useState('');

  const load = () => fetch('/api/products').then(r => r.json()).then(setItems);
  useEffect(() => { load(); }, []);
  const set = k => e => setForm({ ...form, [k]: e.target.value });
  const headers = { Authorization: 'Bearer ' + token };
  const expired = r => { if (r.status === 401) { localStorage.removeItem('tk'); setToken(''); return true; } };

  async function login(e) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }) });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error);
    localStorage.setItem('tk', d.token); setToken(d.token); setMsg('');
  }

  async function save(e) {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
    if (file) fd.append('image', file);
    const r = await fetch('/api/products' + (form.id ? '/' + form.id : ''), { method: form.id ? 'PUT' : 'POST', headers, body: fd });
    const d = await r.json();
    if (expired(r)) return;
    if (!r.ok) return setMsg(d.error);
    setMsg('Product saved.'); setForm(blank); setFile(null); e.target.reset(); load();
  }

  async function saveSettings(e) {
    e.preventDefault();
    const fd = new FormData();
    FIELDS.forEach(([k]) => fd.append(k, s[k] ?? ''));
    if (logo) fd.append('logo', logo);
    if (rm) fd.append('remove_logo', '1');
    let r, d;
    try { r = await fetch('/api/settings', { method: 'PUT', headers, body: fd }); } catch { return setMsg('Cannot reach the server. Is it running?'); }
    if (expired(r)) return;
    try { d = await r.json(); } catch { return setMsg('Not saved: the server is outdated. Stop it (Ctrl+C) and run npm start again.'); }
    if (!r.ok) return setMsg(d.error || 'Not saved.');
    setS({ ...s, ...d }); setLogo(null); setRm(false); setFk(k => k + 1); setMsg('Saved. Open the website to see the changes.');
  }

  async function remove(p) {
    if (!confirm(`Delete ${p.name}?`)) return;
    await fetch('/api/products/' + p.id, { method: 'DELETE', headers }); load();
  }

  if (!token) return (
    <form className="login" onSubmit={login}>
      <h2>Showroom admin</h2>
      <input type="password" placeholder="Admin password" value={pw} onChange={e => setPw(e.target.value)} />
      <button className="btn">Log in</button>{msg && <p className="msg">{msg}</p>}
    </form>);

  return (
    <div className="admin">
      <header className="top"><b className="logo">Admin</b><a className="call" href="/">View website</a></header>
      <div className="bar tabs">
        {[['products', 'Products'], ['settings', 'Logo & shop details']].map(([k, n]) =>
          <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => { setTab(k); setMsg(''); }}>{n}</button>)}
      </div>
      {msg && <p className="msg pad">{msg}</p>}

      {tab === 'settings' && (
        <form className="edit" onSubmit={saveSettings}>
          <h3>Logo</h3>
          {s.logo_url && !rm && <img className="logoprev" src={s.logo_url} alt="Current logo" />}
          <label>Upload new logo <input key={fk} type="file" accept="image/*" onChange={e => setLogo(e.target.files[0])} /></label>
          {s.logo_url && <label><input type="checkbox" checked={rm} onChange={e => setRm(e.target.checked)} /> Remove logo</label>}
          <h3>Shop details and links</h3>
          {FIELDS.map(([k, label]) => <label key={k}>{label}<input value={s[k] ?? ''} onChange={e => setS({ ...s, [k]: e.target.value })} /></label>)}
          <button className="btn">Save settings</button>
        </form>)}

      {tab === 'products' && (<>
        <form className="edit" onSubmit={save}>
          <h3>{form.id ? 'Edit product' : 'Add product'}</h3>
          <input placeholder="Product name" required value={form.name} onChange={set('name')} />
          <input placeholder="Category (e.g. Dome)" value={form.category} onChange={set('category')} />
          <textarea placeholder="Description" value={form.description} onChange={set('description')} />
          <input type="number" placeholder="Price ₹" required value={form.price} onChange={set('price')} />
          <input type="number" placeholder="Offer price ₹ (optional)" value={form.offer_price ?? ''} onChange={set('offer_price')} />
          <input placeholder="Offer label (e.g. Festival Offer)" value={form.offer_label} onChange={set('offer_label')} />
          {form.image_url && !file && <img className="logoprev" src={form.image_url} alt="Current" />}
          <label>Image <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></label>
          <select value={form.in_stock} onChange={set('in_stock')}><option value={1}>In stock</option><option value={0}>Out of stock</option></select>
          <div className="row"><button className="btn">{form.id ? 'Save changes' : 'Add product'}</button>
            {form.id && <button type="button" className="btn dark" onClick={() => { setForm(blank); setFile(null); }}>Cancel</button>}</div>
        </form>
        <div className="list">
          {items.map(p => (
            <div className="rowitem" key={p.id}>
              {p.image_url ? <img src={p.image_url} alt="" /> : <span className="ph" />}
              <div><b>{p.name}</b><small>{rupee(p.price)}{p.offer_price ? ` → ${rupee(p.offer_price)}` : ''}</small></div>
              <button className="chip" onClick={() => { setForm(p); window.scrollTo(0, 0); }}>Edit</button>
              <button className="chip" onClick={() => remove(p)}>Delete</button>
            </div>))}
        </div></>)}
    </div>);
}
