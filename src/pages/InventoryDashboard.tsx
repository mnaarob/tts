import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  TrendingUp,
  BarChart3,
  Users,
  Plus,
  Search,
  AlertTriangle,
  LogOut,
  Code2,
  ChevronRight,
  PackagePlus,
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  Scan,
  Menu,
  X,
  Mail,
  ChevronDown,
  UserPlus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../hooks/useOrganization';
import { useBarcodeLookup } from '../hooks/useBarcodeLookup';
import { useJwtClaims } from '../hooks/useJwtClaims';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { AddProductModal } from '../components/AddProductModal';
import { MfaBanner } from '../components/MfaBanner';

type Product = {
  id: string;
  name: string;
  sku: string | null;
  barcode?: string | null;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  is_published: boolean;
  category_id: string | null;
  categories: { name: string } | null;
  image_url?: string | null;
  best_before_date?: string | null;
  expiry_warning_days?: number | null;
};

type Category = {
  id: string;
  name: string;
  organization_id: string;
};

type StockMovement = {
  id: string;
  product_id: string;
  type: string;
  quantity: number;
  note: string | null;
  created_at: string;
  products: { name: string } | null;
};

const CATEGORY_COLORS = [
  'bg-emerald-100 text-emerald-800',
  'bg-blue-100 text-blue-800',
  'bg-amber-100 text-amber-800',
  'bg-cyan-100 text-cyan-800',
  'bg-red-100 text-red-800',
  'bg-slate-100 text-slate-800',
];

const SIDEBAR_LINKS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Products', icon: Package },
  { name: 'Categories', icon: FolderTree },
  { name: 'Stock', icon: TrendingUp },
  { name: 'Reports', icon: BarChart3 },
  { name: 'Team', icon: Users },
];

type TeamMember = {
  user_id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'manager' | 'staff';
  employee_id: string | null;
  joined_at: string;
};

const ROLE_BADGE: Record<string, string> = {
  owner:   'bg-indigo-100 text-indigo-700',
  manager: 'bg-blue-100 text-blue-700',
  staff:   'bg-slate-100 text-slate-600',
};
const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', manager: 'Manager', staff: 'Staff',
};

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { signOut } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { lookup } = useBarcodeLookup(organization?.id || '');
  const claims = useJwtClaims();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalPrefilled, setAddModalPrefilled] = useState<{ barcode: string; name: string; brand?: string; imageUrl?: string; categories?: string } | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Team tab state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'staff'>('staff');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ message: string; employeeId: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const canManageTeam = claims?.store_role === 'owner' || claims?.store_role === 'manager';

  const fetchData = React.useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    const [productsRes, categoriesRes, movementsRes] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(name)')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name'),
      supabase
        .from('stock_movements')
        .select('*, products(name)')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);
    setProducts((productsRes.data as Product[]) || []);
    setCategories((categoriesRes.data as Category[]) || []);
    setStockMovements((movementsRes.data as StockMovement[]) || []);
    setLoading(false);
  }, [organization]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchTeam = useCallback(async () => {
    if (!claims?.store_id) return;
    setTeamLoading(true);
    const { data } = await supabase.rpc('get_store_team', { p_store_id: claims.store_id });
    setTeamMembers((data as TeamMember[]) || []);
    setTeamLoading(false);
  }, [claims?.store_id]);

  useEffect(() => {
    if (activeTab === 'Team') fetchTeam();
  }, [activeTab, fetchTeam]);

  async function handleTeamInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!claims?.store_id) return;
    setInviteLoading(true);
    setInviteSuccess(null);
    setInviteError(null);

    // Generate a unique employee ID
    const { data: generatedId, error: genError } = await supabase.rpc('generate_employee_id', {
      p_store_id: claims.store_id,
    });
    if (genError || !generatedId) {
      setInviteError('Could not generate Employee ID. Please try again.');
      setInviteLoading(false);
      return;
    }

    const { error: inviteError } = await supabase.functions.invoke('invite-employee', {
      body: { store_id: claims.store_id, email: inviteEmail, role: inviteRole, employee_id: generatedId },
    });

    if (inviteError) {
      setInviteError(inviteError.message || 'Failed to send invite. Please try again.');
      setInviteLoading(false);
      return;
    }

    setInviteSuccess({ message: `Invite sent to ${inviteEmail}`, employeeId: generatedId as string });
    setInviteEmail('');
    setInviteRole('staff');
    setInviteLoading(false);
    fetchTeam();
  }

  async function handleRemoveMember(userId: string) {
    if (!claims?.store_id) return;
    setRemoveLoading(true);
    await supabase.from('store_admins').delete().eq('store_id', claims.store_id).eq('user_id', userId);
    setConfirmRemoveId(null);
    setRemoveLoading(false);
    fetchTeam();
  }

  function copyEmployeeId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  async function handleScan(barcode: string) {
    if (!organization) return;
    const { existing, lookup: lookupData } = await lookup(barcode);
    if (existing) {
      alert(`"${existing.name}" is already in your inventory.`);
      return;
    }
    setEditProduct(null);
    setAddModalPrefilled({
      barcode,
      name: lookupData?.name || 'Unknown Product',
      imageUrl: lookupData?.imageUrl,
      categories: lookupData?.categories,
    });
    setAddModalOpen(true);
  }

  async function handleSaveProduct(product: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
    quantity: number;
    category_id: string | null;
    image_url: string | null;
    is_published: boolean;
    best_before_date?: string | null;
    expiry_warning_days?: number;
  }) {
    if (!organization) throw new Error('No organization. Please sign out and sign in again.');
    const { data: inserted, error } = await supabase
      .from('products')
      .insert({
        organization_id: organization.id,
        name: product.name,
        sku: product.sku || null,
        barcode: product.barcode || null,
        price: product.price,
        quantity: product.quantity,
        category_id: product.category_id || null,
        image_url: product.image_url || null,
        is_published: product.is_published,
        best_before_date: product.best_before_date || null,
        expiry_warning_days: product.expiry_warning_days ?? 7,
      })
      .select('id')
      .single();

    if (error) {
      const msg =
        error.code === '23503'
          ? 'Invalid category. Please select a valid category or leave it empty.'
          : error.code === '42501'
            ? 'Permission denied. Make sure you are signed in and your organization is set up.'
            : error.message;
      throw new Error(msg);
    }

    if (inserted && product.quantity > 0) {
      await supabase.from('stock_movements').insert({
        product_id: inserted.id,
        organization_id: organization.id,
        type: 'receive',
        quantity: product.quantity,
        note: 'Initial stock',
      });
    }
    setAddModalPrefilled(null);
    fetchData();
  }

  async function handleUpdateProduct(
    productId: string,
    product: {
      name: string;
      sku: string;
      barcode: string;
      price: number;
      quantity: number;
      category_id: string | null;
      image_url: string | null;
      is_published: boolean;
      best_before_date?: string | null;
      expiry_warning_days?: number;
    }
  ) {
    if (!organization) throw new Error('No organization. Please sign out and sign in again.');
    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        sku: product.sku || null,
        barcode: product.barcode || null,
        price: product.price,
        quantity: product.quantity,
        category_id: product.category_id || null,
        image_url: product.image_url || null,
        is_published: product.is_published,
        best_before_date: product.best_before_date || null,
        expiry_warning_days: product.expiry_warning_days ?? 7,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('organization_id', organization.id);

    if (error) {
      const msg =
        error.code === '23503'
          ? 'Invalid category. Please select a valid category or leave it empty.'
          : error.code === '42501'
            ? 'Permission denied. Make sure you are signed in and your organization is set up.'
            : error.message;
      throw new Error(msg);
    }
    setEditProduct(null);
    fetchData();
  }

  function getExpiryStatus(product: Product): { label: string; className: string } | null {
    const date = product.best_before_date;
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bestBefore = new Date(date);
    bestBefore.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((bestBefore.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const warningDays = product.expiry_warning_days ?? 7;
    if (daysLeft < 0) return { label: 'Expired', className: 'bg-red-100 text-red-800' };
    if (daysLeft <= warningDays) return { label: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, className: 'bg-amber-100 text-amber-800' };
    return null;
  }

  const lowStockProducts = products.filter(
    (p) => p.quantity <= (p.low_stock_threshold ?? 5)
  );
  const lowStockCount = lowStockProducts.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringSoonProducts = products.filter((p) => {
    if (!p.best_before_date) return false;
    const bestBefore = new Date(p.best_before_date);
    bestBefore.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((bestBefore.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const warningDays = p.expiry_warning_days ?? 7;
    return daysLeft >= 0 && daysLeft <= warningDays;
  });
  const expiredProducts = products.filter((p) => {
    if (!p.best_before_date) return false;
    const bestBefore = new Date(p.best_before_date);
    bestBefore.setHours(0, 0, 0, 0);
    return bestBefore.getTime() < today.getTime();
  });
  const inventoryValue = products.reduce((sum, p) => sum + Number(p.price) * p.quantity, 0);
  const categoriesWithCount = categories.map((cat) => ({
    ...cat,
    productCount: products.filter((p) => p.category_id === cat.id).length,
    color: CATEGORY_COLORS[categories.indexOf(cat) % CATEGORY_COLORS.length],
  }));

  if (orgLoading || !organization) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:bg-slate-50">
      {/* Top Header - Tech to Store left, org + Sign out right */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm safe-area-top">
        <div className="flex justify-between items-center h-14 sm:h-16 px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2.5 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group min-w-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 truncate">Tech to Store</span>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <span className="text-sm text-slate-600 hidden sm:block truncate max-w-[160px]">
              {organization.name}
            </span>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors text-sm min-h-[44px] min-w-[44px] sm:min-w-0 justify-center"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Sidebar - narrow drawer on mobile, full on desktop */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-[min(280px,85vw)] lg:w-64 min-h-screen lg:min-h-[calc(100vh-4rem)] bg-white flex-shrink-0 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="h-14 lg:hidden" />
          <nav className="p-4 pt-6 lg:pt-4 space-y-1">
            <p className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              My Inventory
            </p>
            {SIDEBAR_LINKS.filter(
              (link) => link.name !== 'Team' || canManageTeam
            ).map((link) => (
              <button
                key={link.name}
                onClick={() => {
                  setActiveTab(link.name);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                  activeTab === link.name
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100 text-slate-900'
                }`}
              >
                <link.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === link.name ? 'text-blue-600' : ''}`} />
                {link.name}
              </button>
            ))}
          </nav>
        </aside>
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'Dashboard' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-0.5 text-sm sm:text-base">
                  Overview of your inventory
                </p>
              </div>

              <MfaBanner />

              {/* Stats Cards - 2x2 on mobile, polished */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Total Products</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm font-medium text-slate-500">Inventory Value</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">${inventoryValue.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-amber-200/80 p-4 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm font-medium text-amber-700">Low Stock</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-800 mt-1">{lowStockCount}</p>
                </div>
                <div className="bg-red-50 rounded-2xl border border-red-200/80 p-4 sm:p-6 shadow-sm">
                  <p className="text-xs sm:text-sm font-medium text-red-700">Expiring Soon</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-800 mt-1">{expiringSoonProducts.length + expiredProducts.length}</p>
                </div>
              </div>

              {/* Low Stock Alert - polished */}
              {lowStockCount > 0 && (
                <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex items-start gap-3 shadow-sm">
                  <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-amber-900">
                      {lowStockCount} product{lowStockCount > 1 ? 's' : ''} need restocking
                    </p>
                    <p className="text-sm text-amber-800/90 mt-0.5">
                      {lowStockProducts.map((p) => p.name).join(', ')} {lowStockCount <= 2 ? 'is' : 'are'} below your reorder point.
                    </p>
                  </div>
                </div>
              )}

              {/* Expiring Soon Alert - polished */}
              {(expiringSoonProducts.length > 0 || expiredProducts.length > 0) && (
                <div className="bg-red-50/90 border border-red-200/80 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 shadow-sm">
                  <p className="font-semibold text-red-900 mb-1">
                    {expiredProducts.length > 0 && (
                      <span>{expiredProducts.length} expired</span>
                    )}
                    {expiredProducts.length > 0 && expiringSoonProducts.length > 0 && ' · '}
                    {expiringSoonProducts.length > 0 && (
                      <span>{expiringSoonProducts.length} expiring soon</span>
                    )}
                  </p>
                  <p className="text-sm text-red-800/90">
                    {(expiredProducts.length > 0 ? expiredProducts : expiringSoonProducts)
                      .map((p) => {
                        const status = getExpiryStatus(p);
                        return `${p.name}${status ? ` (${status.label})` : ''}`;
                      })
                      .join(', ')}
                  </p>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 flex flex-col gap-4">
                  <h2 className="font-semibold text-slate-900">Recent Products</h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScannerOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors min-h-[44px] shadow-sm"
                      >
                        <Scan className="w-4 h-4" />
                        Scan to add
                      </button>
                      <button
                        onClick={() => {
                          setEditProduct(null);
                          setAddModalPrefilled(null);
                          setAddModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors min-h-[44px] shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>
                  </div>
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Website</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(loading ? [] : products).map((product) => {
                        const isLowStock = product.quantity <= (product.low_stock_threshold ?? 5);
                        const expiryStatus = getExpiryStatus(product);
                        return (
                          <tr key={product.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <span className="font-medium text-slate-900">{product.name}</span>
                              {isLowStock && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Low stock</span>
                              )}
                              {expiryStatus && (
                                <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${expiryStatus.className}`}>{expiryStatus.label}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.sku || '-'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.categories?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">${Number(product.price).toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>{product.quantity}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {product.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setEditProduct(product);
                                  setAddModalPrefilled(null);
                                  setAddModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 min-h-[44px]"
                              >
                                Edit <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards - polished */}
                <div className="md:hidden divide-y divide-slate-100">
                  {(loading ? [] : products).map((product) => {
                    const isLowStock = product.quantity <= (product.low_stock_threshold ?? 5);
                    const expiryStatus = getExpiryStatus(product);
                    return (
                      <div key={product.id} className="p-4 active:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-900 block truncate">{product.name}</span>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {isLowStock && <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800">Low stock</span>}
                              {expiryStatus && <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${expiryStatus.className}`}>{expiryStatus.label}</span>}
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                              {product.categories?.name || 'Uncategorized'} · ${Number(product.price).toFixed(2)} · Qty: {product.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setAddModalPrefilled(null);
                              setAddModalOpen(true);
                            }}
                            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-xl text-sm font-medium min-h-[44px] transition-colors"
                          >
                            Edit <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Products */}
          {activeTab === 'Products' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Products</h1>
                <p className="text-slate-600 mt-0.5 text-sm sm:text-base">
                  Manage your product catalog
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-200/80 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <select className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50">
                      <option>All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScannerOpen(true)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium min-h-[44px] shadow-sm"
                      >
                        <Scan className="w-4 h-4" />
                        Scan
                      </button>
                      <button
                        onClick={() => {
                          setEditProduct(null);
                          setAddModalPrefilled(null);
                          setAddModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium min-h-[44px] shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">SKU</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Qty</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Website</th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {products.map((product) => {
                        const isLowStock = product.quantity <= (product.low_stock_threshold ?? 5);
                        const expiryStatus = getExpiryStatus(product);
                        return (
                          <tr key={product.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                              <span className="font-medium text-slate-900">{product.name}</span>
                              {isLowStock && (
                                <span className="ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Low stock</span>
                              )}
                              {expiryStatus && (
                                <span className={`ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium ${expiryStatus.className}`}>{expiryStatus.label}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.sku || '-'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{product.categories?.name || '-'}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">${Number(product.price).toFixed(2)}</td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-medium ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>{product.quantity}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${product.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {product.is_published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setEditProduct(product);
                                  setAddModalPrefilled(null);
                                  setAddModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                              >
                                Edit <ChevronRight className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Mobile cards - polished */}
                <div className="md:hidden divide-y divide-slate-100">
                  {products.map((product) => {
                    const isLowStock = product.quantity <= (product.low_stock_threshold ?? 5);
                    const expiryStatus = getExpiryStatus(product);
                    return (
                      <div key={product.id} className="p-4 active:bg-slate-50/50 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-slate-900 block truncate">{product.name}</span>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {isLowStock && <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800">Low stock</span>}
                              {expiryStatus && <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${expiryStatus.className}`}>{expiryStatus.label}</span>}
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                              {product.categories?.name || 'Uncategorized'} · ${Number(product.price).toFixed(2)} · Qty: {product.quantity}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditProduct(product);
                              setAddModalPrefilled(null);
                              setAddModalOpen(true);
                            }}
                            className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 rounded-xl text-sm font-medium min-h-[44px] transition-colors"
                          >
                            Edit <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Categories */}
          {activeTab === 'Categories' && (
            <>
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Categories</h1>
                  <p className="text-slate-600 mt-0.5 text-sm sm:text-base">Organize your products</p>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium min-h-[44px] shadow-sm">
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {categoriesWithCount.map((cat) => (
                  <div key={cat.name} className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{cat.productCount} products</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${cat.color}`}>{cat.name}</span>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button className="text-sm text-slate-400 hover:text-slate-600">View products</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Stock */}
          {activeTab === 'Stock' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Stock Management</h1>
                <p className="text-slate-600 mt-0.5 text-sm sm:text-base">Receive stock and make adjustments</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-emerald-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition-colors text-left">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <ArrowDownCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Receive Stock</p>
                          <p className="text-sm text-slate-500">Add new inventory from delivery</p>
                        </div>
                      </button>
                      <button className="flex items-center gap-3 px-6 py-4 border-2 border-dashed border-amber-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-colors text-left">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <PackagePlus className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">Adjust Stock</p>
                          <p className="text-sm text-slate-500">Correct quantity (damage, expiry)</p>
                        </div>
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <h2 className="font-semibold text-slate-900 px-6 py-4 border-b border-slate-200">Recent Movements</h2>
                    <div className="divide-y divide-slate-200">
                      {stockMovements.length === 0 ? (
                        <div className="px-6 py-8 text-center text-slate-500 text-sm">No stock movements yet</div>
                      ) : (
                        stockMovements.map((mov) => (
                        <div key={mov.id} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {mov.type === 'receive' ? (
                              <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ArrowUpCircle className="w-5 h-5 text-amber-500" />
                            )}
                            <div>
                              <p className="font-medium text-slate-900">{mov.products?.name || 'Product'}</p>
                              <p className="text-sm text-slate-500">{mov.note || '-'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${mov.quantity >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {mov.quantity >= 0 ? '+' : ''}{mov.quantity}
                            </p>
                            <p className="text-xs text-slate-500">{new Date(mov.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )))}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 sticky top-24">
                    <h2 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Low Stock Items
                    </h2>
                    <ul className="space-y-3">
                      {lowStockProducts.length === 0 ? (
                        <li className="text-slate-500 text-sm">All stock levels are good</li>
                      ) : (
                        lowStockProducts.map((p) => (
                        <li key={p.id} className="flex justify-between items-center">
                          <span className="text-slate-900">{p.name}</span>
                          <span className="font-medium text-amber-700">{p.quantity} left</span>
                        </li>
                      )))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Reports */}
          {activeTab === 'Reports' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-600 mt-0.5 text-sm sm:text-base">Insights and analytics</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900">Inventory Value</h2>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">${inventoryValue.toFixed(2)}</p>
                  <p className="text-sm text-slate-500 mt-1">Total value of current stock</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="w-6 h-6 text-amber-600" />
                    </div>
                    <h2 className="font-semibold text-slate-900">Low Stock Report</h2>
                  </div>
                  <p className="text-3xl font-bold text-amber-600">{lowStockCount} items</p>
                  <p className="text-sm text-slate-500 mt-1">Below reorder point</p>
                </div>
              </div>
              <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Stock by Category</h2>
                <div className="space-y-4">
                  {categoriesWithCount.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700">{cat.name}</span>
                        <span className="font-medium text-slate-900">{cat.productCount} products</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.max(5, (cat.productCount / Math.max(1, products.length)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Team Tab */}
          {activeTab === 'Team' && (
            <>
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Team</h1>
                <p className="text-slate-600 mt-0.5 text-sm sm:text-base">
                  Manage who has access to your store
                </p>
              </div>

              {/* Invite form */}
              {canManageTeam && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-6">
                  <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-slate-500" />
                    Invite a team member
                  </h2>
                  <form onSubmit={handleTeamInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      />
                    </div>
                    <div className="relative">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'manager' | 'staff')}
                        className="appearance-none w-full sm:w-36 px-4 pr-9 py-2.5 min-h-[44px] border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
                      >
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {inviteLoading ? 'Sending…' : 'Send Invite'}
                    </button>
                  </form>

                  {inviteSuccess && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{inviteSuccess.message}</p>
                        <p className="mt-0.5">
                          Their Employee ID is{' '}
                          <span className="font-mono font-bold tracking-widest text-emerald-800">
                            {inviteSuccess.employeeId}
                          </span>
                          {' '}— share it with them so they can log in.
                        </p>
                      </div>
                      <button
                        onClick={() => copyEmployeeId(inviteSuccess.employeeId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId ? 'Copied!' : 'Copy ID'}
                      </button>
                    </div>
                  )}
                  {inviteError && (
                    <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {inviteError}
                    </div>
                  )}
                </div>
              )}

              {/* Team members table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">
                    Team members
                    {teamMembers.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-normal">
                        {teamMembers.length}
                      </span>
                    )}
                  </h2>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  {teamLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">No team members yet.</div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left">
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee ID</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
                          {canManageTeam && (
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teamMembers.map((m) => {
                          const isConfirming = confirmRemoveId === m.user_id;
                          return (
                            <tr key={m.user_id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 text-sm">{m.full_name}</td>
                              <td className="px-6 py-4 text-slate-600 text-sm">{m.email}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[m.role]}`}>
                                  {ROLE_LABELS[m.role]}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-sm font-semibold text-slate-800 tracking-widest">
                                  {m.employee_id ?? '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-slate-500 text-sm">
                                {new Date(m.joined_at).toLocaleDateString()}
                              </td>
                              {canManageTeam && (
                                <td className="px-6 py-4">
                                  {m.role === 'owner' ? (
                                    <span className="text-xs text-slate-400">—</span>
                                  ) : isConfirming ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-slate-600">Remove?</span>
                                      <button
                                        onClick={() => handleRemoveMember(m.user_id)}
                                        disabled={removeLoading}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                                      >
                                        {removeLoading ? '…' : 'Yes'}
                                      </button>
                                      <button
                                        onClick={() => setConfirmRemoveId(null)}
                                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmRemoveId(m.user_id)}
                                      className="text-slate-400 hover:text-red-600 transition-colors"
                                      aria-label={`Remove ${m.full_name}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-slate-100">
                  {teamLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  ) : teamMembers.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-sm">No team members yet.</div>
                  ) : (
                    teamMembers.map((m) => {
                      const isConfirming = confirmRemoveId === m.user_id;
                      return (
                        <div key={m.user_id} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{m.full_name}</p>
                              <p className="text-sm text-slate-500 mt-0.5 truncate">{m.email}</p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_BADGE[m.role]}`}>
                                  {ROLE_LABELS[m.role]}
                                </span>
                                {m.employee_id && (
                                  <span className="font-mono text-xs font-bold text-slate-700 tracking-widest bg-slate-100 px-2 py-1 rounded-lg">
                                    {m.employee_id}
                                  </span>
                                )}
                                <span className="text-xs text-slate-400">
                                  Joined {new Date(m.joined_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {canManageTeam && m.role !== 'owner' && (
                              <div className="flex-shrink-0">
                                {isConfirming ? (
                                  <div className="flex flex-col items-end gap-1.5">
                                    <span className="text-sm text-slate-600">Remove?</span>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleRemoveMember(m.user_id)}
                                        disabled={removeLoading}
                                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50"
                                      >
                                        {removeLoading ? '…' : 'Yes'}
                                      </button>
                                      <button
                                        onClick={() => setConfirmRemoveId(null)}
                                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmRemoveId(m.user_id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
                                    aria-label={`Remove ${m.full_name}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
      <AddProductModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddModalPrefilled(null);
          setEditProduct(null);
        }}
        onSave={
          editProduct
            ? (data) => handleUpdateProduct(editProduct.id, data)
            : handleSaveProduct
        }
        categories={categories}
        prefilled={addModalPrefilled}
        productId={editProduct?.id}
        initialData={
          editProduct
            ? {
                id: editProduct.id,
                name: editProduct.name,
                sku: editProduct.sku ?? '',
                barcode: editProduct.barcode ?? '',
                price: editProduct.price,
                quantity: editProduct.quantity,
                category_id: editProduct.category_id,
                image_url: editProduct.image_url ?? '',
                is_published: editProduct.is_published,
                best_before_date: editProduct.best_before_date ?? '',
                expiry_warning_days: editProduct.expiry_warning_days ?? 7,
              }
            : undefined
        }
      />
    </div>
  );
}
