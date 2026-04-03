// frontend/src/pages/ProductDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { productsAPI } from '../api/client';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const { addItem }     = useCart();

  const [product, setProduct]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [mainImg, setMainImg]   = useState(0);
  const [selSize, setSelSize]   = useState(null);
  const [selColor,setSelColor]  = useState(0);
  const [reviews, setReviews]   = useState([]);
  const [adding,  setAdding]    = useState(false);

  useEffect(()=>{
    setLoading(true);
    Promise.all([productsAPI.get(id), productsAPI.reviews(id)])
      .then(([pr, rr])=>{ setProduct(pr.data.product); setReviews(rr.data.reviews); })
      .catch(()=>navigate('/products'))
      .finally(()=>setLoading(false));
  },[id]);

  if(loading) return <div className="page"><div className="loading-wrap"><div className="spinner"/></div></div>;
  if(!product) return null;

  const imgs   = Array.isArray(product.images) && product.images.length ? product.images : [product.main_image];
  const sizes  = Array.isArray(product.sizes)  ? product.sizes  : [];
  const colors = Array.isArray(product.colors) ? product.colors : [];
  const discount = product.original_price > product.price
    ? Math.round((1-product.price/product.original_price)*100) : 0;

  const handleAdd = async () => {
    setAdding(true);
    const colorHex = colors[selColor]?.hex || null;
    await addItem(product.id, 1, selSize, colorHex);
    setAdding(false);
  };

  const handleBuy = async () => {
    const colorHex = colors[selColor]?.hex || null;
    const ok = await addItem(product.id, 1, selSize, colorHex);
    if(ok) navigate('/cart');
  };

  return (
    <div className="page">
      <div style={{maxWidth:1100,margin:'0 auto',padding:'1.5rem 2rem 0'}}>
        <button className="btn-outline" style={{padding:'0.5rem 1rem',fontSize:'0.8rem'}} onClick={()=>navigate(-1)}>← Back</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'3rem',maxWidth:1100,margin:'0 auto',padding:'2rem'}} className="detail-grid">
        {/* Images */}
        <div className="fade-in">
          <div style={{borderRadius:24,overflow:'hidden',background:'#0F0F1A',aspectRatio:'1',position:'relative'}}>
            <img src={imgs[mainImg]} alt={product.name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            {discount>0 && (
              <span style={{position:'absolute',top:16,right:16,background:'#FF2D78',color:'#fff',padding:'0.3rem 0.8rem',borderRadius:100,fontSize:'0.8rem',fontWeight:700}}>
                -{discount}% OFF
              </span>
            )}
          </div>
          <div style={{display:'flex',gap:'0.75rem',marginTop:'1rem'}}>
            {imgs.map((img,i)=>(
              <img key={i} src={img} alt="" onClick={()=>setMainImg(i)}
                style={{width:70,height:70,borderRadius:12,objectFit:'cover',cursor:'pointer',
                  border:`2px solid ${mainImg===i?'#7B2FFF':'transparent'}`,transition:'border 0.2s'}}/>
            ))}
          </div>
        </div>

        {/* Info */}
        <div style={{animationDelay:'0.1s'}} className="fade-in">
          <div style={{fontSize:'0.78rem',color:'rgba(240,240,255,0.45)',textTransform:'uppercase',letterSpacing:2}}>{product.brand}</div>
          <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:'2.2rem',fontWeight:800,margin:'0.5rem 0'}}>{product.name}</h1>

          <div style={{display:'flex',gap:'0.5rem',margin:'0.75rem 0'}}>
            {product.badge && (
              <span className={`badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
            )}
            <span style={{background:'rgba(0,245,255,0.1)',color:'#00F5FF',border:'1px solid rgba(0,245,255,0.2)',padding:'0.25rem 0.7rem',borderRadius:100,fontSize:'0.7rem',fontWeight:600}}>{product.category}</span>
          </div>

          {/* Rating */}
          <div style={{display:'flex',alignItems:'center',gap:'0.5rem',margin:'0.5rem 0'}}>
            <span style={{color:'#FFB800'}}>{'★'.repeat(Math.round(product.rating||4))}{'☆'.repeat(5-Math.round(product.rating||4))}</span>
            <span style={{color:'rgba(240,240,255,0.45)',fontSize:'0.85rem'}}>({reviews.length} reviews)</span>
          </div>

          {/* Price */}
          <div style={{display:'flex',alignItems:'center',gap:'1rem',margin:'1rem 0'}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',color:'#C8FF00'}}>${product.price}</span>
            {product.original_price>product.price && (
              <span style={{fontSize:'1.1rem',color:'rgba(240,240,255,0.4)',textDecoration:'line-through'}}>${product.original_price}</span>
            )}
          </div>

          <p style={{color:'rgba(240,240,255,0.55)',lineHeight:1.75,fontSize:'0.9rem'}}>{product.description}</p>

          {/* Colors */}
          {colors.length>0 && (
            <div style={{marginTop:'1.5rem'}}>
              <div style={{fontSize:'0.8rem',color:'rgba(240,240,255,0.45)',marginBottom:'0.5rem',fontWeight:500}}>COLOR — <span style={{color:'#F0F0FF'}}>{colors[selColor]?.name || ''}</span></div>
              <div style={{display:'flex',gap:'0.75rem'}}>
                {colors.map((c,i)=>(
                  <div key={i} onClick={()=>setSelColor(i)} style={{
                    width:32,height:32,borderRadius:'50%',cursor:'pointer',
                    background: typeof c==='object'?c.hex:c,
                    border:`2px solid ${selColor===i?'#fff':'transparent'}`,
                    transform:selColor===i?'scale(1.15)':'',transition:'all 0.2s',
                  }}/>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length>0 && (
            <div style={{marginTop:'1.2rem'}}>
              <div style={{fontSize:'0.8rem',color:'rgba(240,240,255,0.45)',marginBottom:'0.5rem',fontWeight:500}}>
                SIZE (US){selSize && <span style={{color:'#C8FF00'}}> — {selSize}</span>}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:'0.5rem'}}>
                {sizes.map(s=>(
                  <button key={s} onClick={()=>setSelSize(s)} style={{
                    width:52,height:52,borderRadius:12,
                    background: selSize===s?'rgba(123,47,255,0.2)':'rgba(255,255,255,0.04)',
                    border:`1px solid ${selSize===s?'#7B2FFF':'rgba(255,255,255,0.08)'}`,
                    color: selSize===s?'#C8FF00':'#F0F0FF',
                    fontSize:'0.85rem',fontWeight:600,cursor:'pointer',transition:'all 0.2s',
                    fontFamily:"'DM Sans',sans-serif",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
            <button className="btn-primary" style={{flex:1,justifyContent:'center'}} onClick={handleAdd} disabled={adding}>
              {adding?'Adding...':'Add to Cart 🛒'}
            </button>
            <button className="btn-acid" onClick={handleBuy}>Buy Now</button>
          </div>

          {/* Features */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginTop:'1.5rem'}}>
            {['🚚 Free shipping over $150','↩️ 30-day returns','✅ 100% authentic','💳 Secure payment'].map(f=>(
              <div key={f} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'0.75rem 1rem',fontSize:'0.82rem',color:'rgba(240,240,255,0.5)',display:'flex',alignItems:'center',gap:6}}>
                {f}
              </div>
            ))}
          </div>

          {/* Stock indicator */}
          <div style={{marginTop:'1rem',fontSize:'0.82rem'}}>
            {product.stock < 20
              ? <span style={{color:'#FF2D78'}}>⚡ Only {product.stock} left in stock!</span>
              : <span style={{color:'#C8FF00'}}>✓ In stock ({product.stock} available)</span>
            }
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length>0 && (
        <div className="section" style={{borderTop:'1px solid rgba(255,255,255,0.08)',marginTop:'2rem'}}>
          <div style={{marginBottom:'2rem'}}>
            <div className="section-eyebrow">✦ Customer reviews</div>
            <h2 className="section-title">What They're <span>Saying</span></h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'1rem'}}>
            {reviews.map(r=>(
              <div key={r.id} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'1.2rem'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                  <span style={{fontWeight:600,fontSize:'0.9rem'}}>{r.user_name}</span>
                  <span style={{color:'#FFB800'}}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
                </div>
                {r.title && <div style={{fontWeight:600,marginBottom:'0.25rem',fontSize:'0.85rem'}}>{r.title}</div>}
                <p style={{color:'rgba(240,240,255,0.5)',fontSize:'0.85rem',lineHeight:1.6}}>{r.body}</p>
                <div style={{color:'rgba(240,240,255,0.3)',fontSize:'0.75rem',marginTop:'0.75rem'}}>{new Date(r.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer/>
      <style>{`
        @media(max-width:700px){
          .detail-grid{grid-template-columns:1fr!important;}
        }
      `}</style>
    </div>
  );
}
