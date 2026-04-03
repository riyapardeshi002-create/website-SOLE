// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { dashboardAPI, ordersAPI, wishlistAPI } from '../api/client';

const STATUS_STYLE = {
  delivered:  { bg:'rgba(200,255,0,0.1)',  color:'#C8FF00' },
  shipped:    { bg:'rgba(0,245,255,0.1)',  color:'#00F5FF' },
  processing: { bg:'rgba(123,47,255,0.15)',color:'#a78bfa' },
  pending:    { bg:'rgba(255,140,0,0.15)', color:'#FFB800' },
  cancelled:  { bg:'rgba(255,45,120,0.15)',color:'#FF2D78' },
};

export default function Dashboard() {
  const navigate      = useNavigate();
  const { user }      = useAuth();
  const { addItem }   = useCart();
  const [stats,     setStats]    = useState(null);
  const [orders,    setOrders]   = useState([]);
  const [wishlist,  setWishlist] = useState([]);
  const [loading,   setLoading]  = useState(true);

  useEffect(()=>{
    if (!user) return;
    Promise.all([dashboardAPI.stats(), ordersAPI.list({limit:5}), wishlistAPI.get()])
      .then(([s,o,w])=>{ setStats(s.data.stats); setOrders(o.data.orders); setWishlist(w.data.wishlist); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[user]);

  if (!user) return (
    <div className="page">
      <div className="empty-state" style={{paddingTop:'6rem'}}>
        <div className="icon">🔐</div>
        <h3>Sign in required</h3>
        <p>Please sign in to view your dashboard.</p>
        <button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>navigate('/login')}>Sign In</button>
      </div>
    </div>
  );

  const tierColors = { Bronze:'#CD7F32', Silver:'#C0C0C0', Gold:'#C8FF00', Platinum:'#00F5FF' };
  const tierColor  = tierColors[stats?.memberTier||'Bronze'] || '#C8FF00';

  return (
    <div className="page">
      <div style={{maxWidth:1200,margin:'0 auto',padding:'2rem'}}>
        {/* Header */}
        <div className="fade-in" style={{
          background:'linear-gradient(135deg,rgba(123,47,255,0.2),rgba(255,45,120,0.1))',
          border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,padding:'2rem',
          display:'flex',alignItems:'center',gap:'2rem',marginBottom:'2rem',flexWrap:'wrap',
        }}>
          <div style={{width:70,height:70,borderRadius:'50%',background:'linear-gradient(135deg,#7B2FFF,#FF2D78)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0}}>
            {user.name?.[0]?.toUpperCase()||'U'}
          </div>
          <div style={{flex:1}}>
            <div style={{color:'rgba(240,240,255,0.45)',fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:1}}>Welcome back</div>
            <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:'1.8rem'}}>{user.name}</h2>
            <div style={{color:'rgba(240,240,255,0.45)',fontSize:'0.85rem'}}>{user.email}</div>
          </div>
          <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
            <span style={{background:`${tierColor}22`,color:tierColor,border:`1px solid ${tierColor}44`,padding:'0.4rem 1rem',borderRadius:100,fontSize:'0.78rem',fontWeight:700}}>
              ★ {stats?.memberTier || 'Bronze'} Member
            </span>
            <button className="btn-primary" style={{padding:'0.5rem 1.2rem',fontSize:'0.82rem'}} onClick={()=>navigate('/products')}>Shop Now</button>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="loading-wrap"><div className="spinner"/></div>
        ) : (
          <>
            <div className="dash-stats">
              {[
                { icon:'📦', num:stats?.totalOrders||0,    label:'Total Orders',     color:'#C8FF00' },
                { icon:'💰', num:`$${stats?.totalSpent||0}`,label:'Total Spent',     color:'#00F5FF' },
                { icon:'🚀', num:stats?.delivered||0,       label:'Delivered',       color:'#7B2FFF' },
                { icon:'❤️', num:stats?.wishlistCount||0,   label:'Saved Items',     color:'#FF2D78' },
              ].map((s,i)=>(
                <div key={s.label} className="stat-card fade-in" style={{animationDelay:`${i*0.1}s`}}>
                  <div style={{fontSize:'1.5rem',marginBottom:'0.75rem'}}>{s.icon}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2rem',color:s.color}}>{s.num}</div>
                  <div style={{color:'rgba(240,240,255,0.45)',fontSize:'0.78rem',textTransform:'uppercase',letterSpacing:1}}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'2rem'}} className="dash-grid">
              {/* Recent Orders */}
              <div className="form-section">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
                  <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700}}>Recent Orders</h3>
                  <span style={{color:'rgba(240,240,255,0.4)',fontSize:'0.82rem',cursor:'pointer'}} onClick={()=>navigate('/orders')}>View all →</span>
                </div>
                {orders.length===0 ? (
                  <div style={{textAlign:'center',padding:'2rem',color:'rgba(240,240,255,0.4)'}}>
                    <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>📦</div>
                    <p>No orders yet. Start shopping!</p>
                    <button className="btn-outline" style={{marginTop:'1rem',padding:'0.5rem 1.2rem',fontSize:'0.82rem'}} onClick={()=>navigate('/products')}>Shop Now</button>
                  </div>
                ) : orders.map(o=>{
                  const ss = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
                  const firstItem = o.items?.[0];
                  return (
                    <div key={o.id} style={{display:'flex',gap:'1rem',alignItems:'center',padding:'1rem',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                      {firstItem?.image && <img src={firstItem.image} style={{width:55,height:55,borderRadius:10,objectFit:'cover'}}/>}
                      <div style={{flex:1}}>
                        <div style={{fontWeight:600,fontSize:'0.88rem'}}>{firstItem?.name || 'Order'}{o.items?.length>1?` +${o.items.length-1} more`:''}</div>
                        <div style={{color:'rgba(240,240,255,0.4)',fontSize:'0.75rem',marginTop:'0.2rem'}}>
                          {o.payment_id} · {new Date(o.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{color:'#C8FF00',fontWeight:700,fontSize:'0.9rem'}}>${o.total}</div>
                        <span style={{background:ss.bg,color:ss.color,padding:'0.25rem 0.7rem',borderRadius:100,fontSize:'0.7rem',fontWeight:600,textTransform:'capitalize',display:'inline-block',marginTop:'0.3rem'}}>{o.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Wishlist */}
              <div className="form-section">
                <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem'}}>Saved Items</h3>
                {wishlist.length===0 ? (
                  <div style={{textAlign:'center',padding:'2rem',color:'rgba(240,240,255,0.4)'}}>
                    <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>❤️</div>
                    <p style={{fontSize:'0.85rem'}}>No saved items yet.</p>
                  </div>
                ) : wishlist.slice(0,5).map(p=>(
                  <div key={p.id} style={{display:'flex',gap:'0.75rem',alignItems:'center',marginBottom:'1rem'}}>
                    <img src={p.main_image} style={{width:55,height:55,borderRadius:10,objectFit:'cover',cursor:'pointer'}}
                      onClick={()=>navigate(`/products/${p.id}`)}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:'0.85rem',cursor:'pointer'}} onClick={()=>navigate(`/products/${p.id}`)}>{p.name}</div>
                      <div style={{color:'#C8FF00',fontWeight:700,fontSize:'0.9rem'}}>${p.price}</div>
                    </div>
                    <button onClick={()=>addItem(p.id)} style={{
                      background:'#7B2FFF',border:'none',color:'#fff',
                      padding:'0.4rem 0.8rem',borderRadius:100,cursor:'pointer',
                      fontSize:'0.75rem',fontWeight:600,fontFamily:"'DM Sans',sans-serif",
                      transition:'background 0.2s',
                    }}
                      onMouseEnter={e=>e.target.style.background='#FF2D78'}
                      onMouseLeave={e=>e.target.style.background='#7B2FFF'}
                    >+ Cart</button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer/>
      <style>{`@media(max-width:768px){.dash-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
