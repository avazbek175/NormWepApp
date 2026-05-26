import React, { useState, useEffect } from 'react';
import { ShoppingCart, Compass, HelpCircle, Lock, ShieldAlert, Award, ChevronRight, Check, Sun, Moon } from 'lucide-react';
import { DEFAULT_MENU_ITEMS, CATEGORIES } from './data';
import tgBridge from './telegram-helper';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import './App.css';

export default function App() {
  // --- DATABASE & STATE ---
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('texas_menu_items');
    return saved ? JSON.parse(saved) : DEFAULT_MENU_ITEMS;
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem('texas_admin_password') || 'admin';
  });

  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('menu'); // 'menu', 'cart', 'info', 'admin-login', 'admin-panel'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // --- THEME & LOADING STATES ---
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('texas_theme') || 'dark';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync theme class to document body
  useEffect(() => {
    localStorage.setItem('texas_theme', theme);
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.remove('light-theme');
    }
  }, [theme]);

  // Splash screen loader timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 seconds loading page
    return () => clearTimeout(timer);
  }, []);

  // --- MODAL STATES ---
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty, setModalQty] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState(new Set());
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  // --- CHECKOUT FORM STATE ---
  const [deliveryMode, setDeliveryMode] = useState('delivery'); // 'delivery', 'takeaway'
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('+998 ');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutComment, setCheckoutComment] = useState('');
  
  // Delivery Fee Preset
  const deliveryFee = 12000;

  // --- PERSIST MENU AND PASSWORD CHANGES ---
  useEffect(() => {
    localStorage.setItem('texas_menu_items', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('texas_admin_password', adminPassword);
  }, [adminPassword]);

  // Autofill Telegram User Info on load
  useEffect(() => {
    const tgUser = tgBridge.getUserInfo();
    if (tgUser) {
      if (tgUser.first_name) {
        setCheckoutName(tgUser.first_name);
      }
    }
  }, []);

  // --- TELEGRAM SDK INTEGRATION EFFECT ---
  // Governing MainButton and BackButton state reactively based on app states
  useEffect(() => {
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    // 1. If product details modal is open
    if (selectedProduct) {
      const extrasList = Array.from(selectedExtras).map(id => 
        selectedProduct.customization.find(opt => opt.id === id)
      );
      const extrasTotal = extrasList.reduce((sum, o) => sum + (o ? o.price : 0), 0);
      const unitPrice = selectedProduct.price + extrasTotal;
      const finalSum = unitPrice * modalQty;

      tgBridge.showMainButton(
        `Qo'shish: ${finalSum.toLocaleString('uz-UZ')} so'm`,
        () => handleAddProductFromModal()
      );
      tgBridge.showBackButton(() => setSelectedProduct(null));
      return;
    }

    // 2. If Checkout Modal is open
    if (isCheckoutOpen) {
      tgBridge.showMainButton(
        `Tasdiqlash (Olovli Buyurtma)`,
        () => handlePlaceOrder()
      );
      tgBridge.showBackButton(() => setIsCheckoutOpen(false));
      return;
    }

    // 3. Main Views Navigation
    if (activeView === 'menu') {
      if (cartCount > 0) {
        const subtotal = cart.reduce((sum, item) => {
          const itemPrice = item.price + item.extras.reduce((se, e) => se + e.price, 0);
          return sum + (itemPrice * item.quantity);
        }, 0);
        
        tgBridge.showMainButton(
          `Savatchani ko'rish (${cartCount}) - ${subtotal.toLocaleString('uz-UZ')} so'm`, 
          () => setActiveView('cart')
        );
      } else {
        tgBridge.hideMainButton();
      }
      tgBridge.hideBackButton();
    } else if (activeView === 'cart') {
      if (cartCount > 0) {
        tgBridge.showMainButton(
          `Rasmiylashtirish (Buyurtma)`, 
          () => setIsCheckoutOpen(true)
        );
      } else {
        tgBridge.hideMainButton();
      }
      tgBridge.showBackButton(() => setActiveView('menu'));
    } else if (activeView === 'admin-login') {
      tgBridge.hideMainButton();
      tgBridge.showBackButton(() => setActiveView('menu'));
    } else if (activeView === 'admin-panel') {
      tgBridge.hideMainButton();
      tgBridge.showBackButton(() => {
        setIsAdminLoggedIn(false);
        setActiveView('menu');
      });
    } else {
      tgBridge.hideMainButton();
      tgBridge.hideBackButton();
    }

    // Clean up to ensure standard state when unmounting / changing views
    return () => {
      tgBridge.hideMainButton();
      tgBridge.hideBackButton();
    };
  }, [activeView, cart, selectedProduct, selectedExtras, modalQty, isCheckoutOpen]);

  // --- ADD TO CART ACTION ---
  const handleAddToCart = (product, extras = [], quantity = 1) => {
    tgBridge.triggerHaptic('success');
    
    setCart(prev => {
      const idx = prev.findIndex(item => {
        if (item.id !== product.id) return false;
        if (item.extras.length !== extras.length) return false;
        const extraIds = new Set(item.extras.map(e => e.id));
        return extras.every(e => extraIds.has(e.id));
      });

      if (idx > -1) {
        const newCart = [...prev];
        newCart[idx].quantity += quantity;
        return newCart;
      } else {
        return [...prev, {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          extras: [...extras],
          quantity: quantity
        }];
      }
    });
  };

  const handleAddProductFromModal = () => {
    if (!selectedProduct) return;
    const extras = Array.from(selectedExtras).map(id => 
      selectedProduct.customization.find(opt => opt.id === id)
    );
    handleAddToCart(selectedProduct, extras, modalQty);
    setSelectedProduct(null);
  };

  const updateCartQty = (idx, change) => {
    setCart(prev => {
      const item = prev[idx];
      if (!item) return prev;
      const newQty = item.quantity + change;
      
      if (newQty <= 0) {
        tgBridge.triggerHaptic('warning');
        return prev.filter((_, i) => i !== idx);
      } else {
        tgBridge.triggerHaptic('light');
        const newCart = [...prev];
        newCart[idx].quantity = newQty;
        return newCart;
      }
    });
  };

  // --- DYNAMIC CALCULATIONS ---
  const cartSubtotal = cart.reduce((sum, item) => {
    const itemPrice = item.price + item.extras.reduce((se, e) => se + e.price, 0);
    return sum + (itemPrice * item.quantity);
  }, 0);

  const cartDelivery = deliveryMode === 'delivery' ? deliveryFee : 0;
  const cartGrandTotal = cartSubtotal + cartDelivery;

  // --- FORM SUBMIT CHECKOUT ---
  const handlePlaceOrder = () => {
    const name = checkoutName.trim();
    const phone = checkoutPhone.trim();
    const address = checkoutAddress.trim();

    if (!name) {
      alert("Iltimos, ismingizni kiriting!");
      tgBridge.triggerHaptic('error');
      return;
    }

    if (phone.length < 9) {
      alert("Iltimos, telefon raqamingizni kiriting!");
      tgBridge.triggerHaptic('error');
      return;
    }

    if (deliveryMode === 'delivery' && !address) {
      alert("Iltimos, yetkazib berish manzilini kiriting!");
      tgBridge.triggerHaptic('error');
      return;
    }

    // Compile Payload
    const payload = {
      orderId: "TX-" + Math.floor(1000 + Math.random() * 9000),
      customer: { name, phone, address, comment: checkoutComment },
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        extras: item.extras.map(e => e.name),
        price: item.price + item.extras.reduce((sum, e) => sum + e.price, 0)
      })),
      deliveryType: deliveryMode,
      financials: {
        subtotal: cartSubtotal,
        deliveryCost: cartDelivery,
        total: cartGrandTotal
      }
    };

    setIsCheckoutOpen(false);
    setCart([]);
    setActiveOrder(payload);
    tgBridge.triggerHaptic('success');
  };

  // --- CUSTOM OPTION TOGGLE IN MODAL ---
  const toggleExtra = (optId) => {
    tgBridge.triggerHaptic('light');
    setSelectedExtras(prev => {
      const next = new Set(prev);
      if (next.has(optId)) {
        next.delete(optId);
      } else {
        next.add(optId);
      }
      return next;
    });
  };

  // --- ADMIN CAPABILITIES CALLBACKS ---
  const handleAddProduct = (newProd) => {
    setProducts(prev => [newProd, ...prev]);
  };

  const handleDeleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handlePasswordChange = (newPass) => {
    setAdminPassword(newPass);
  };

  if (isLoading) {
    return (
      <div className="splash-screen">
        <div className="splash-content">
          <div className="splash-logo">
            <img src="/logo.png" alt="Texas Burger Logo" className="splash-logo-img" />
          </div>
          <h1 className="splash-title">TEXAS BURGER</h1>
          <p className="splash-subtitle">Yovvoyi G'arb Ta'mi</p>
          
          <div className="splash-loader-container">
            <div className="splash-loader-bar"></div>
          </div>
          
          <p className="splash-status-text">Qozon qizimoqda... 🤠</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {/* 1. APP HEADER */}
      <header>
        <div className="brand-section" onClick={() => { tgBridge.triggerHaptic('light'); setActiveView('menu'); }}>
          <div className="brand-logo">
            <img src="/logo.png" alt="Texas Burger Logo" className="brand-logo-img" />
          </div>
          <div className="brand-info">
            <h1>TEXAS BURGER</h1>
            <p>Mazzali taomlar</p>
          </div>
        </div>
        
        <div className="header-right">
          {/* Dark/Light Mode Toggle */}
          <button 
            className="admin-lock-btn"
            onClick={() => {
              tgBridge.triggerHaptic('light');
              setTheme(prev => prev === 'dark' ? 'light' : 'dark');
            }}
            title={theme === 'dark' ? "Kunduzgi rejim" : "Tungi rejim"}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Admin Lock Button */}
          <button 
            className={`admin-lock-btn ${(activeView === 'admin-login' || activeView === 'admin-panel') ? 'active' : ''}`}
            onClick={() => {
              tgBridge.triggerHaptic('medium');
              if (isAdminLoggedIn) {
                setActiveView('admin-panel');
              } else {
                setActiveView('admin-login');
              }
            }}
          >
            <Lock size={16} />
          </button>
          
          <div className="user-badge">
           SizovDevs <span>{tgBridge.getUserInfo().first_name || 'Created by'}</span>
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC ROUTING PANEL */}

      {/* --- MENU ROUTE --- */}
      {activeView === 'menu' && (
        <>
          {/* Promo banner */}
          <section className="promo-banner">
            <div className="promo-text">
              <h2>Mini App yasash Arzon va sifatli!</h2>
              <p>Ilk buyurtma uchun chegirma hoziroq bog'laning! <br />
              <a href="tel:++998942014300" className='phone-links'>+998 94 201 43 00</a>
               

              </p>
            </div>
            <div className="promo-badge">-15%</div>
          </section>

          {/* Categories Pill Nav */}
          <section className="categories-container">
            {CATEGORIES.map(cat => (
              <div 
                key={cat.id} 
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => { tgBridge.triggerHaptic('light'); setActiveCategory(cat.id); }}
              >
                {cat.icon} {cat.name}
              </div>
            ))}
          </section>

          {/* Menu Food Grid */}
          <section className="menu-section">
            <div className="products-grid">
              {products
                .filter(item => activeCategory === 'all' || item.category === activeCategory)
                .map(item => (
                  <div 
                    key={item.id} 
                    className="product-card"
                    onClick={() => {
                      setSelectedProduct(item);
                      setModalQty(1);
                      setSelectedExtras(new Set());
                      tgBridge.triggerHaptic('medium');
                    }}
                  >
                    <div className="product-image-wrapper">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="product-image"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'; }}
                      />
                      <div className="rating-tag">⭐ {item.rating} ({item.reviews})</div>
                    </div>
                    
                    <div className="product-info">
                      <div className="product-name">{item.name}</div>
                      <div className="product-price">{item.price.toLocaleString('uz-UZ')} so'm</div>
                    </div>
                    
                    <div 
                      className="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item, [], 1);
                      }}
                    >
                      Savatga
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}

      {/* --- CART ROUTE --- */}
      {activeView === 'cart' && (
        <section className="cart-view">
          {cart.length === 0 ? (
            <div className="empty-cart-state">
              <div className="empty-cart-icon">🤠</div>
              <h3>Sizning savatchangiz bo'sh</h3>
              <p>Bizning maxsus Texas burgerlarimizdan tatib ko'ring!</p>
            </div>
          ) : (
            <>
              {cart.map((item, idx) => {
                const extrasText = item.extras.length > 0
                  ? item.extras.map(e => `+${e.name}`).join(', ')
                  : 'Qo\'shimchalarsiz';

                const itemTotal = (item.price + item.extras.reduce((sum, e) => sum + e.price, 0)) * item.quantity;

                return (
                  <div key={idx} className="cart-item">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="cart-item-img" 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'; }}
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-extras">{extrasText}</p>
                      <div className="cart-item-price">{itemTotal.toLocaleString('uz-UZ')} so'm</div>
                    </div>
                    <div className="cart-item-ctrl">
                      <button className="cart-item-ctrl-btn" onClick={() => updateCartQty(idx, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button className="cart-item-ctrl-btn" onClick={() => updateCartQty(idx, 1)}>+</button>
                    </div>
                  </div>
                );
              })}

              <div className="bill-details">
                <div className="bill-row">
                  <span>Subtotal</span>
                  <span>{cartSubtotal.toLocaleString('uz-UZ')} so'm</span>
                </div>
                <div className="bill-row">
                  <span>Yetkazib berish ({deliveryMode === 'delivery' ? '3 km gacha' : 'Olib ketish'})</span>
                  <span>{deliveryMode === 'delivery' ? `${deliveryFee.toLocaleString('uz-UZ')} so'm` : 'Bepul'}</span>
                </div>
                <div className="bill-row total">
                  <span>Jami summa</span>
                  <span>{cartGrandTotal.toLocaleString('uz-UZ')} so'm</span>
                </div>
              </div>
            </>
          )}
        </section>
      )}



      {/* --- ADMIN LOGIN ROUTE --- */}
      {activeView === 'admin-login' && (
        <AdminLogin 
          currentPassword={adminPassword}
          onLoginSuccess={() => {
            setIsAdminLoggedIn(true);
            setActiveView('admin-panel');
          }}
          onBackToMenu={() => setActiveView('menu')}
        />
      )}

      {/* --- ADMIN PANEL ROUTE --- */}
      {activeView === 'admin-panel' && (
        <AdminPanel 
          products={products}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onPasswordChange={handlePasswordChange}
          currentPassword={adminPassword}
          onLogout={() => {
            setIsAdminLoggedIn(false);
            setActiveView('menu');
          }}
        />
      )}

      {/* 3. NAVIGATION BOTTOM BAR (Visible only in standard customer views) */}
      {(activeView === 'menu' || activeView === 'cart') && (
        <nav className="bottom-nav">
          <div className={`nav-item ${activeView === 'menu' ? 'active' : ''}`} onClick={() => switchViewNative('menu')}>
            <span className="nav-icon">🍔</span>
            <span>Menyu</span>
          </div>
          <div className={`nav-item ${activeView === 'cart' ? 'active' : ''}`} onClick={() => switchViewNative('cart')}>
            <span className="nav-icon" style={{ position: 'relative' }}>
              🛒
              {cart.length > 0 && (
                <span className="cart-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
              )}
            </span>
            <span>Savatcha</span>
          </div>
        </nav>
      )}

      {/* 4. NON-TELEGRAM BROWSER MAIN ACTION BUTTONS */}
      {!tgBridge.isTelegram && (
        <div className="web-controls-container">
          {/* Main Button Fallback */}
          {selectedProduct && (
            <button 
              className="web-button primary" 
              onClick={handleAddProductFromModal}
            >
              Qo'shish: {((selectedProduct.price + Array.from(selectedExtras).reduce((s, id) => s + (selectedProduct.customization.find(o => o.id === id)?.price || 0), 0)) * modalQty).toLocaleString('uz-UZ')} so'm
            </button>
          )}

          {!selectedProduct && isCheckoutOpen && (
            <button className="web-button primary" onClick={handlePlaceOrder}>
              Tasdiqlash (Olovli Buyurtma)
            </button>
          )}

          {!selectedProduct && !isCheckoutOpen && activeView === 'menu' && cart.length > 0 && (
            <button className="web-button primary" onClick={() => switchViewNative('cart')}>
              Savatchani ko'rish ({cart.reduce((s, i) => s + i.quantity, 0)}) - {cartSubtotal.toLocaleString('uz-UZ')} so'm
            </button>
          )}

          {!selectedProduct && !isCheckoutOpen && activeView === 'cart' && cart.length > 0 && (
            <button className="web-button primary" onClick={() => setIsCheckoutOpen(true)}>
              Rasmiylashtirish (Buyurtma)
            </button>
          )}
        </div>
      )}

      {/* 5. PRODUCT DETAILS MODAL OVERLAY */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle"></div>
            
            <div className="modal-header">
              <div className="modal-title">
                <h2>{selectedProduct.name}</h2>
                <p>{selectedProduct.category === 'burgers' ? '🍔 Burgerlar' : '🍟 Gazaklar'}</p>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedProduct(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="modal-img-wrapper">
                <img 
                  src={selectedProduct.image} 
                  alt={selectedProduct.name} 
                  className="modal-img" 
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'; }}
                />
              </div>
              
              <p className="modal-description">{selectedProduct.description}</p>

              {/* Customizer */}
              {selectedProduct.customization && selectedProduct.customization.length > 0 && (
                <div className="customization-section">
                  <h3 className="section-title">🤠 Ta'mni Sozlash</h3>
                  <div>
                    {selectedProduct.customization.map(opt => (
                      <div 
                        key={opt.id} 
                        className={`custom-option ${selectedExtras.has(opt.id) ? 'selected' : ''}`}
                        onClick={() => toggleExtra(opt.id)}
                      >
                        <div className="custom-option-info">
                          <div className="custom-checkbox">
                            {selectedExtras.has(opt.id) && <span className="custom-checkbox-checked">✓</span>}
                          </div>
                          <span className="custom-option-name">{opt.name}</span>
                        </div>
                        <span className="custom-option-price">+{opt.price.toLocaleString('uz-UZ')} so'm</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="quantity-controller">
                <button 
                  className="quantity-btn" 
                  onClick={() => {
                    if (modalQty > 1) {
                      tgBridge.triggerHaptic('light');
                      setModalQty(modalQty - 1);
                    }
                  }}
                >
                  -
                </button>
                <span className="quantity-display">{modalQty}</span>
                <button 
                  className="quantity-btn" 
                  onClick={() => {
                    tgBridge.triggerHaptic('light');
                    setModalQty(modalQty + 1);
                  }}
                >
                  +
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. CHECKOUT MODAL OVERLAY */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle"></div>
            
            <div className="modal-header">
              <div className="modal-title">
                <h2>Yetkazib Berish</h2>
                <p>Buyurtmani rasmiylashtirish</p>
              </div>
              <button className="close-modal-btn" onClick={() => setIsCheckoutOpen(false)}>×</button>
            </div>

            <div className="modal-body">
              <form onSubmit={(e) => e.preventDefault()}>
                
                {/* Olish turi */}
                <div className="form-group">
                  <label>Olish Turi</label>
                  <div className="delivery-options-grid">
                    <div 
                      className={`delivery-option-btn ${deliveryMode === 'delivery' ? 'active' : ''}`}
                      onClick={() => { tgBridge.triggerHaptic('light'); setDeliveryMode('delivery'); }}
                    >
                      🚀 Yetkazish
                    </div>
                    <div 
                      className={`delivery-option-btn ${deliveryMode === 'takeaway' ? 'active' : ''}`}
                      onClick={() => { tgBridge.triggerHaptic('light'); setDeliveryMode('takeaway'); }}
                    >
                      🛍️ Olib ketish
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="form-group">
                  <label>Ismingiz</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Masalan: Dilshod" 
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Telefon Raqam</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    placeholder="+998 90 123 45 67" 
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Address */}
                {deliveryMode === 'delivery' && (
                  <div className="form-group">
                    <label>Yetkazish Manzili</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ko'cha, xonadon, mo'ljal" 
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Comment */}
                <div className="form-group">
                  <label>Buyurtmaga Izoh (Ixtiyoriy)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Piyozsiz bo'lsin, pishloq ko'proq bo'lsin" 
                    value={checkoutComment}
                    onChange={(e) => setCheckoutComment(e.target.value)}
                  />
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* 7. ORDER SUCCESS SCREEN WITH ANIMATED TIMELINE */}
      {activeOrder && (
        <OrderSuccessScreen 
          order={activeOrder} 
          onClose={() => {
            tgBridge.triggerHaptic('light');
            setActiveOrder(null);
            setActiveView('menu');
          }} 
        />
      )}

    </div>
  );

  // Switch view with standard feedback
  function switchViewNative(v) {
    tgBridge.triggerHaptic('light');
    setActiveView(v);
  }
}

// Order Status Tracker timeline subprocess
function OrderSuccessScreen({ order, onClose }) {
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Simulate real delivery workflow notifications
    const t1 = setTimeout(() => {
      setStep(2);
      tgBridge.triggerHaptic('medium');
    }, 4500);

    const t2 = setTimeout(() => {
      setStep(3);
      tgBridge.triggerHaptic('success');
    }, 9000);

    const t3 = setTimeout(() => {
      // In true environment, finalize data back to TG
      tgBridge.sendOrderAndClose(order);
    }, 14000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [order]);

  return (
    <div className="success-screen">
      <div className="success-icon-wrapper">
        <span className="success-icon">🤠</span>
      </div>
      
      <h2>Buyurtma Qabul Qilindi!</h2>
      <p>
        Buyurtma <b>{order.orderId}</b> muvaffaqiyatli qabul qilindi! Umumiya summa: <b>{order.financials.total.toLocaleString('uz-UZ')} so'm</b>.<br />
        Tez orada aloqaga chiqamiz.
      </p>

      {/* Tracker bar */}
      <div className="order-tracker">
        <div className={`tracker-step ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}`}>
          <div className="tracker-circle">{step > 1 ? '✓' : '1'}</div>
          <div className="tracker-step-info">
            <h4>Qabul qilindi</h4>
            <p>Buyurtma tizimga kirdi</p>
          </div>
        </div>
        <div className={`tracker-step ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}`}>
          <div className="tracker-circle">{step > 2 ? '✓' : '2'}</div>
          <div className="tracker-step-info">
            <h4>Pishirilmoqda</h4>
            <p>Oshpazlarimiz ishga kirishdi</p>
          </div>
        </div>
        <div className={`tracker-step ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}`}>
          <div className="tracker-circle">3</div>
          <div className="tracker-step-info">
            <h4>Yo'lda</h4>
            <p>Kuryerimiz tezlikni oshirdi</p>
          </div>
        </div>
      </div>

      <button className="success-close-btn" onClick={onClose}>
        Menyoga qaytish
      </button>
    </div>
  );
}
