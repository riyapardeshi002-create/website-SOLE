// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email,   setEmail]   = useState('');
  const [pass,    setPass]    = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, pass);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',marginBottom:'0.25rem'}}>WELCOME<br/>BACK</h2>
        <p style={{color:'rgba(240,240,255,0.45)',fontSize:'0.9rem',marginBottom:'2rem'}}>Sign in to your SOLE account</p>

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
          </div>
          <div className="form-group" style={{marginBottom:'0.75rem'}}>
            <label className="input-label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} required/>
          </div>
          <div style={{textAlign:'right',marginBottom:'1.5rem'}}>
            <span style={{color:'#7B2FFF',fontSize:'0.82rem',cursor:'pointer'}}>Forgot password?</span>
          </div>
          <button className="btn-primary" type="submit" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{display:'flex',alignItems:'center',gap:'1rem',margin:'1.5rem 0'}}>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
          <span style={{color:'rgba(240,240,255,0.4)',fontSize:'0.8rem'}}>or</span>
          <div style={{flex:1,height:1,background:'rgba(255,255,255,0.08)'}}/>
        </div>

        <button style={{
          width:'100%',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
          color:'#F0F0FF',padding:'0.85rem',borderRadius:12,
          fontFamily:"'DM Sans',sans-serif",fontSize:'0.9rem',cursor:'pointer',
          display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',transition:'all 0.2s',
        }}
          onClick={()=>toast('Google auth not implemented — use email',{icon:'ℹ️'})}
          onMouseEnter={e=>{e.target.style.borderColor='#7B2FFF';}}
          onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,0.08)';}}
        >
          <span style={{fontWeight:800,color:'#4285F4'}}>G</span> Continue with Google
        </button>

        <p style={{textAlign:'center',marginTop:'1.5rem',color:'rgba(240,240,255,0.45)',fontSize:'0.85rem'}}>
          Don't have an account?{' '}
          <Link to="/signup" style={{color:'#C8FF00',fontWeight:600,textDecoration:'none'}}>Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
