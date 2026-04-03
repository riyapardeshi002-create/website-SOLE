// frontend/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar        from './components/Navbar';
import Home          from './pages/Home';
import Products      from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import Dashboard     from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/products"      element={<Products />} />
            <Route path="/products/:id"  element={<ProductDetail />} />
            <Route path="/cart"          element={<Cart />} />
            <Route path="/checkout"      element={<Checkout />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/signup"        element={<Signup />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="*"             element={<Home />} />
          </Routes>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#16162A',
                color: '#F0F0FF',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.88rem',
              },
              success: { iconTheme: { primary: '#C8FF00', secondary: '#080810' } },
              error:   { iconTheme: { primary: '#FF2D78', secondary: '#fff'    } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
