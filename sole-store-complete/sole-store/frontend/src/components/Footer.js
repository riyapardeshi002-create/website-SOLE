// frontend/src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const cols = [
    { title:'Shop',    links:[['All Shoes','/products'],['Running','/products?category=running'],['Casual','/products?category=casual'],['Sports','/products?category=sports']] },
    { title:'Account', links:[['Sign In','/login'],['Create Account','/signup'],['Dashboard','/dashboard'],['My Cart','/cart']] },
    { title:'Company', links:[['About','#'],['Careers','#'],['Sustainability','#'],['Press','#']] },
  ];
  return (
    <footer style={{borderTop:'1px solid rgba(255,255,255,0.08)',background:'#0F0F1A',padding:'3rem 2rem 2rem',marginTop:'4rem'}}>
      <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:'3rem'}} className="footer-grid">
        <div>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',background:'linear-gradient(135deg,#C8FF00,#00F5FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>SOLE</div>
          <p style={{color:'rgba(240,240,255,0.4)',fontSize:'0.85rem',lineHeight:1.7,marginTop:'0.75rem',maxWidth:260}}>
            Premium footwear for the bold generation. Every step is a statement.
          </p>
        </div>
        {cols.map(c => (
          <div key={c.title}>
            <h4 style={{fontFamily:"'Syne',sans-serif",fontSize:'0.82rem',fontWeight:700,marginBottom:'1rem',textTransform:'uppercase',letterSpacing:1}}>{c.title}</h4>
            {c.links.map(([label,to])=>(
              <Link key={label} to={to} style={{display:'block',color:'rgba(240,240,255,0.4)',fontSize:'0.85rem',marginBottom:'0.5rem',textDecoration:'none',transition:'color 0.2s'}}
                onMouseEnter={e=>e.target.style.color='#C8FF00'}
                onMouseLeave={e=>e.target.style.color='rgba(240,240,255,0.4)'}
              >{label}</Link>
            ))}
          </div>
        ))}
      </div>
      <div style={{maxWidth:1200,margin:'2rem auto 0',borderTop:'1px solid rgba(255,255,255,0.08)',paddingTop:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem'}}>
        <p style={{color:'rgba(240,240,255,0.3)',fontSize:'0.78rem'}}>© 2025 SOLE Premium Footwear. All rights reserved.</p>
        <p style={{color:'rgba(240,240,255,0.3)',fontSize:'0.78rem'}}>Powered by PostgreSQL + Express + React 💜</p>
      </div>
      <style>{`
        @media(max-width:700px){ .footer-grid{grid-template-columns:1fr 1fr!important;} }
        @media(max-width:400px){ .footer-grid{grid-template-columns:1fr!important;} }
      `}</style>
    </footer>
  );
}
