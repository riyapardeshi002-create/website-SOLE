// frontend/src/pages/Products.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productsAPI } from '../api/client';

const CATS = ['All','Running','Casual','Sports'];
const SORTS = [
  { value:'newest',     label:'Newest' },
  { value:'price_asc',  label:'Price: Low to High' },
  { value:'price_desc', label:'Price: High to Low' },
  { value:'rating',     label:'Top Rated' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);

  const [search, setSearch] = useState(params.get('search') || '');
  const [cat,    setCat]    = useState(params.get('category') || 'All');
  const [sort,   setSort]   = useState('newest');
  const [badge,  setBadge]  = useState(params.get('badge') || '');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const p = { sort, limit:20 };
      if (cat !== 'All') p.category = cat.toLowerCase();
      if (search)        p.search   = search;
      if (badge)         p.badge    = badge;
      const { data } = await productsAPI.list(p);
      setProducts(data.products);
      setTotal(data.total);
    } catch { setProducts([]); }
    finally  { setLoading(false); }
  }, [cat, sort, search, badge]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <div className="page">
      <div className="section">
        <div className="section-eyebrow">✦ Our Collection</div>
        <h1 className="section-title" style={{marginBottom:'2rem'}}>All <span>Sneakers</span></h1>

        {/* Controls */}
        <div style={{display:'flex',gap:'1rem',flexWrap:'wrap',marginBottom:'2rem',alignItems:'center'}}>
          {/* Search */}
          <div style={{position:'relative',flex:'1 1 240px',minWidth:200}}>
            <span style={{position:'absolute',left:'1rem',top:'50%',transform:'translateY(-50%)',color:'rgba(240,240,255,0.45)'}}>🔍</span>
            <input className="input-field" placeholder="Search shoes, brands..." style={{paddingLeft:'2.8rem'}}
              value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>

          {/* Category chips */}
          <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
            {CATS.map(c=>(
              <button key={c} className={'filter-chip'+(cat===c?' active':'')} onClick={()=>{setCat(c);setBadge('');}}>
                {c}
              </button>
            ))}
            <button
  className={'filter-chip' + (badge === 'Sale' ? ' active' : '')}
  onClick={() => {
    setBadge(badge === 'Sale' ? '' : 'Sale');
    setCat('All');
  }}
>
              🏷 Sale
            </button>
            <button
  className={'filter-chip' + (badge === 'New' ? ' active' : '')}
  onClick={() => {
    setBadge(badge === 'New' ? '' : 'New');
    setCat('All');
  }}
>
              ✨ New
            </button>
          </div>

          {/* Sort */}
          <select className="input-field" style={{width:'auto',flex:'0 0 auto'}}
            value={sort} onChange={e=>setSort(e.target.value)}>
            {SORTS.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div style={{color:'rgba(240,240,255,0.45)',fontSize:'0.85rem',marginBottom:'1.5rem'}}>
          {loading ? 'Loading...' : `${total} product${total!==1?'s':''} found`}
        </div>

        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">👟</div>
            <h3>No shoes found</h3>
            <p>Try adjusting your search or filters</p>
            <button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>{setSearch('');setCat('All');setBadge('');}}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}
