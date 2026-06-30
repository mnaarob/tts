import {
  X,
  Package,
  Tag,
  Barcode,
  FolderTree,
  DollarSign,
  Layers,
  CalendarClock,
  AlertTriangle,
  Globe,
  Edit3,
  PackagePlus,
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export type ScannedProductInfo = {
  id?: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  price?: number | null;
  quantity?: number | null;
  low_stock_threshold?: number | null;
  is_published?: boolean | null;
  category_name?: string | null;
  image_url?: string | null;
  best_before_date?: string | null;
  expiry_warning_days?: number | null;
  /** Optional brand returned by external API lookup */
  brand?: string | null;
};

type Props = {
  isOpen: boolean;
  /** When false, this is an "API lookup" preview for a product not yet in inventory. */
  inInventory: boolean;
  product: ScannedProductInfo | null;
  scannedBarcode?: string | null;
  onClose: () => void;
  /** Edit existing product (only when inInventory). */
  onEdit?: () => void;
  /** Add to inventory (only when not inInventory). */
  onAddToInventory?: () => void;
};

function formatExpiry(dateStr?: string | null, warningDays?: number | null) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bestBefore = new Date(dateStr);
  bestBefore.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil(
    (bestBefore.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  const warn = warningDays ?? 7;
  const formatted = bestBefore.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  if (daysLeft < 0) {
    return {
      label: 'Expired',
      sub: `${formatted} · ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`,
      className: 'bg-red-100 text-red-800 border-red-200',
    };
  }
  if (daysLeft <= warn) {
    return {
      label: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`,
      sub: formatted,
      className: 'bg-amber-100 text-amber-800 border-amber-200',
    };
  }
  return {
    label: `Best before ${formatted}`,
    sub: `${daysLeft} days left`,
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
}

export function ScannedProductCard({
  isOpen,
  inInventory,
  product,
  scannedBarcode,
  onClose,
  onEdit,
  onAddToInventory,
}: Props) {
  useBodyScrollLock(isOpen && !!product);
  if (!isOpen || !product) return null;

  const isLowStock =
    typeof product.quantity === 'number' &&
    product.quantity <= (product.low_stock_threshold ?? 5);
  const expiry = formatExpiry(product.best_before_date, product.expiry_warning_days);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200/80 max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200/80 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Package className="w-4 h-4 text-blue-600" />
            {inInventory ? 'Scanned Product' : 'Product Found'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-200 bg-slate-50"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-slate-900 leading-tight break-words">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-sm text-slate-500 mt-0.5">{product.brand}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mt-2">
                {!inInventory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    Not in inventory
                  </span>
                )}
                {inInventory && product.is_published != null && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.is_published
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    {product.is_published ? 'Published' : 'Draft'}
                  </span>
                )}
                {isLowStock && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-3 h-3" />
                    Low stock
                  </span>
                )}
                {expiry && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${expiry.className}`}
                  >
                    <CalendarClock className="w-3 h-3" />
                    {expiry.label}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Detail grid */}
          <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {typeof product.price === 'number' && (
              <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Price">
                <span className="text-slate-900 font-semibold">
                  ${Number(product.price).toFixed(2)}
                </span>
              </DetailRow>
            )}
            {typeof product.quantity === 'number' && (
              <DetailRow icon={<Layers className="w-4 h-4" />} label="Quantity">
                <span
                  className={`font-semibold ${
                    isLowStock ? 'text-amber-700' : 'text-slate-900'
                  }`}
                >
                  {product.quantity}
                </span>
                {typeof product.low_stock_threshold === 'number' && (
                  <span className="text-slate-400 text-xs ml-1">
                    (reorder ≤ {product.low_stock_threshold})
                  </span>
                )}
              </DetailRow>
            )}
            {product.category_name && (
              <DetailRow icon={<FolderTree className="w-4 h-4" />} label="Category">
                {product.category_name}
              </DetailRow>
            )}
            {product.sku && (
              <DetailRow icon={<Tag className="w-4 h-4" />} label="SKU">
                <span className="font-mono text-xs">{product.sku}</span>
              </DetailRow>
            )}
            <DetailRow icon={<Barcode className="w-4 h-4" />} label="Barcode">
              <span className="font-mono text-xs">
                {product.barcode || scannedBarcode || '—'}
              </span>
            </DetailRow>
            {expiry && (
              <DetailRow icon={<CalendarClock className="w-4 h-4" />} label="Best before">
                <span className="text-slate-900">{expiry.sub}</span>
              </DetailRow>
            )}
          </dl>
        </div>

        {/* Footer actions — sticky, with safe-area-inset-bottom so the buttons
            stay above the iOS home gesture bar / soft keyboard on phones. */}
        <div className="flex-shrink-0 px-5 py-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] border-t border-slate-200/80 bg-slate-50/60 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 min-h-[44px] touch-manipulation"
          >
            Close
          </button>
          {inInventory && onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 min-h-[44px] shadow-sm touch-manipulation"
            >
              <Edit3 className="w-4 h-4" />
              Edit Product
            </button>
          )}
          {!inInventory && onAddToInventory && (
            <button
              type="button"
              onClick={onAddToInventory}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 min-h-[44px] shadow-sm touch-manipulation"
            >
              <PackagePlus className="w-4 h-4" />
              Add to Inventory
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-slate-500 font-medium">
          {label}
        </dt>
        <dd className="text-sm text-slate-800 mt-0.5 break-words">{children}</dd>
      </div>
    </div>
  );
}
