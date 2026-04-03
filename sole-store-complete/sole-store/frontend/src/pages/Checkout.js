// frontend/src/pages/Checkout.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../api/client';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, shipping, total, clearCart } = useCart();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [payId,   setPayId]   = useState(null);

  const [ship, setShip] = useState({
    name: user?.name||'', email: user?.email||'',
    street:'', city:'', state:'', zip:'', country:'US',
  });
  const [card] = useState({ number:'4242 4242 4242 4242', expiry:'12/28', cvv:'***' });

  const updShip = k => e => setShip(s=>({...s,[k]:e.target.value}));

  const placeOrder = async () => {
    if (!ship.street || !ship.city || !ship.zip) { toast.error('Please fill all shipping fields'); return; }
    setLoading(true);
    try {
      const { data } = await ordersAPI.create({
        shippingAddress: { name:ship.name, street:ship.street, city:ship.city, state:ship.state, zip:ship.zip, country:ship.country },
        paymentMethod: 'card',
      });
      setOrderId(data.order.id);
      setPayId(data.order.payment_id);
      await clearCart();
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (!user) { navigate('/login'); return null; }
  if (items.length===0 && step!==3) { navigate('/cart'); return null; }

  /* ─ Step 3: Success ─ */
  if (step===3) return (
    <div className="page">
      <div style={{maxWidth:500,margin:'0 auto',padding:'2rem',textAlign:'center'}}>
        <div className="scale-in">
          <div style={{width:80,height:80,background:'linear-gradient(135deg,#C8FF00,#00F5FF)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2rem',animation:'glow 2s infinite'}}>✓</div>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'3rem',marginBottom:'0.5rem'}}>ORDER PLACED!</h2>
          <p style={{color:'rgba(240,240,255,0.5)',lineHeight:1.7,marginBottom:'2rem'}}>
            Your sneakers are on their way! Check your email for confirmation.
          </p>
          <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.5rem',marginBottom:'2rem',textAlign:'left'}}>
            {orderId && <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}><span style={{color:'rgba(240,240,255,0.5)'}}>Order ID</span><span style={{color:'#C8FF00',fontWeight:700,fontSize:'0.85rem'}}>{payId}</span></div>}
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'rgba(240,240,255,0.5)'}}>Amount Paid</span><span style={{fontWeight:700}}>${total || subtotal + shipping}</span></div>
          </div>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn-primary" onClick={()=>navigate('/dashboard')}>View Dashboard</button>
            <button className="btn-outline" onClick={()=>navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ─ Steps indicator ─ */
  const steps = ['Shipping','Payment','Confirm'];
  return (
    <div className="page">
      <div style={{maxWidth:1100,margin:'0 auto',padding:'2rem'}}>
        <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',marginBottom:'0.5rem'}}>CHECKOUT</h1>

        {/* Stepper */}
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'2rem'}}>
          {steps.map((s,i)=>(
            <React.Fragment key={s}>
              <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <div style={{
                  width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.8rem',
                  background: step===i+1?'#7B2FFF':step>i+1?'#C8FF00':'rgba(255,255,255,0.06)',
                  color: step>i+1?'#080810':'#F0F0FF',
                  border:`1px solid ${step>=i+1?'#7B2FFF':'rgba(255,255,255,0.08)'}`,
                }}>{step>i+1?'✓':i+1}</div>
                <span style={{fontSize:'0.82rem',color:step===i+1?'#F0F0FF':'rgba(240,240,255,0.4)',fontWeight:step===i+1?600:400}}>{s}</span>
              </div>
              {i<2 && <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>}
            </React.Fragment>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 360px',gap:'2rem',alignItems:'start'}} className="checkout-layout">
          {/* Left: form */}
          <div>
            {step===1 && (
              <div className="form-section fade-in">
                <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem'}}>Shipping Information</h3>
                <div className="form-row">
                  <div className="form-group"><label className="input-label">Full Name</label><input className="input-field" value={ship.name} onChange={updShip('name')} placeholder="Alex Johnson"/></div>
                  <div className="form-group"><label className="input-label">Email</label><input className="input-field" value={ship.email} onChange={updShip('email')} placeholder="alex@example.com"/></div>
                </div>
                <div className="form-group"><label className="input-label">Street Address</label><input className="input-field" value={ship.street} onChange={updShip('street')} placeholder="123 Main Street, Apt 4B"/></div>
                <div className="form-row">
                  <div className="form-group"><label className="input-label">City</label><input className="input-field" value={ship.city} onChange={updShip('city')} placeholder="New York"/></div>
                  <div className="form-group"><label className="input-label">ZIP Code</label><input className="input-field" value={ship.zip} onChange={updShip('zip')} placeholder="10001"/></div>
                </div>
                <button className="btn-primary" onClick={()=>setStep(2)}>Continue to Payment →</button>
              </div>
            )}

            {step===2 && (
              <div className="form-section fade-in">
                <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem'}}>Payment Details</h3>
                {/* Card preview */}
                <div style={{background:'linear-gradient(135deg,#7B2FFF,#2d1b69,#FF2D78)',borderRadius:16,padding:'1.5rem',marginBottom:'1.5rem',position:'relative',overflow:'hidden'}}>
                  <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.08)'}}/>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1rem'}}>
                    <span style={{fontSize:'0.75rem',opacity:0.7}}>CREDIT CARD</span>
                    <span style={{fontSize:'1.3rem'}}>💳</span>
                  </div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'1.4rem',letterSpacing:3,color:'#fff',margin:'1rem 0 0.5rem'}}>{card.number}</div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.8rem',opacity:0.8}}>
                    <span>{ship.name || 'CARDHOLDER NAME'}</span>
                    <span>{card.expiry}</span>
                  </div>
                </div>
                <div className="form-group"><label className="input-label">Card Number</label><input className="input-field" defaultValue={card.number} readOnly/></div>
                <div className="form-row">
                  <div className="form-group"><label className="input-label">Expiry</label><input className="input-field" defaultValue={card.expiry} readOnly/></div>
                  <div className="form-group"><label className="input-label">CVV</label><input className="input-field" defaultValue={card.cvv} readOnly/></div>
                </div>
                <div style={{background:'rgba(200,255,0,0.06)',border:'1px solid rgba(200,255,0,0.15)',borderRadius:12,padding:'0.9rem',marginBottom:'1.5rem',fontSize:'0.82rem',color:'rgba(240,240,255,0.55)'}}>
                  🔒 This is a demo. No real payment is processed. Use any card details.
                </div>
                <div style={{display:'flex',gap:'1rem'}}>
                  <button className="btn-outline" onClick={()=>setStep(1)}>← Back</button>
                  <button className="btn-primary" onClick={placeOrder} disabled={loading} style={{flex:1,justifyContent:'center'}}>
                    {loading ? 'Placing Order...' : `Place Order — $${total}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: summary */}
          <div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'1.5rem',position:'sticky',top:90}}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.5rem'}}>Order Summary</h3>
              {items.map(i=>(
                <div key={i.id} style={{display:'flex',gap:'0.75rem',marginBottom:'0.75rem',alignItems:'center'}}>
                  <img src={i.main_image} style={{width:50,height:50,borderRadius:10,objectFit:'cover'}}/>
                  <div style={{flex:1}}><div style={{fontSize:'0.82rem',fontWeight:600}}>{i.name}</div><div style={{fontSize:'0.72rem',color:'rgba(240,240,255,0.4)'}}>×{i.qty}</div></div>
                  <div style={{color:'#C8FF00',fontWeight:700,fontSize:'0.9rem'}}>${(i.unit_price*i.qty).toFixed(2)}</div>
                </div>
              ))}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'1rem',marginTop:'0.5rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem',fontSize:'0.9rem'}}><span style={{color:'rgba(240,240,255,0.5)'}}>Subtotal</span><span>${subtotal}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem',fontSize:'0.9rem'}}><span style={{color:'rgba(240,240,255,0.5)'}}>Shipping</span><span>{shipping===0?'Free':'$'+shipping}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'0.75rem',marginTop:'0.25rem',fontWeight:700,fontSize:'1.1rem',color:'#C8FF00'}}>
                  <span style={{color:'#F0F0FF'}}>Total</span><span>${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:700px){.checkout-layout{grid-template-columns:1fr!important;} .form-row{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
