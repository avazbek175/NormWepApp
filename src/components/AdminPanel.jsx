import React, { useState } from 'react';
import { PlusCircle, Trash2, Key, Database, ArrowLeft, LogOut, Image, Check } from 'lucide-react';
import tgBridge from '../telegram-helper';

export default function AdminPanel({ products, onAddProduct, onDeleteProduct, onPasswordChange, onLogout, currentPassword }) {
  // Add Product Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('burgers');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  
  // Customization presets selection
  const [hasCheese, setHasCheese] = useState(true);
  const [hasPatty, setHasPatty] = useState(true);
  const [hasJalapeno, setHasJalapeno] = useState(false);

  // Change Password Form State
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Handle file select and convert to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        tgBridge.triggerHaptic('error');
        alert("Rasm hajmi juda katta! Maksimal 2MB yuklash mumkin.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result); // Base64 encoding
        tgBridge.triggerHaptic('light');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Add Product Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim() || !price || !desc.trim()) {
      tgBridge.triggerHaptic('error');
      alert("Iltimos, barcha zaruriy maydonlarni to'ldiring!");
      return;
    }

    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      tgBridge.triggerHaptic('error');
      alert("Narx musbat son bo'lishi kerak!");
      return;
    }

    // Default image if empty
    const finalImg = imgUrl.trim() || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80";

    // Set customization options based on selection
    const customOpts = [];
    if (hasCheese) customOpts.push({ id: "extra-cheese", name: "Qo'shimcha pishloq", price: 7000 });
    if (hasPatty) customOpts.push({ id: "extra-patty", name: "Qo'shimcha kotlet", price: 18000 });
    if (hasJalapeno) customOpts.push({ id: "jalapenos", name: "Achchiq Jalapeno", price: 4000 });

    const newProduct = {
      id: "prod-" + Date.now(),
      name: name.trim(),
      category: category,
      price: priceNum,
      rating: 5.0,
      reviews: 1,
      image: finalImg,
      description: desc.trim(),
      ingredients: ["Yangi ingredientlar"],
      customization: customOpts
    };

    onAddProduct(newProduct);
    tgBridge.triggerHaptic('success');

    // Reset Form
    setName('');
    setPrice('');
    setDesc('');
    setImgUrl('');
    setHasCheese(true);
    setHasPatty(true);
    setHasJalapeno(false);
    alert("Yangi mahsulot muvaffaqiyatli qo'shildi! 🍔");
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (oldPass !== currentPassword) {
      tgBridge.triggerHaptic('error');
      setPassError('Eski parol noto\'g\'ri!');
      return;
    }

    if (newPass.length < 4) {
      tgBridge.triggerHaptic('error');
      setPassError('Yangi parol kamida 4 ta belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (newPass !== confirmPass) {
      tgBridge.triggerHaptic('error');
      setPassError('Yangi parollar bir-biriga mos kelmadi!');
      return;
    }

    onPasswordChange(newPass);
    tgBridge.triggerHaptic('success');
    setPassSuccess('Parol muvaffaqiyatli o\'zgartirildi! 👍');
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="admin-panel">
      
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'white' }}>🤠 Admin Panel</h2>
        <button 
          onClick={() => {
            tgBridge.triggerHaptic('warning');
            onLogout();
          }}
          className="admin-lock-btn"
          style={{ background: 'rgba(231, 29, 54, 0.1)', color: 'var(--secondary)', border: '1px solid rgba(231, 29, 54, 0.2)' }}
          title="Chiqish"
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* QUICK STATS */}
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Jami Mahsulotlar</div>
          <div className="admin-stat-value">{products.length} ta</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-label">Kategoriyalar</div>
          <div className="admin-stat-value">3 ta</div>
        </div>
      </div>

      {/* ADD PRODUCT FORM */}
      <div className="admin-section-card">
        <h3><PlusCircle size={18} /> Yangi Mahsulot Qo'shish</h3>
        <form onSubmit={handleAddSubmit}>
          <div className="form-group">
            <label>Nomi *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Masalan: Texas BBQ Bacon Burger" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Kategoriya</label>
              <select 
                className="form-input" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ background: 'var(--bg-card-solid)' }}
              >
                <option value="burgers">🍔 Burgerlar</option>
                <option value="sides">🍟 Gazaklar</option>
                <option value="drinks">🥤 Ichimliklar</option>
              </select>
            </div>
            <div className="form-group">
              <label>Narxi (so'm) *</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="65000" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mahsulot Rasmi *</label>
            <div 
              onClick={() => document.getElementById('file-upload').click()}
              style={{
                border: '2px dashed var(--border-glass)',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--bg-card-solid)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'var(--transition-fast)'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
            >
              <input 
                type="file" 
                id="file-upload" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageUpload} 
              />
              {imgUrl ? (
                <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={imgUrl} alt="Yuklangan rasm" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                    O'zgartirish 📷
                  </div>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '24px' }}>📷</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Rasm tanlash uchun bosing (PNG, JPG)</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.7 }}>Maksimal o'lcham: 2MB</span>
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Tavsifi (Ta'rifi) *</label>
            <textarea 
              className="form-input" 
              placeholder="Mahsulot haqida ma'lumot, go'shti, pishloqlari, souslari..." 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          {/* Preset Customization Toggles */}
          <div className="form-group">
            <label>Qo'shimchalar (Sozlash variantlari)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasCheese} 
                  onChange={(e) => setHasCheese(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Qo'shimcha Cheddar Pishloq (+7,000 UZS)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasPatty} 
                  onChange={(e) => setHasPatty(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Qo'shimcha Mol Go'shti Kotleti (+18,000 UZS)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'none', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={hasJalapeno} 
                  onChange={(e) => setHasJalapeno(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Achchiq Jalapeno Qalampiri (+4,000 UZS)
              </label>
            </div>
          </div>

          <button type="submit" className="btn-admin" style={{ marginTop: '12px' }}>
            Qo'shish 🍔
          </button>
        </form>
      </div>

      {/* PRODUCTS MANAGING LIST */}
      <div className="admin-section-card">
        <h3><Database size={18} /> Bor Mahsulotlar ({products.length} ta)</h3>
        <div className="product-manage-list">
          {products.map(prod => (
            <div key={prod.id} className="product-manage-item">
              <div className="product-manage-info">
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="product-manage-img" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80'; }}
                />
                <div>
                  <div className="product-manage-name">{prod.name}</div>
                  <div className="product-manage-price">{prod.price.toLocaleString('uz-UZ')} so'm</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (confirm(`Rostdan ham "${prod.name}" mahsulotini o'chirmoqchimisiz?`)) {
                    tgBridge.triggerHaptic('warning');
                    onDeleteProduct(prod.id);
                  }
                }}
                className="delete-btn"
                title="O'chirish"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* PASSWORD SECURITY MANAGEMENT */}
      <div className="admin-section-card" style={{ marginBottom: '20px' }}>
        <h3><Key size={18} /> Admin Parolini O'zgartirish</h3>
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Eski Parol *</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Eski parolni kiriting" 
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Yangi Parol *</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Kamida 4 ta belgi" 
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Yangi Parolni Tasdiqlang *</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Yangi parolni qayta kiriting" 
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
              required
            />
          </div>

          {passError && (
            <p style={{ color: 'var(--secondary)', fontSize: '13px', margin: '4px 0 12px 0', fontWeight: 600 }}>
              ⚠️ {passError}
            </p>
          )}

          {passSuccess && (
            <p style={{ color: '#2ec4b6', fontSize: '13px', margin: '4px 0 12px 0', fontWeight: 600 }}>
              {passSuccess}
            </p>
          )}

          <button type="submit" className="btn-admin">
            Saqlash
          </button>
        </form>
      </div>

    </div>
  );
}
