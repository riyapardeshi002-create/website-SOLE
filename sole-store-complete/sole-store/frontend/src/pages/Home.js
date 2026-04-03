// frontend/src/pages/Home.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productsAPI } from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(()=>{
    productsAPI.featured()
      .then(r => setFeatured(r.data.products))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  return (
    <div className="page">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{
        minHeight:'calc(100vh - 70px)',display:'flex',alignItems:'center',
        position:'relative',overflow:'hidden',
        background:'radial-gradient(ellipse 80% 60% at 60% 40%,rgba(123,47,255,0.25) 0%,transparent 70%),radial-gradient(ellipse 50% 50% at 20% 80%,rgba(255,45,120,0.15) 0%,transparent 60%),#080810',
      }}>
        {/* Grid overlay */}
        <div style={{
          position:'absolute',inset:0,
          backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)',
          WebkitMaskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent)',
        }}/>
        <div style={{position:'relative',zIndex:2,maxWidth:1200,margin:'0 auto',padding:'4rem 2rem',width:'100%'}}>
          <div style={{maxWidth:600}}>
            <div className="fade-up" style={{
              display:'inline-flex',alignItems:'center',gap:'0.5rem',
              background:'rgba(200,255,0,0.1)',border:'1px solid rgba(200,255,0,0.2)',
              padding:'0.4rem 1rem',borderRadius:100,marginBottom:'1.5rem',
            }}>
              <span style={{width:6,height:6,background:'#C8FF00',borderRadius:'50%',animation:'pulse 2s infinite'}}/>
              <span style={{fontSize:'0.75rem',color:'#C8FF00',fontWeight:600,letterSpacing:1,textTransform:'uppercase'}}>New Season 2025</span>
            </div>

            <h1 className="fade-up" style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:'clamp(4rem,10vw,9rem)',lineHeight:0.95,letterSpacing:2,
              marginBottom:'1.5rem',animationDelay:'0.1s',
            }}>
              <span style={{display:'block',color:'#F0F0FF'}}>STEP INTO</span>
              <span style={{display:'block',background:'linear-gradient(135deg,#7B2FFF,#FF2D78,#00F5FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>THE FUTURE</span>
            </h1>

            <p className="fade-up" style={{color:'rgba(240,240,255,0.5)',lineHeight:1.7,marginBottom:'2.5rem',fontSize:'1.05rem',animationDelay:'0.2s'}}>
              Discover footwear engineered for performance, crafted for culture. Bold designs that make every step unforgettable.
            </p>

            <div className="fade-up" style={{display:'flex',gap:'1rem',flexWrap:'wrap',animationDelay:'0.3s'}}>
              <button className="btn-primary" onClick={()=>navigate('/products')}>Shop Now →</button>
              <button className="btn-outline" onClick={()=>navigate('/products')}>View Collections</button>
            </div>

            <div className="fade-up" style={{
              display:'flex',gap:'3rem',marginTop:'4rem',
              paddingTop:'2rem',borderTop:'1px solid rgba(255,255,255,0.08)',
              flexWrap:'wrap',animationDelay:'0.4s',
            }}>
              {[['200+','Styles'],['50K+','Customers'],['4.9★','Rating']].map(([n,l])=>(
                <div key={l}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',color:'#C8FF00'}}>{n}</div>
                  <div style={{fontSize:'0.8rem',color:'rgba(240,240,255,0.45)',textTransform:'uppercase',letterSpacing:1}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hero shoe */}
        <div className="float-anim" style={{
          position:'absolute',right:'-2%',top:'50%',transform:'translateY(-50%)',
          width:'50%',maxWidth:680,pointerEvents:'none',
        }}>
          <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=90"
            alt="Hero" style={{width:'100%',opacity:0.92}}/>
        </div>
        <style>{`@media(max-width:800px){.hero-shoe{display:none!important;}}`}</style>
      </div>

      {/* ── Marquee ───────────────────────────────────────── */}
      <div style={{overflow:'hidden',borderTop:'1px solid rgba(255,255,255,0.08)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'1rem 0',background:'rgba(123,47,255,0.05)'}}>
        <div style={{display:'flex',width:'max-content',animation:'marquee 22s linear infinite'}}>
          {[...Array(2)].map((_,xi)=>(
            <React.Fragment key={xi}>
              {['RUNNING','CASUAL','SPORTS','NEW ARRIVALS','EXCLUSIVE DROPS','LIMITED EDITION','BESTSELLERS','TRENDING NOW'].map((t,i)=>(
                <div key={t+i} style={{padding:'0 2rem',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.1rem',color:i%3===0?'#C8FF00':'rgba(240,240,255,0.35)',letterSpacing:2,whiteSpace:'nowrap'}}>
                  {t} &nbsp;✦&nbsp;
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Featured products ────────────────────────────── */}
      <div className="section">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:'3rem',flexWrap:'wrap',gap:'1rem'}}>
          <div>
            <div className="section-eyebrow">✦ Curated for you</div>
            <h2 className="section-title">Featured <span>Drops</span></h2>
          </div>
          <Link to="/products" className="btn-outline" style={{textDecoration:'none',padding:'0.65rem 1.5rem',fontSize:'0.85rem'}}>View All →</Link>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : (
          <div className="products-grid">
            {featured.slice(0,4).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}
          </div>
        )}
      </div>

      {/* ── Sale banner ───────────────────────────────────── */}
      <div style={{padding:'0 2rem',maxWidth:1200,margin:'0 auto'}}>
        <div style={{
          background:'linear-gradient(135deg,rgba(123,47,255,0.3),rgba(255,45,120,0.2))',
          border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'3rem',
          display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'2rem',
          position:'relative',overflow:'hidden',
        }}>
          <div style={{position:'absolute',right:-40,top:-40,width:200,height:200,borderRadius:'50%',background:'rgba(200,255,0,0.06)'}}/>
          <div>
            <div style={{color:'#C8FF00',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:2,marginBottom:'0.5rem'}}>Limited Time</div>
            <h3 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',lineHeight:1}}>UP TO 40% OFF</h3>
            <p style={{color:'rgba(240,240,255,0.5)',marginTop:'0.5rem'}}>On selected styles. Limited stock, unlimited style.</p>
          </div>
          <button className="btn-acid" onClick={()=>navigate('/products?badge=Sale')}>Shop Sale →</button>
        </div>
      </div>

      {/* ── More products ────────────────────────────────── */}
      <div className="section">
        <div style={{marginBottom:'3rem'}}>
          <div className="section-eyebrow">✦ All categories</div>
          <h2 className="section-title">More to <span>Explore</span></h2>
        </div>
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : (
          <div className="products-grid">
            {featured.slice(4,8).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}
          </div>
        )}
      </div>

      <Footer/>
    </div>
  );
}
