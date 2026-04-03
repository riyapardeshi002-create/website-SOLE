// frontend/src/pages/Cart.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, shipping, total, cartCount, updateItem, removeItem } = useCart();

  if (!user) return (
    <div className="page">
      <div className="empty-state" style={{paddingTop:'6rem'}}>
        <div className="icon">🔐</div>
        <h3>Sign in to view your cart</h3>
        <p>Your cart is waiting for you.</p>
        <button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>navigate('/login')}>Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div style={{maxWidth:900,margin:'0 auto',padding:'2rem'}}>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'3rem',marginBottom:'2rem'}}>
          MY CART <span style={{color:'rgba(240,240,255,0.4)',fontSize:'1.5rem'}}>({cartCount} items)</span>
        </h1>

        {items.length===0 ? (
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <button className="btn-primary" style={{marginTop:'1rem'}} onClick={()=>navigate('/products')}>Start Shopping</button>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 310px',gap:'2rem',alignItems:'start'}} className="cart-layout">
            {/* Items */}
            <div>
              {items.map(item=>(
                <div key={item.id} className="cart-item">
                  <img src={item.main_image} alt={item.name}
                    style={{cursor:'pointer'}} onClick={()=>navigate(`/products/${item.product_id}`)}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'0.95rem'}}>{item.name}</div>
                    <div style={{color:'rgba(240,240,255,0.45)',fontSize:'0.8rem',marginTop:'0.2rem'}}>{item.brand} · ${item.unit_price} each {item.size && `· US ${item.size}`}</div>
                    <div style={{marginTop:'0.75rem'}}>
                      <div className="qty-control" style={{width:'fit-content'}}>
                        <button className="qty-btn" onClick={()=>item.qty>1?updateItem(item.id,item.qty-1):removeItem(item.id)}>−</button>
                        <span style={{fontWeight:700,fontSize:'0.9rem',minWidth:20,textAlign:'center'}}>{item.qty}</span>
                        <button className="qty-btn" onClick={()=>updateItem(item.id,item.qty+1)}>+</button>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{color:'#C8FF00',fontWeight:700,fontSize:'1.1rem'}}>${(item.unit_price*item.qty).toFixed(2)}</div>
                    <button onClick={()=>removeItem(item.id)} style={{
                      background:'none',border:'none',color:'rgba(240,240,255,0.35)',
                      cursor:'pointer',fontSize:'1.2rem',marginTop:'0.5rem',transition:'color 0.2s',
                    }}
                      onMouseEnter={e=>e.target.style.color='#FF2D78'}
                      onMouseLeave={e=>e.target.style.color='rgba(240,240,255,0.35)'}
                    >🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'1.5rem',position:'sticky',top:90}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem'}}>Order Summary</h3>
              {[['Subtotal',`$${subtotal}`],['Shipping', shipping===0?'Free':`$${shipping}`]].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:'0.75rem',fontSize:'0.9rem'}}>
                  <span style={{color:'rgba(240,240,255,0.55)'}}>{l}</span><span>{v}</span>
                </div>
              ))}
              {shipping===0 && <div style={{fontSize:'0.78rem',color:'#C8FF00',marginBottom:'0.75rem'}}>✓ You qualify for free shipping!</div>}
              <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'0.75rem',marginTop:'0.25rem',fontWeight:700,fontSize:'1.1rem',color:'#C8FF00'}}>
                <span style={{color:'#F0F0FF'}}>Total</span><span>${total}</span>
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:'1.5rem'}} onClick={()=>navigate('/checkout')}>
                Checkout →
              </button>
              <button className="btn-outline" style={{width:'100%',justifyContent:'center',marginTop:'0.75rem'}} onClick={()=>navigate('/products')}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer/>
      <style>{`@media(max-width:680px){.cart-layout{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
