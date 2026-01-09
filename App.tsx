
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Truck, 
  User, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  MapPin, 
  Utensils, 
  Package,
  CheckCircle,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Clock,
  Navigation,
  CreditCard,
  Store,
  Wallet,
  LogOut,
  Zap,
  Star,
  ShieldCheck,
  TrendingUp,
  Map,
  Filter,
  SlidersHorizontal,
  Instagram,
  Twitter,
  Facebook,
  Smartphone,
  Shield,
  Heart
} from 'lucide-react';
import { RESTAURANTS, PRODUCTS, ILESHA_NEIGHBORHOODS } from './constants';
import { Restaurant, Product, CartItem, Order, UserRole, DeliveryRequest, UserProfile } from './types';
import { getFoodRecommendations, estimateLogisticsPrice } from './services/geminiService';

const Router = HashRouter;

const STORAGE_KEYS = {
  ROLE: 'ziplv_role',
  USER: 'ziplv_user',
  CART: 'ziplv_cart',
  ORDERS: 'ziplv_orders',
  DELIVERIES: 'ziplv_deliveries',
  PRODUCTS: 'ziplv_products',
  VENDORS: 'ziplv_vendors'
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persistence
  const [role, setRole] = useState<UserRole>(() => (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'CUSTOMER');
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    return saved ? JSON.parse(saved) : [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return saved ? JSON.parse(saved) : [];
  });
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
    return saved ? JSON.parse(saved) : [];
  });
  const [vendorProducts, setVendorProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : PRODUCTS;
  });
  const [vendors, setVendors] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VENDORS);
    return saved ? JSON.parse(saved) : RESTAURANTS;
  });

  useEffect(() => localStorage.setItem(STORAGE_KEYS.ROLE, role), [role]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)), [cart]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries)), [deliveries]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(vendorProducts)), [vendorProducts]);
  useEffect(() => localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors)), [vendors]);

  const handleOnboard = (profile: UserProfile) => {
    setUser(profile);
    setRole(profile.role);
    if (profile.role === 'RESTAURANT') {
      const newVendor: Restaurant = {
        id: `v-${profile.id}`,
        name: profile.name,
        location: profile.location || 'Central',
        rating: 5.0,
        deliveryTime: '20-35 min',
        deliveryFee: 500,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
        category: 'Newly Registered',
        ownerId: profile.id
      };
      setVendors([...vendors, newVendor]);
    }
    navigate('/dashboard');
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowCart(true);
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  const updateQuantity = (id: string, d: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i));
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);

  const placeOrder = () => {
    if (cart.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        items: [...cart],
        total: cartTotal + 500,
        status: 'PENDING',
        customerId: user?.id || 'guest',
        restaurantId: cart[0].restaurantId,
        timestamp: Date.now(),
        paymentStatus: 'PAID'
      };
      setOrders([newOrder, ...orders]);
      setCart([]);
      setLoading(false);
      setShowCart(false);
      navigate('/orders');
    }, 1500);
  };

  const addProduct = (p: Partial<Product>) => {
    const newP: Product = {
      id: `p-${Date.now()}`,
      name: p.name || 'New Item',
      price: p.price || 0,
      description: p.description || '',
      image: p.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600',
      category: p.category || 'General',
      restaurantId: `v-${user?.id}`
    };
    setVendorProducts([newP, ...vendorProducts]);
  };

  const requestDelivery = (from: string, to: string, item: string, price: number) => {
    const newRequest: DeliveryRequest = {
      id: `del-${Date.now()}`,
      pickupLocation: from,
      dropoffLocation: to,
      itemDescription: item,
      status: 'PENDING',
      customerId: user?.id || 'guest',
      price,
      timestamp: Date.now()
    };
    setDeliveries([newRequest, ...deliveries]);
    navigate('/logistics-status');
  };

  const updateOrderStatus = (id: string, status: Order['status']) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  const updateDeliveryStatus = (id: string, status: DeliveryRequest['status']) => setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status, driverId: status === 'ACCEPTED' ? user?.id : d.driverId } : d));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-[80] glass border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-50 rounded-2xl lg:hidden text-slate-800">
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-3xl font-extrabold flex items-center gap-2 tracking-tight group">
            <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">ZipVyne</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-10 text-[15px] font-bold text-slate-500">
          <Link to="/" className="hover:text-orange-600 transition-colors">Market</Link>
          <Link to="/logistics" className="hover:text-orange-600 transition-colors">Logistics</Link>
          <Link to="/orders" className="hover:text-orange-600 transition-colors">Track</Link>
          {user && (
            <Link to="/dashboard" className="flex items-center gap-2 text-white bg-slate-900 px-5 py-2.5 rounded-2xl hover:bg-orange-600 transition-all shadow-md">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <button onClick={() => navigate('/onboard')} className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-orange-100">
              Join Local Hub
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl pr-4 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{role}</p>
                <p className="text-sm font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
              </div>
            </div>
          )}
          
          <button onClick={() => setShowCart(true)} className="relative p-3 bg-white border border-slate-100 rounded-2xl text-slate-800 hover:text-orange-600 hover:border-orange-100 transition-all shadow-sm">
            <ShoppingBag className="w-6 h-6" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Routes>
          <Route path="/" element={<HomeView addToCart={addToCart} vendors={vendors} />} />
          <Route path="/explore" element={<ExploreView addToCart={addToCart} products={vendorProducts} />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail addToCart={addToCart} vendors={vendors} products={vendorProducts} />} />
          <Route path="/logistics" element={<LogisticsRequest requestDelivery={requestDelivery} />} />
          <Route path="/orders" element={<OrdersView orders={orders} role={role} setOrders={updateOrderStatus} user={user} />} />
          <Route path="/logistics-status" element={<LogisticsStatus deliveries={deliveries} role={role} updateStatus={updateDeliveryStatus} user={user} />} />
          <Route path="/dashboard" element={<Dashboard role={role} user={user} products={vendorProducts} addProduct={addProduct} orders={orders} deliveries={deliveries} updateOrderStatus={updateOrderStatus} updateDeliveryStatus={updateDeliveryStatus} logout={() => { setUser(null); setRole('CUSTOMER'); navigate('/'); }} />} />
          <Route path="/onboard" element={<OnboardingView onComplete={handleOnboard} />} />
        </Routes>
      </main>

      <Footer />

      {showCart && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-8 animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">Your Tray</h2>
              <button onClick={() => setShowCart(false)} className="p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-32 h-32 bg-slate-50 rounded-[40px] flex items-center justify-center mb-8"><ShoppingBag className="w-16 h-16 text-slate-200" /></div>
                <p className="text-xl font-bold text-slate-800 mb-2">Tray is empty</p>
                <button onClick={() => {setShowCart(false); navigate('/explore');}} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black hover:bg-orange-600 transition-all mt-10">Start Shopping</button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-6 p-5 rounded-[32px] bg-slate-50 border border-slate-100 group">
                    <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                      <p className="text-orange-600 font-black mb-3">₦{item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-4 bg-white w-fit p-1 rounded-xl border">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-50 rounded"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-50 rounded"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="mt-8 pt-8 border-t-2 border-dashed border-slate-100 space-y-6">
                <div className="flex justify-between text-slate-500 font-bold"><span>Total to Pay</span><span className="text-3xl text-slate-900 font-black">₦{(cartTotal + 500).toLocaleString()}</span></div>
                <button onClick={placeOrder} disabled={loading} className="w-full bg-orange-600 text-white py-6 rounded-[28px] font-black text-xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-orange-100">
                  {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Secure Checkout <CreditCard /></>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed inset-0 z-[120] flex animate-in fade-in duration-300">
          <div className="bg-white w-80 h-full shadow-2xl flex flex-col p-8 gap-10">
            <h2 className="text-4xl font-black text-orange-600 tracking-tighter">ZipVyne</h2>
            <nav className="flex flex-col gap-6">
              <Link onClick={() => setIsMenuOpen(false)} to="/" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl text-xl font-bold"><Utensils className="w-6 h-6 text-orange-500" /> Marketplace</Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/logistics" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl text-xl font-bold"><Truck className="w-6 h-6 text-blue-500" /> Town Logistics</Link>
              <Link onClick={() => setIsMenuOpen(false)} to="/orders" className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-3xl text-xl font-bold"><Package className="w-6 h-6 text-purple-500" /> Active Hub</Link>
            </nav>
            <div className="mt-auto">
              {!user ? <button onClick={() => {navigate('/onboard'); setIsMenuOpen(false);}} className="w-full bg-slate-900 text-white p-6 rounded-[32px] font-black text-lg">Sign Up</button> : <button onClick={() => { setUser(null); setRole('CUSTOMER'); navigate('/'); setIsMenuOpen(false); }} className="w-full bg-red-50 text-red-600 p-6 rounded-[32px] font-black text-lg">Log Out</button>}
            </div>
          </div>
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 pt-24 pb-12 mt-20 rounded-t-[60px] text-white">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <Link to="/" className="text-3xl font-extrabold flex items-center gap-3 tracking-tighter">
              <div className="bg-orange-600 p-2 rounded-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
              ZipVyne
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed">
              Empowering local commerce and logistics in Africa's high-growth towns. Speed, vibe, and community in one app.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-600 transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-600 transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-3 bg-white/5 rounded-2xl hover:bg-orange-600 transition-all"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div className="space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-slate-500">Marketplace</h4>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link to="/explore" className="hover:text-orange-600 transition-colors">Restaurants</Link></li>
              <li><Link to="/explore" className="hover:text-orange-600 transition-colors">Groceries</Link></li>
              <li><Link to="/explore" className="hover:text-orange-600 transition-colors">Pharmacy</Link></li>
              <li><Link to="/explore" className="hover:text-orange-600 transition-colors">Storefronts</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-slate-500">Partner</h4>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link to="/onboard" className="hover:text-orange-600 transition-colors">Become a Vendor</Link></li>
              <li><Link to="/onboard" className="hover:text-orange-600 transition-colors">Drive for ZipVyne</Link></li>
              <li><Link to="#" className="hover:text-orange-600 transition-colors">Logistics Hub</Link></li>
              <li><Link to="#" className="hover:text-orange-600 transition-colors">Business API</Link></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-lg font-black uppercase tracking-widest text-slate-500">Company</h4>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link to="#" className="hover:text-orange-600 transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-orange-600 transition-colors">Our Vision</Link></li>
              <li><Link to="#" className="hover:text-orange-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-orange-600 transition-colors">Support Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 font-bold">© 2025 ZipVyne Inc. Made with <Heart className="w-4 h-4 inline text-red-500 fill-red-500" /> for Nigeria.</p>
          <div className="flex gap-4">
             <div className="bg-white/5 px-6 py-2 rounded-2xl flex items-center gap-2 border border-white/5">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest">iOS App</span>
             </div>
             <div className="bg-white/5 px-6 py-2 rounded-2xl flex items-center gap-2 border border-white/5">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-black uppercase tracking-widest">Android App</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const HomeView: React.FC<{ addToCart: (p: Product) => void, vendors: Restaurant[] }> = ({ addToCart, vendors }) => {
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  
  // Filtering state
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [maxTime, setMaxTime] = useState<number>(60);

  const handleAsk = async () => {
    if (!search) return;
    setLoading(true);
    const recs = await getFoodRecommendations(search);
    setAiSuggestions(recs);
    setLoading(false);
  };

  const parseMaxTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+)\s*min/);
    if (!match) return 60;
    const ranges = timeStr.match(/(\d+)-(\d+)\s*min/);
    return ranges ? parseInt(ranges[2]) : parseInt(match[1]);
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const catMatch = selectedCategory === "All" || v.category === selectedCategory;
      const timeMatch = parseMaxTime(v.deliveryTime) <= maxTime;
      return catMatch && timeMatch;
    });
  }, [vendors, selectedCategory, maxTime]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(vendors.map(v => v.category)));
    return ["All", ...unique];
  }, [vendors]);

  return (
    <div className="space-y-32 pb-20">
      {/* Premium Hero */}
      <section className="relative min-h-[700px] flex items-center justify-center text-center p-8 rounded-[80px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=1400" className="w-full h-full object-cover brightness-[0.25]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-orange-600 text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-[0_10px_40px_rgba(234,88,12,0.3)]">
              <Zap className="w-5 h-5 animate-pulse" /> The New Pulse of Your Town
            </div>
            <h1 className="text-7xl md:text-[160px] font-black text-white tracking-tighter leading-[0.8]">
              Speed. <br /> <span className="text-orange-600 italic">Vibe.</span> <span className="opacity-40">Town.</span>
            </h1>
            <p className="text-xl md:text-4xl text-slate-300 max-w-4xl mx-auto font-medium opacity-80 leading-snug">
              ZipVyne is the local engine for commerce. From piping hot Amala to instant document delivery, we zip it across town.
            </p>
          </div>

          <div className="w-full max-w-3xl mx-auto glass rounded-[50px] p-4 border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center px-8 gap-6 py-6 md:py-0">
              <Search className="w-8 h-8 text-white/40" />
              <input 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Hungry? Ask AI: 'The best Jollof near me'..." 
                className="w-full bg-transparent outline-none font-bold text-2xl text-white placeholder:text-white/20"
              />
            </div>
            <button onClick={handleAsk} disabled={loading} className="bg-orange-600 text-white px-16 py-8 rounded-[40px] font-black text-2xl flex items-center justify-center gap-4 hover:bg-orange-500 transition-all active:scale-95 shadow-2xl shadow-orange-950/40">
              {loading ? <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles className="w-8 h-8" />} ZIP IT
            </button>
          </div>
        </div>
      </section>

      {aiSuggestions && (
        <section className="bg-slate-900 rounded-[60px] p-20 text-white shadow-[0_80px_160px_rgba(0,0,0,0.4)] relative overflow-hidden group border-4 border-orange-600/10">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-45 transition-transform duration-1000 scale-150"><Sparkles className="w-64 h-64" /></div>
           <div className="relative z-10 flex flex-col md:flex-row gap-16 items-center">
              <div className="bg-orange-600 p-10 rounded-[48px] shadow-[0_20px_60px_rgba(234,88,12,0.4)] animate-pulse"><Sparkles className="w-20 h-20 text-white" /></div>
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                   <h2 className="text-5xl font-black tracking-tighter">AI Curated Vibes</h2>
                   <div className="px-6 py-2 bg-white/10 rounded-full text-orange-400 font-black uppercase text-xs tracking-widest border border-white/10">Engine v2.5</div>
                </div>
                <div className="text-3xl md:text-4xl font-bold leading-relaxed text-slate-100 border-l-[12px] border-orange-600 pl-12 py-4 italic bg-white/5 rounded-r-[40px]">"{aiSuggestions}"</div>
              </div>
           </div>
        </section>
      )}

      {/* Why ZipVyne - Feature Grid */}
      <section className="space-y-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
           <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Town commerce, <br /> but <span className="text-orange-600">better.</span></h2>
           <p className="text-2xl text-slate-500 font-medium leading-relaxed">We didn't just build an app; we built an ecosystem for your neighborhood.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { 
              title: "Verified Vendors", 
              desc: "We manually vet every restaurant and shop to ensure you get top-quality vibes and flavor.", 
              icon: <ShieldCheck className="w-12 h-12 text-orange-600" />,
              img: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400"
            },
            { 
              title: "AI Logistics", 
              desc: "Our routing engine knows the town better than anyone, finding shortcuts to beat any bottleneck.", 
              icon: <Zap className="w-12 h-12 text-blue-600" />,
              img: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=400"
            },
            { 
              title: "Town Native", 
              desc: "Built specifically for high-growth areas, considering local mapping, power, and connectivity.", 
              icon: <Map className="w-12 h-12 text-green-600" />,
              img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400"
            },
          ].map((f, i) => (
            <div key={i} className="group bg-white rounded-[60px] border-4 border-slate-50 overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-4">
               <div className="h-48 overflow-hidden">
                  <img src={f.img} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
               </div>
               <div className="p-12 space-y-6">
                  <div className="bg-slate-50 w-24 h-24 rounded-[32px] flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{f.title}</h3>
                  <p className="text-slate-500 font-bold text-lg leading-relaxed">{f.desc}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section className="space-y-16">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="space-y-6">
            <h2 className="text-6xl font-black text-slate-900 tracking-tighter">Everything in one place</h2>
            <p className="text-slate-400 font-bold text-2xl">Filter by vibes, speed, and flavor.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-8 bg-white p-6 rounded-[50px] border-4 border-slate-50 shadow-2xl">
            <div className="flex items-center gap-6 px-10 border-r-4 border-slate-50">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Max Delivery</label>
                <select 
                  value={maxTime} 
                  onChange={(e) => setMaxTime(parseInt(e.target.value))}
                  className="bg-transparent outline-none font-black text-2xl text-slate-900 cursor-pointer"
                >
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>Any time</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6 px-10">
              <SlidersHorizontal className="w-8 h-8 text-orange-600" />
              <div className="flex flex-col">
                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Vibe Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent outline-none font-black text-2xl text-slate-900 cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-10 scrollbar-hide">
           {categories.map(cat => (
             <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-12 py-8 rounded-[48px] border-4 transition-all font-black text-xl ${
                  selectedCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.3)] scale-105' 
                  : 'bg-white text-slate-400 border-slate-50 hover:border-orange-200'
                }`}
             >
                {cat}
             </button>
           ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section>
        <div className="flex items-center justify-between mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            {selectedCategory === "All" ? "Town Favorites" : selectedCategory} <span className="text-orange-600 italic">Zip'd Now</span>
          </h2>
          <Link to="/explore" className="group bg-slate-900 text-white px-10 py-5 rounded-[32px] font-black text-lg flex items-center gap-4 hover:bg-orange-600 transition-all shadow-xl">
            See Market <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
        
        {filteredVendors.length === 0 ? (
          <div className="py-40 text-center bg-slate-50 rounded-[80px] border-8 border-dashed border-slate-100 space-y-10">
            <Filter className="w-32 h-32 text-slate-200 mx-auto" />
            <p className="text-4xl font-black text-slate-300 tracking-tight">No vendors match your filters.</p>
            <button 
              onClick={() => { setSelectedCategory("All"); setMaxTime(60); }}
              className="bg-slate-900 text-white px-10 py-4 rounded-3xl font-black text-xl shadow-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {filteredVendors.map(v => (
              <Link to={`/restaurant/${v.id}`} key={v.id} className="group bg-white rounded-[70px] border-4 border-slate-50 overflow-hidden hover:shadow-[0_60px_100px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-6">
                 <div className="relative h-80 overflow-hidden">
                   <img src={v.image} className="w-full h-full object-cover group-hover:scale-110 duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="absolute bottom-10 left-10 flex items-center gap-3 bg-white/95 px-8 py-4 rounded-[32px] font-black text-slate-900 shadow-2xl text-xl">
                      <Star className="w-6 h-6 text-orange-500 fill-orange-500" /> {v.rating}
                   </div>
                   <div className="absolute top-10 right-10">
                     <span className="bg-orange-600 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.3em] shadow-xl">
                        {v.category}
                     </span>
                   </div>
                 </div>
                 <div className="p-16 space-y-6">
                   <h3 className="text-4xl font-black text-slate-900 tracking-tighter group-hover:text-orange-600 transition-colors">{v.name}</h3>
                   <div className="flex items-center gap-4 text-slate-400 font-bold text-xl">
                      <MapPin className="w-6 h-6 text-orange-600" /> {v.location}
                   </div>
                   <div className="flex items-center justify-between pt-12 border-t-2 border-slate-50">
                      <div className="flex items-center gap-6 text-slate-700 font-black text-lg">
                        <Clock className="w-6 h-6 text-orange-500" /> {v.deliveryTime}
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[32px] text-slate-900 group-hover:bg-orange-600 group-hover:text-white transition-all transform group-hover:rotate-12 group-hover:scale-110"><ChevronRight className="w-8 h-8" /></div>
                   </div>
                 </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Onboarding Teaser Section */}
      <section className="bg-slate-900 rounded-[80px] p-24 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-20">
         <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px]"></div>
         <div className="relative z-10 space-y-12 max-w-2xl">
            <h2 className="text-7xl font-black tracking-tighter leading-none">Join the Vyne. <br /> Grow your town.</h2>
            <p className="text-3xl text-slate-400 font-medium leading-relaxed">Whether you have a kitchen, a shop, or a bike, ZipVyne is the engine that drives your business forward.</p>
            <div className="flex flex-wrap gap-8">
               <button onClick={() => navigate('/onboard')} className="bg-orange-600 text-white px-12 py-6 rounded-[40px] font-black text-2xl hover:bg-orange-500 transition-all shadow-2xl shadow-orange-950/40 flex items-center gap-4">
                  Partner with Us <ArrowRight className="w-8 h-8" />
               </button>
               <button onClick={() => navigate('/onboard')} className="bg-white/5 border border-white/10 text-white px-12 py-6 rounded-[40px] font-black text-2xl hover:bg-white/10 transition-all">
                  Rider Signup
               </button>
            </div>
         </div>
         <div className="relative z-10 grid grid-cols-2 gap-8">
            <div className="bg-white/5 p-10 rounded-[50px] border border-white/10 space-y-4">
               <Store className="w-12 h-12 text-orange-500" />
               <h4 className="text-2xl font-black">1.2k+ Vendors</h4>
            </div>
            <div className="bg-white/5 p-10 rounded-[50px] border border-white/10 space-y-4 mt-12">
               <Truck className="w-12 h-12 text-blue-500" />
               <h4 className="text-2xl font-black">500+ Riders</h4>
            </div>
         </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-orange-600 rounded-[80px] p-24 flex flex-col md:flex-row justify-around gap-20 text-white text-center shadow-2xl shadow-orange-100">
         <div className="space-y-4">
            <p className="text-[100px] font-black tracking-tighter leading-none">50k+</p>
            <p className="text-2xl font-black opacity-80 uppercase tracking-[0.4em]">Orders Zip'd</p>
         </div>
         <div className="space-y-4">
            <p className="text-[100px] font-black tracking-tighter leading-none">1.2k</p>
            <p className="text-2xl font-black opacity-80 uppercase tracking-[0.4em]">Vyne Partners</p>
         </div>
         <div className="space-y-4">
            <p className="text-[100px] font-black tracking-tighter leading-none">15m</p>
            <p className="text-2xl font-black opacity-80 uppercase tracking-[0.4em]">Avg Pickup</p>
         </div>
      </section>
    </div>
  );
};

const OnboardingView: React.FC<{ onComplete: (p: UserProfile) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [formData, setFormData] = useState({ name: '', phone: '', biz: '', loc: 'Central' });

  return (
    <div className="max-w-4xl mx-auto py-24 space-y-16">
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">Your journey <br /> begins in town.</h1>
        <p className="text-slate-400 text-2xl font-medium max-w-2xl mx-auto">Select your role to start growing with ZipVyne.</p>
      </div>

      {step === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { id: 'CUSTOMER', title: 'I want to Buy', desc: 'Shop from top local vendors', icon: <ShoppingBag className="w-10 h-10" />, color: 'orange' },
            { id: 'RESTAURANT', title: 'I want to Sell', desc: 'Grow your business with ZipVyne', icon: <Store className="w-10 h-10" />, color: 'blue' },
            { id: 'DRIVER', title: 'I want to Ride', desc: 'Earn money on your own schedule', icon: <Truck className="w-10 h-10" />, color: 'purple' },
          ].map(r => (
            <button 
              key={r.id} onClick={() => { setRole(r.id as UserRole); setStep(2); }}
              className="group bg-white p-12 rounded-[56px] border-4 border-slate-50 hover:border-orange-600 hover:shadow-[0_40px_100px_rgba(0,0,0,0.1)] transition-all text-left space-y-8"
            >
              <div className="w-20 h-20 rounded-[32px] flex items-center justify-center bg-slate-50 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:rotate-12 transition-all duration-500 text-slate-400">{r.icon}</div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{r.title}</h3>
                <p className="text-slate-400 font-bold text-lg leading-snug">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-2xl space-y-12 animate-in zoom-in-95 duration-300">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Identification Name</label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 focus:border-orange-200 outline-none font-black text-2xl transition-all" placeholder="e.g. Adebayo" />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Phone Line</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 focus:border-orange-200 outline-none font-black text-2xl transition-all" placeholder="+234..." />
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Your Base Area</label>
              <select value={formData.loc} onChange={e => setFormData({...formData, loc: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 outline-none font-black text-2xl appearance-none">
                 {ILESHA_NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={() => onComplete({ id: `u-${Date.now()}`, name: formData.name, phone: formData.phone, role, location: formData.loc })}
            className="w-full bg-slate-900 text-white py-8 rounded-[36px] font-black text-3xl hover:bg-orange-600 transition-all shadow-2xl shadow-slate-200 active:scale-95"
          >
            Create Profile <ArrowRight className="inline-block ml-4 w-10 h-10" />
          </button>
          <button onClick={() => setStep(1)} className="w-full text-slate-400 font-black text-xl hover:text-slate-900 transition-colors">Go Back</button>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<{ 
  role: UserRole, user: UserProfile | null, products: Product[], addProduct: (p: any) => void, orders: Order[], deliveries: DeliveryRequest[], updateOrderStatus: (id: string, s: any) => void, updateDeliveryStatus: (id: string, s: any) => void, logout: () => void 
}> = ({ role, user, products, addProduct, orders, deliveries, updateOrderStatus, updateDeliveryStatus, logout }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', desc: '', cat: 'Food' });
  const myProducts = products.filter(p => p.restaurantId === `v-${user?.id}`);
  const myOrders = orders.filter(o => o.restaurantId === `v-${user?.id}`);
  const myDeliveries = deliveries.filter(d => d.driverId === user?.id);
  const availableDeliveries = deliveries.filter(d => d.status === 'PENDING');

  return (
    <div className="space-y-16 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
           <h1 className="text-7xl font-black text-slate-900 tracking-tighter capitalize">{role} Hub</h1>
           <p className="text-slate-400 font-bold text-2xl leading-none">Managing operations for {user?.name}</p>
        </div>
        <button onClick={logout} className="text-red-500 font-black px-10 py-4 bg-red-50 rounded-3xl hover:bg-red-100 transition-all">Disconnect Session</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-700"><Wallet className="w-48 h-48" /></div>
            <h3 className="text-slate-500 font-black uppercase text-xs tracking-widest mb-4">Market Wallet</h3>
            <p className="text-6xl font-black tracking-tighter text-orange-500">₦12.5k</p>
            <button className="mt-8 bg-white/10 w-full py-4 rounded-2xl font-black hover:bg-white/20 transition-all">Withdraw Payout</button>
         </div>
         <div className="bg-white p-12 rounded-[56px] border-4 border-slate-50 shadow-xl flex flex-col justify-between">
            <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-4">Active Tasks</h3>
            <p className="text-7xl font-black tracking-tighter text-slate-900">{role === 'RESTAURANT' ? myOrders.length : myDeliveries.length}</p>
            <div className="flex items-center gap-2 text-green-500 font-black mt-6"><div className="w-3 h-3 rounded-full bg-green-500 animate-ping"></div> Live & Online</div>
         </div>
         <div className="bg-white p-12 rounded-[56px] border-4 border-slate-50 shadow-xl">
            <h3 className="text-slate-400 font-black uppercase text-xs tracking-widest mb-4">Hub Reputation</h3>
            <p className="text-7xl font-black tracking-tighter text-slate-900">5.0</p>
            <div className="flex gap-1 mt-4 text-orange-500">
               {[1,2,3,4,5].map(i => <Star key={i} className="fill-orange-500 w-6 h-6" />)}
            </div>
         </div>
      </div>

      {role === 'RESTAURANT' && (
        <div className="space-y-16">
           <div className="flex justify-between items-center">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Your Catalog</h2>
              <button onClick={() => setShowAddModal(true)} className="bg-orange-600 text-white px-10 py-6 rounded-[36px] font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-orange-100 flex items-center gap-4">
                <Plus className="w-7 h-7" /> Add New Item
              </button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              {myProducts.length === 0 ? (
                <div className="col-span-full py-24 bg-slate-50 rounded-[64px] border-4 border-dashed border-slate-100 text-center space-y-6">
                   <Utensils className="w-20 h-20 text-slate-200 mx-auto" />
                   <p className="text-2xl font-black text-slate-300">Catalog is currently empty.</p>
                </div>
              ) : myProducts.map(p => (
                <div key={p.id} className="bg-white rounded-[40px] border-2 border-slate-50 overflow-hidden shadow-sm group">
                   <div className="relative h-56">
                      <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-slate-400 hover:text-orange-600 transition-all"><TrendingUp className="w-4 h-4" /></button>
                        <button className="p-3 bg-red-500 text-white rounded-2xl shadow-xl hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                   <div className="p-8">
                      <h4 className="font-black text-2xl mb-1">{p.name}</h4>
                      <p className="text-orange-600 font-black text-xl">₦{p.price.toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </div>

           {showAddModal && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowAddModal(false)}></div>
               <div className="relative bg-white w-full max-w-2xl rounded-[64px] p-16 shadow-2xl space-y-10 animate-in zoom-in-95">
                  <h3 className="text-5xl font-black tracking-tighter">New Product</h3>
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Dish Name</label>
                        <input value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none" placeholder="e.g. Suya Special" />
                     </div>
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Price (₦)</label>
                           <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none" placeholder="2500" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Category</label>
                           <select value={newItem.cat} onChange={e => setNewItem({...newItem, cat: e.target.value})} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none appearance-none">
                              <option>Food</option><option>Drinks</option><option>Small Chops</option><option>Others</option>
                           </select>
                        </div>
                     </div>
                  </div>
                  <button onClick={() => { addProduct({ ...newItem, price: Number(newItem.price), category: newItem.cat }); setShowAddModal(false); }} className="w-full bg-orange-600 text-white py-8 rounded-[36px] font-black text-3xl hover:bg-orange-700 transition-all shadow-2xl shadow-orange-100">Upload to Market</button>
               </div>
             </div>
           )}

           <div className="space-y-10">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Customer Requests</h2>
              {myOrders.map(o => (
                <div key={o.id} className="bg-white p-10 rounded-[56px] border-4 border-slate-50 shadow-xl flex flex-col md:flex-row justify-between items-center gap-12 group hover:border-orange-100 transition-all">
                   <div className="flex gap-10 items-center">
                      <div className="w-24 h-24 bg-slate-900 rounded-[36px] flex items-center justify-center text-white"><Utensils className="w-10 h-10" /></div>
                      <div>
                         <p className="text-3xl font-black text-slate-900">#{o.id.slice(-6).toUpperCase()}</p>
                         <p className="text-slate-400 font-bold text-xl">{o.items.length} dishes • ₦{o.total.toLocaleString()}</p>
                      </div>
                   </div>
                   <div className="flex gap-6 items-center">
                      {o.status === 'PENDING' && <button onClick={() => updateOrderStatus(o.id, 'PREPARING')} className="bg-orange-600 text-white px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-all">Prepare Now</button>}
                      {o.status === 'PREPARING' && <button onClick={() => updateOrderStatus(o.id, 'OUT_FOR_DELIVERY')} className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-all">Send to Rider</button>}
                      <div className="px-8 py-4 bg-slate-50 rounded-3xl font-black text-slate-500 uppercase text-xs tracking-widest">{o.status}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {role === 'DRIVER' && (
        <div className="space-y-20">
           <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Gig Marketplace</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {availableDeliveries.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-slate-50 rounded-[64px] border-4 border-dashed border-slate-100">
                   <Truck className="w-24 h-24 text-slate-200 mx-auto mb-8" />
                   <p className="text-3xl font-black text-slate-300">Market is quiet. Watching for gigs...</p>
                </div>
              ) : availableDeliveries.map(d => (
                <div key={d.id} className="bg-white p-12 rounded-[64px] border-4 border-slate-50 shadow-2xl space-y-10 relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <p className="text-5xl font-black text-orange-600 tracking-tighter">₦{d.price.toLocaleString()}</p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">Expected Payout</p>
                      </div>
                      <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">Zap Logistics</div>
                   </div>
                   <div className="space-y-8 relative z-10">
                      <div className="flex items-center gap-6">
                         <MapPin className="text-orange-500 w-8 h-8" />
                         <div>
                            <p className="text-slate-400 text-xs font-black uppercase">From Hub</p>
                            <p className="font-black text-2xl text-slate-900">{d.pickupLocation}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <Navigation className="text-slate-900 w-8 h-8" />
                         <div>
                            <p className="text-slate-400 text-xs font-black uppercase">To Hub</p>
                            <p className="font-black text-2xl text-slate-900">{d.dropoffLocation}</p>
                         </div>
                      </div>
                   </div>
                   <button onClick={() => updateDeliveryStatus(d.id, 'ACCEPTED')} className="w-full bg-slate-900 text-white py-8 rounded-[36px] font-black text-2xl hover:bg-orange-600 transition-all shadow-xl active:scale-95">Lock Gig</button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

const ExploreView: React.FC<{ addToCart: (p: Product) => void, products: Product[] }> = ({ addToCart, products }) => (
  <div className="space-y-16">
    <h1 className="text-6xl font-black text-slate-900 tracking-tighter">The Marketplace</h1>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-[56px] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col h-full">
          <img src={p.image} className="w-full h-72 object-cover group-hover:scale-110 duration-700" />
          <div className="p-12 flex-1 flex flex-col">
            <h3 className="text-3xl font-black text-slate-900 mb-4">{p.name}</h3>
            <p className="text-slate-400 font-bold mb-10 line-clamp-2">{p.description}</p>
            <div className="flex items-center justify-between mt-auto pt-10 border-t">
               <span className="text-3xl font-black text-orange-600">₦{p.price.toLocaleString()}</span>
               <button onClick={() => addToCart(p)} className="bg-slate-900 text-white p-5 rounded-[24px] hover:bg-orange-600 transition-all active:scale-90"><Plus /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const LogisticsRequest: React.FC<{ requestDelivery: (f: string, t: string, i: string, p: number) => void }> = ({ requestDelivery }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [item, setItem] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [cal, setCal] = useState(false);

  const handleEst = async () => { setCal(true); setPrice(await estimateLogisticsPrice(from, to, item)); setCal(false); };

  return (
    <div className="max-w-4xl mx-auto py-24 space-y-20">
       <div className="text-center space-y-6">
          <h1 className="text-7xl font-black tracking-tighter">Town Logistics</h1>
          <p className="text-2xl font-medium text-slate-400">Zip anything across town in minutes.</p>
       </div>
       <div className="bg-white p-16 rounded-[64px] border border-slate-100 shadow-2xl space-y-12">
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Pickup Area</label>
                   <select value={from} onChange={e => setFrom(e.target.value)} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none appearance-none">{ILESHA_NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}</select>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Dropoff Area</label>
                   <select value={to} onChange={e => setTo(e.target.value)} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none appearance-none">{ILESHA_NEIGHBORHOODS.map(n => <option key={n}>{n}</option>)}</select>
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-4">Package Item</label>
                <input value={item} onChange={e => setItem(e.target.value)} className="w-full p-8 bg-slate-50 rounded-[32px] border-4 border-slate-50 font-black text-2xl outline-none transition-all" placeholder="e.g. Spare Parts" />
             </div>
          </div>
          {!price ? (
            <button onClick={handleEst} disabled={cal || !item} className="w-full bg-slate-900 text-white py-8 rounded-[36px] font-black text-3xl hover:bg-orange-600 transition-all shadow-xl">{cal ? 'Calculating...' : 'Get Zip Price'}</button>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95">
               <div className="bg-orange-600 p-12 rounded-[48px] text-white flex justify-between items-center shadow-2xl">
                  <div><p className="font-black uppercase text-xs opacity-70 tracking-widest mb-1">Guaranteed Price</p><p className="text-6xl font-black">₦{price.toLocaleString()}</p></div>
                  <Truck className="w-20 h-20 opacity-30" />
               </div>
               <button onClick={() => requestDelivery(from, to, item, price)} className="w-full bg-slate-900 text-white py-8 rounded-[36px] font-black text-3xl hover:bg-orange-700 transition-all shadow-xl">Book Zip Rider</button>
            </div>
          )}
       </div>
    </div>
  );
};

// Placeholder routes
const RestaurantDetail: React.FC<any> = () => <div className="py-20 text-center"><h1 className="text-5xl font-black">Vendor View</h1><p className="mt-4 text-slate-400">Deep catalog view coming soon...</p></div>;
const OrdersView: React.FC<any> = () => <div className="py-20 text-center"><h1 className="text-5xl font-black">Order Tracker</h1><p className="mt-4 text-slate-400">Live tracking active...</p></div>;
const LogisticsStatus: React.FC<any> = () => <div className="py-20 text-center"><h1 className="text-5xl font-black">Delivery Status</h1><p className="mt-4 text-slate-400">Rider on the move...</p></div>;

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
