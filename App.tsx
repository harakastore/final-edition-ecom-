
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CreditCard, 
  Beaker, 
  Menu, 
  Settings,
  LogOut,
  PenTool,
  Ship,
  Lock,
  Mail,
  Loader2
} from 'lucide-react';
import { DataProvider, useData } from './context/DataContext';
import { Dashboard } from './components/Dashboard';
import { ProductTable } from './components/ProductTable';
import { Inventory } from './components/Inventory';
import { Finance } from './components/Finance';
import { TestLab } from './components/TestLab';
import { DataEntry } from './components/DataEntry';
import { Sourcing } from './components/Sourcing';

type View = 'dashboard' | 'products' | 'inventory' | 'finance' | 'testlab' | 'data_entry' | 'sourcing';

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: any, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium
      ${isActive 
        ? 'bg-slate-900 text-white' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </button>
);

const Login: React.FC = () => {
  const { login } = useData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 text-center bg-slate-900 text-white">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">E</div>
          <h1 className="text-2xl font-bold tracking-tight">E-Com Master</h1>
          <p className="text-slate-400 text-sm mt-1">Management Portal Login</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="admin@ecommaster.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : 'Secure Sign In'}
          </button>
          
          <p className="text-center text-xs text-slate-400">
            Securely access your business insights.
          </p>
        </form>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { products, logout, user } = useData();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const activeProducts = products.filter(p => !p.isTest);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Product Performance</h1>
            <ProductTable products={activeProducts} title="All Active Products" />
          </div>
        );
      case 'inventory':
        return <Inventory />;
      case 'finance':
        return <Finance />;
      case 'testlab':
        return <TestLab />;
      case 'data_entry':
        return <DataEntry />;
      case 'sourcing':
        return <Sourcing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">E-Com Master</span>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              isActive={currentView === 'dashboard'} 
              onClick={() => { setCurrentView('dashboard'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={PenTool} 
              label="Data Entry" 
              isActive={currentView === 'data_entry'} 
              onClick={() => { setCurrentView('data_entry'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Package} 
              label="Products" 
              isActive={currentView === 'products'} 
              onClick={() => { setCurrentView('products'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Beaker} 
              label="Test Lab" 
              isActive={currentView === 'testlab'} 
              onClick={() => { setCurrentView('testlab'); setIsSidebarOpen(false); }} 
            />
            <div className="pt-4 pb-2">
              <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Management</p>
            </div>
            <SidebarItem 
              icon={Ship} 
              label="Sourcing & Finance" 
              isActive={currentView === 'sourcing'} 
              onClick={() => { setCurrentView('sourcing'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={Package} 
              label="Inventory" 
              isActive={currentView === 'inventory'} 
              onClick={() => { setCurrentView('inventory'); setIsSidebarOpen(false); }} 
            />
            <SidebarItem 
              icon={CreditCard} 
              label="Expenses" 
              isActive={currentView === 'finance'} 
              onClick={() => { setCurrentView('finance'); setIsSidebarOpen(false); }} 
            />
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center justify-end w-full gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">Admin User</p>
              <p className="text-xs text-slate-500">{user?.email || 'admin@ecommaster.com'}</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 uppercase">
              {user?.email?.[0] || 'U'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Synchronizing your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AuthGate>
        <AppLayout />
      </AuthGate>
    </DataProvider>
  );
};

export default App;
