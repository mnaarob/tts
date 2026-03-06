import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  TrendingUp,
  BarChart3,
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
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useOrganization } from '../hooks/useOrganization';
import { useBarcodeLookup } from '../hooks/useBarcodeLookup';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { AddProductModal } from '../components/AddProductModal';

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
];

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { signOut } = useAuth();
  const { organization, loading: orgLoading } = useOrganization();
  const { lookup } = useBarcodeLookup(organization?.id || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalPrefilled, setAddModalPrefilled] = useState<{ barcode: string; name: string; brand?: string; imageUrl?: string; categories?: string } | null>(null);

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

  async function handleScan(barcode: string) {
    if (!organization) return;
    const { existing, lookup: lookupData } = await lookup(barcode);
    if (existing) {
      alert(`"${existing.name}" is already in your inventory.`);
      return;
    }
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
  }) {
    if (!organization) return;
    const { error } = await supabase.from('products').insert({
      organization_id: organization.id,
      name: product.name,
      sku: product.sku || null,
      barcode: product.barcode || null,
      price: product.price,
      quantity: product.quantity,
      category_id: product.category_id,
      image_url: product.image_url,
      is_published: product.is_published,
    });
    if (error) throw error;
    setAddModalPrefilled(null);
    fetchData();
  }

  const lowStockProducts = products.filter(
    (p) => p.quantity <= (p.low_stock_threshold ?? 5)
  );
  const lowStockCount = lowStockProducts.length;
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
    <div className="min-h-screen bg-slate-50">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-900 p-1.5 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">Tech to Store</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:inline">
                {organization.name}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm">
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex-shrink-0">
          <nav className="p-4 space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              My Inventory
            </p>
            {SIDEBAR_LINKS.map((link) => (
              <button
                key={link.name}
                onClick={() => setActiveTab(link.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === link.name
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {activeTab === 'Dashboard' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-slate-600 mt-1">
                  Overview of your inventory
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-500">Total Products</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{products.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-sm font-medium text-slate-500">Inventory Value</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">${inventoryValue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-xl border border-amber-200 bg-amber-50 rounded-xl p-6">
                  <p className="text-sm font-medium text-amber-700">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-amber-800 mt-1">{lowStockCount}</p>
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">
                      {lowStockCount} product{lowStockCount > 1 ? 's' : ''} need restocking
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      {lowStockProducts.map((p) => p.name).join(', ')} {lowStockCount <= 2 ? 'is' : 'are'} below your reorder point.
                    </p>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h2 className="font-semibold text-slate-900">Recent Products</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScannerOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Scan className="w-4 h-4" />
                        Scan to add
                      </button>
                      <button
                        onClick={() => {
                          setAddModalPrefilled(null);
                          setAddModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add Product
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Website
                        </th>
                        <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(loading ? [] : products).map((product) => {
                        const isLowStock = product.quantity <= (product.low_stock_threshold ?? 5);
                        return (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-900">
                              {product.name}
                            </span>
                            {isLowStock && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                Low stock
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {product.sku || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {product.categories?.name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            ${Number(product.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-medium ${
                                isLowStock ? 'text-amber-600' : 'text-slate-900'
                              }`}
                            >
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.is_published
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {product.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                              Edit
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Products */}
          {activeTab === 'Products' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Products</h1>
                <p className="text-slate-600 mt-1">
                  Manage your product catalog
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setScannerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Scan className="w-4 h-4" />
                      Scan to add
                    </button>
                    <button
                      onClick={() => {
                        setAddModalPrefilled(null);
                        setAddModalOpen(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
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
                        return (
                        <tr key={product.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-slate-900">{product.name}</span>
                            {isLowStock && (
                              <span className="ml-2 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Low stock</span>
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
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">Edit <ChevronRight className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      );})}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Categories */}
          {activeTab === 'Categories' && (
            <>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
                  <p className="text-slate-600 mt-1">Organize your products</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoriesWithCount.map((cat) => (
                  <div key={cat.name} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 transition-colors">
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
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Stock Management</h1>
                <p className="text-slate-600 mt-1">Receive stock and make adjustments</p>
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
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-600 mt-1">Insights and analytics</p>
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
        }}
        onSave={handleSaveProduct}
        categories={categories}
        prefilled={addModalPrefilled}
      />
    </div>
  );
}
