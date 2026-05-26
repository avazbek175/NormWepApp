import React, { useState } from 'react';
import { Lock, LogIn, ChevronLeft } from 'lucide-react';
import tgBridge from '../telegram-helper';

export default function AdminLogin({ onLoginSuccess, onBackToMenu, currentPassword }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === currentPassword) {
      tgBridge.triggerHaptic('success');
      onLoginSuccess();
    } else {
      tgBridge.triggerHaptic('error');
      setError('Noto\'g\'ri parol! Qaytadan urinib ko\'ring.');
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-lock-icon-large">
        <Lock size={48} />
      </div>
      
      <div className="admin-login-card">
        <h2>Admin Panel</h2>
        <p>Boshqaruv tizimiga kirish uchun parolni kiriting (Standart: admin)</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '4px' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
              required
            />
          </div>
          
          {error && (
            <p style={{ color: 'var(--secondary)', fontSize: '13px', margin: '-8px 0 16px 0', fontWeight: 600 }}>
              ⚠️ {error}
            </p>
          )}

          <button type="submit" className="btn-admin" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogIn size={18} /> Kirish
          </button>
        </form>
      </div>

      <button 
        onClick={() => {
          tgBridge.triggerHaptic('light');
          onBackToMenu();
        }}
        style={{ 
          marginTop: '24px', 
          background: 'none', 
          border: 'none', 
          color: 'var(--text-muted)', 
          fontSize: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          cursor: 'pointer'
        }}
      >
        <ChevronLeft size={16} /> Menyoga qaytish
      </button>
    </div>
  );
}
