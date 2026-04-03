// frontend/src/pages/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const upd = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handle = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to SOLE 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:'2.5rem',marginBottom:'0.25rem'}}>JOIN<br/>SOLE</h2>
        <p style={{color:'rgba(240,240,255,0.45)',fontSize:'0.9rem',marginBottom:'2rem'}}>Create your account — it's free</p>

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <input className="input-field" placeholder="Alex Johnson" value={form.name} onChange={upd('name')} required/>
          </div>
          <div className="form-group">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={upd('email')} required/>
          </div>
          <div className="form-group" style={{marginBottom:'1.5rem'}}>
            <label className="input-label">Password</label>
            <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password} onChange={upd('password')} required/>
          </div>
          <button className="btn-acid" type="submit" style={{width:'100%',justifyContent:'center'}} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account →'}
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
          display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',
        }}
          onClick={()=>toast('Google auth not implemented — use email',{icon:'ℹ️'})}
        >
          <span style={{fontWeight:800,color:'#4285F4'}}>G</span> Sign up with Google
        </button>

        <p style={{textAlign:'center',marginTop:'1.5rem',color:'rgba(240,240,255,0.45)',fontSize:'0.85rem'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'#C8FF00',fontWeight:600,textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
