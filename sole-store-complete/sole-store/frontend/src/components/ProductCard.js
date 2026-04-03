// frontend/src/components/ProductCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const BADGE = {
  Sale:{ bg:'rgba(255,45,120,0.2)',  color:'#FF2D78', border:'rgba(255,45,120,0.3)' },
  New: { bg:'rgba(200,255,0,0.15)',  color:'#C8FF00', border:'rgba(200,255,0,0.3)'  },
  Hot: { bg:'rgba(123,47,255,0.2)', color:'#a78bfa', border:'rgba(123,47,255,0.3)' },
};

export default function ProductCard({ product, index=0 }) {
  const navigate    = useNavigate();
  const { addItem } = useCart();
  const bs          = BADGE[product.badge] || BADGE.New;
  const discount    = product.original_price > product.price
    ? Math.round((1 - product.price / product.original_price) * 100) : 0;

  return (
    <div className="card" style={{
      cursor:'pointer', position:'relative',
      animation:`fadeUp 0.4s ease ${index*0.06}s both`,
      transition:'transform 0.3s, border-color 0.3s, box-shadow 0.3s',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.borderColor='rgba(123,47,255,0.4)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,0.4),0 0 30px rgba(123,47,255,0.15)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=''; e.currentTarget.style.borderColor=''; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Image area */}
      <div style={{position:'relative',height:220,overflow:'hidden',background:'linear-gradient(135deg,#0F0F1A,#16162A)'}}
        onClick={()=>navigate(`/products/${product.id}`)}
      >
        <img src={product.main_image} alt={product.name}
          style={{width:'100%',height:'100%',objectFit:'cover',transition:'transform 0.4s'}}
          onMouseEnter={e=>e.target.style.transform='scale(1.08)'}
          onMouseLeave={e=>e.target.style.transform=''}
        />
        {product.badge && (
          <span style={{
            position:'absolute',top:12,left:12,
            padding:'0.25rem 0.7rem',borderRadius:100,
            fontSize:'0.7rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px',
            background:bs.bg,color:bs.color,border:`1px solid ${bs.border}`,
          }}>{product.badge}</span>
        )}
        {discount>0 && (
          <span style={{
            position:'absolute',top:12,right:12,
            background:'#FF2D78',color:'#fff',
            padding:'0.25rem 0.5rem',borderRadius:8,fontSize:'0.7rem',fontWeight:700,
          }}>-{discount}%</span>
        )}
        {/* Hover action buttons */}
        <div className="product-card-actions" style={{
          position:'absolute',bottom:0,left:0,right:0,
          background:'linear-gradient(to top,rgba(8,8,16,0.95),transparent)',
          padding:'2rem 1rem 1rem',
          display:'flex',gap:'0.5rem',
          transform:'translateY(100%)',transition:'transform 0.3s',
        }}>
          <button onClick={e=>{e.stopPropagation();addItem(product.id);}} style={{
            flex:1,background:'#7B2FFF',border:'none',color:'#fff',
            padding:'0.6rem',borderRadius:100,fontSize:'0.76rem',fontWeight:600,
            cursor:'pointer',fontFamily:"'DM Sans',sans-serif",transition:'background 0.2s',
          }}
            onMouseEnter={e=>e.target.style.background='#FF2D78'}
            onMouseLeave={e=>e.target.style.background='#7B2FFF'}
          >Add to Cart</button>
          <button onClick={e=>{e.stopPropagation();addItem(product.id);navigate('/cart');}} style={{
            flex:1,background:'#C8FF00',border:'none',color:'#080810',
            padding:'0.6rem',borderRadius:100,fontSize:'0.76rem',fontWeight:700,
            cursor:'pointer',fontFamily:"'DM Sans',sans-serif",
          }}>Buy Now</button>
        </div>
      </div>

      {/* Info */}
      <div style={{padding:'1.2rem'}} onClick={()=>navigate(`/products/${product.id}`)}>
        <div style={{fontSize:'0.7rem',color:'rgba(240,240,255,0.45)',textTransform:'uppercase',letterSpacing:1}}>{product.brand}</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:'1rem',fontWeight:700,margin:'0.3rem 0'}}>{product.name}</div>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.3rem'}}>
          <span style={{color:'#C8FF00',fontWeight:700,fontSize:'1.1rem'}}>${product.price}</span>
          {product.original_price > product.price && (
            <span style={{color:'rgba(240,240,255,0.4)',textDecoration:'line-through',fontSize:'0.85rem'}}>${product.original_price}</span>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'0.3rem',marginTop:'0.4rem'}}>
          <span style={{color:'#FFB800',fontSize:'0.78rem'}}>
            {'★'.repeat(Math.round(product.rating||4))}{'☆'.repeat(5-Math.round(product.rating||4))}
          </span>
          <span style={{color:'rgba(240,240,255,0.35)',fontSize:'0.72rem'}}>({product.review_count||0})</span>
        </div>
        {Array.isArray(product.colors) && product.colors.length>0 && (
          <div style={{display:'flex',gap:'0.4rem',marginTop:'0.75rem'}}>
            {product.colors.slice(0,4).map((c,i)=>(
              <div key={i} style={{
                width:12,height:12,borderRadius:'50%',
                background: typeof c==='object' ? c.hex : c,
                border:'1px solid rgba(255,255,255,0.2)',
              }}/>
            ))}
          </div>
        )}
      </div>

      <style>{`.card:hover .product-card-actions{transform:translateY(0)!important;}`}</style>
    </div>
  );
}
