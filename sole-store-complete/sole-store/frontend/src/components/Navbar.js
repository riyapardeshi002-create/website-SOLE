// frontend/src/components/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout }  = useAuth();
  const { cartCount }     = useCart();
  const navigate          = useNavigate();
  const { pathname }      = useLocation();
  const [mobileOpen, set] = useState(false);

  const links = [
    { label:'Home',      to:'/' },
    { label:'Shop',      to:'/products' },
    { label:'Dashboard', to:'/dashboard' },
  ];

  const linkStyle = (to) => ({
    color: pathname === to ? '#F0F0FF' : 'rgba(240,240,255,0.45)',
    textDecoration: 'none', fontSize: '0.82rem', fontWeight: 500,
    textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'color 0.2s',
    paddingBottom: 2,
    borderBottom: pathname === to ? '2px solid #7B2FFF' : '2px solid transparent',
  });

  return (
    <>
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,height:70,
        padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between',
        background:'rgba(8,8,16,0.88)',backdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          fontFamily:"'Bebas Neue',sans-serif",fontSize:'2rem',letterSpacing:2,
          background:'linear-gradient(135deg,#C8FF00,#00F5FF)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',textDecoration:'none',
        }}>SOLE</Link>

        {/* Desktop nav */}
        <div style={{display:'flex',gap:'2rem',alignItems:'center'}} className="desktop-nav">
          {links.map(l => <Link key={l.to} to={l.to} style={linkStyle(l.to)}>{l.label}</Link>)}
        </div>

        {/* Actions */}
        <div style={{display:'flex',gap:'0.75rem',alignItems:'center'}}>
          {user ? (
            <>
              <span style={{color:'rgba(240,240,255,0.55)',fontSize:'0.82rem'}}>Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={()=>{logout();navigate('/');}} style={{
                background:'none',border:'1px solid rgba(255,255,255,0.12)',
                color:'rgba(240,240,255,0.7)',padding:'0.45rem 1rem',
                borderRadius:100,fontSize:'0.78rem',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",
              }}>Log out</button>
            </>
          ) : (
            <Link to="/login" style={{
              background:'none',border:'1px solid rgba(255,255,255,0.12)',
              color:'rgba(240,240,255,0.7)',padding:'0.45rem 1rem',
              borderRadius:100,fontSize:'0.78rem',cursor:'pointer',textDecoration:'none',
              fontFamily:"'DM Sans',sans-serif",
            }}>Sign in</Link>
          )}

          <Link to="/cart" style={{
            position:'relative',background:'linear-gradient(135deg,#7B2FFF,#FF2D78)',
            border:'none',color:'#fff',padding:'0.45rem 1.2rem',borderRadius:100,
            fontSize:'0.78rem',cursor:'pointer',fontWeight:600,textDecoration:'none',
            display:'flex',alignItems:'center',gap:6,fontFamily:"'DM Sans',sans-serif",
          }}>
            🛒 Cart
            {cartCount > 0 && (
              <span style={{
                position:'absolute',top:-6,right:-6,
                background:'#C8FF00',color:'#080810',
                width:18,height:18,borderRadius:'50%',
                fontSize:'0.62rem',fontWeight:800,
                display:'flex',alignItems:'center',justifyContent:'center',
              }}>{cartCount}</span>
            )}
          </Link>

          {/* Mobile burger */}
          <button onClick={()=>set(o=>!o)} style={{
            display:'none',background:'none',border:'none',
            color:'#F0F0FF',fontSize:'1.4rem',cursor:'pointer',
          }} className="burger-btn">{mobileOpen?'✕':'☰'}</button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          position:'fixed',top:70,left:0,right:0,zIndex:99,
          background:'#0F0F1A',borderBottom:'1px solid rgba(255,255,255,0.08)',
          padding:'1.5rem 2rem',display:'flex',flexDirection:'column',gap:'1.2rem',
          animation:'fadeUp 0.3s ease',
        }}>
          {links.map(l=>(
            <Link key={l.to} to={l.to} onClick={()=>set(false)} style={{
              color:'#F0F0FF',textDecoration:'none',fontSize:'1.2rem',
              fontFamily:"'Syne',sans-serif",fontWeight:700,
            }}>{l.label}</Link>
          ))}
          {user
            ? <span style={{color:'rgba(240,240,255,0.5)',cursor:'pointer'}}
                onClick={()=>{logout();navigate('/');set(false);}}>Log out</span>
            : <Link to="/login" onClick={()=>set(false)} style={{color:'#C8FF00',textDecoration:'none'}}>Sign In</Link>
          }
        </div>
      )}

      <style>{`
        @media(max-width:768px){
          .desktop-nav{display:none!important;}
          .burger-btn{display:block!important;}
        }
      `}</style>
    </>
  );
}
