import { useEffect, useState } from 'react';
import { rupee, SLIDES, PERKS, useSettings } from './config.js';

function Pic({ src, alt }) {
  const [bad, setBad] = useState(false);
  return src && !bad ? <img src={src} alt={alt} loading="lazy" onError={() => setBad(true)} /> : <span className="noimg">No image</span>;
}

function Modal({ p, s, onClose }) {
  const [out, setOut] = useState(false);
  const close = () => { setOut(true); setTimeout(onClose, 200); };
  useEffect(() => {
    const k = e => e.key === 'Escape' && close();
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, []);
  const wa = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent('Hi, I want to know about ' + p.name)}`;
  return (
    <div className={'backdrop' + (out ? ' out' : '')} onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={p.name} onClick={e => e.stopPropagation()}>
        <button className="x" onClick={close} aria-label="Close">✕</button>
        <div className="mimg"><Pic src={p.image_url} alt={p.name} />{p.offer_price && <em className="tag">{p.offer_label || 'Offer'}</em>}</div>
        <div className="minfo">
          <small>{p.category}</small>
          <h2>{p.name}</h2>
          <p>{p.description || 'Contact us for full specifications.'}</p>
          <div className="price"><b>{rupee(p.offer_price || p.price)}</b>{p.offer_price && <s>{rupee(p.price)}</s>}
            {p.offer_price && <span className="save">Save {rupee(p.price - p.offer_price)}</span>}</div>
          <p className={p.in_stock ? 'ok' : 'no'}>{p.in_stock ? 'In stock' : 'Currently out of stock'}</p>
          <a className="btn" href={wa} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
          <a className="btn dark" href={`tel:${s.phone.replace(/\s/g, '')}`}>Call {s.phone}</a>
        </div>
      </div>
    </div>);
}

export default function App() {
  const [s] = useSettings();
  const [items, setItems] = useState([]);
  const [cat, setCat] = useState('All');
  const [offersOnly, setOffersOnly] = useState(false);
  const [sel, setSel] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/products').then(r => r.json()).then(setItems).catch(() => setError('Could not load products. Please refresh.')); }, []);
  useEffect(() => { document.title = s.shop_name; }, [s.shop_name]);

  const cats = ['All', ...new Set(items.map(p => p.category))];
  const shown = items.filter(p => (cat === 'All' || p.category === cat) && (!offersOnly || p.offer_price));
  const go = (c, offers = false) => { setCat(cats.includes(c) ? c : 'All'); setOffersOnly(offers); document.getElementById('products').scrollIntoView({ behavior: 'smooth' }); };
  const social = [['Instagram', s.instagram], ['Facebook', s.facebook], ['YouTube', s.youtube], ['Google Maps', s.maps_url],
    ['WhatsApp', s.whatsapp && `https://wa.me/${s.whatsapp}`]].filter(x => x[1]);

  return (<>
    <header className="top" id="top">
      <div className="brand">{s.logo_url && <img className="logoimg" src={s.logo_url} alt="" />}<b className="logo">{s.shop_name}</b></div>
      <a className="call" href={`tel:${s.phone.replace(/\s/g, '')}`}>Call {s.phone}</a>
    </header>
    <section className="hero">
      <h1>See everything.<br />Miss nothing.</h1>
      <p>{s.tagline}</p>
      <a className="btn dark" href="#products">Browse cameras</a>
    </section>

    <section className="slider" aria-label="What we offer">
      <div className="track">
        {[...SLIDES, ...SLIDES].map((c, i) => (
          <button className="scard" key={i} onClick={() => go(c.cat)} aria-hidden={i >= SLIDES.length} tabIndex={i >= SLIDES.length ? -1 : 0}>
            <span className="ic">{c.icon}</span><b>{c.title}</b><span>{c.text}</span>
          </button>))}
      </div>
    </section>

    <main id="products">
      <div className="bar">
        {cats.map(c => <button key={c} className={'chip' + (cat === c ? ' on' : '')} onClick={() => setCat(c)}>{c}</button>)}
        <label className="chk"><input type="checkbox" checked={offersOnly} onChange={e => setOffersOnly(e.target.checked)} /> Offers only</label>
      </div>
      {error && <p className="msg">{error}</p>}
      {!error && shown.length === 0 && <p className="msg">No products match. Try another category.</p>}
      <div className="grid">
        {shown.map(p => (
          <article className="card" key={p.id} tabIndex={0} role="button" aria-label={'View ' + p.name}
            onClick={() => setSel(p)} onKeyDown={e => e.key === 'Enter' && setSel(p)}>
            <div className="img"><Pic src={p.image_url} alt={p.name} />{p.offer_price && <em className="tag">{p.offer_label || 'Offer'}</em>}</div>
            <h3>{p.name}</h3><small>{p.category}</small>
            <p>{p.description}</p>
            <div className="price"><b>{rupee(p.offer_price || p.price)}</b>{p.offer_price && <s>{rupee(p.price)}</s>}</div>
            <span className={'btn' + (p.in_stock ? '' : ' off')}>{p.in_stock ? 'View details' : 'Out of stock'}</span>
          </article>))}
      </div>
    </main>

    <footer className="site">
      <div className="perks">{PERKS.map(([a, b]) => <div key={a}><b>{a}</b>{b}</div>)}</div>
      <div className="fcols">
        <div>
          <div className="brand">{s.logo_url && <img className="logoimg" src={s.logo_url} alt="" />}<b className="logo big">{s.shop_name}</b></div>
          <p>{s.tagline}</p>
          <div className="soc">{social.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noreferrer">{n}</a>)}</div>
        </div>
        <div><h4>Quick links</h4>
          <a href="#top">Home</a><a href="#products" onClick={() => go('All')}>All products</a>
          <a href="#products" onClick={e => { e.preventDefault(); go('All', true); }}>Offers</a>
          {s.maps_url && <a href={s.maps_url} target="_blank" rel="noreferrer">Find our shop</a>}</div>
        <div><h4>Categories</h4>
          {cats.slice(1).map(c => <a key={c} href="#products" onClick={e => { e.preventDefault(); go(c); }}>{c}</a>)}</div>
        <div><h4>Contact us</h4>
          <p>{s.address}</p>
          <a href={`tel:${s.phone.replace(/\s/g, '')}`}>{s.phone}</a>
          {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          <p>{s.hours}</p>
          {s.maps_url && <a className="btn" href={s.maps_url} target="_blank" rel="noreferrer">Open in Google Maps</a>}</div>
      </div>
      <div className="legal"><span>© {new Date().getFullYear()} {s.shop_name}. All rights reserved.</span><a href="/admin">Admin login</a></div>
    </footer>
    {sel && <Modal p={sel} s={s} onClose={() => setSel(null)} />}
  </>);
}
