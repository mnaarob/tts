import React, { useState, useEffect, useRef } from 'react';
import { X, ScanLine, Loader2 } from 'lucide-react';
import type { LookupResult } from '../hooks/useBarcodeLookup';
import { parseIsPublished } from '../lib/isPublished';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { isValidBarcode, sanitizeBarcode } from '../lib/sanitize';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

type Category = { id: string; name: string };

export type ProductFormData = {
  name: string;
  sku: string;
  barcode: string;
  price: number;
  quantity: number;
  category_id: string | null;
  image_url: string | null;
  is_published: boolean;
  best_before_date: string | null;
  expiry_warning_days: number;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData) => Promise<void>;
  categories: Category[];
  prefilled?: LookupResult & { barcode: string };
  /** True while the parent's external product lookup is still in flight. */
  prefilledLoading?: boolean;
  productId?: string;
  initialData?: Partial<ProductFormData> & { id: string };
  /** Owner/manager only: show "Show on website" and control is_published */
  allowWebsitePublish?: boolean;
  /** Owner/manager only: show delete when editing */
  allowDelete?: boolean;
  onDelete?: () => Promise<void>;
};

/** Window during which a second tap on Delete actually performs the delete. */
const CONFIRM_DELETE_TIMEOUT_MS = 4000;

export function AddProductModal({
  isOpen,
  onClose,
  onSave,
  categories,
  prefilled,
  prefilledLoading = false,
  productId,
  initialData,
  allowWebsitePublish = false,
  allowDelete = false,
  onDelete,
}: Props) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [bestBeforeDate, setBestBeforeDate] = useState('');
  const [expiryWarningDays, setExpiryWarningDays] = useState('7');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  /** Two-step inline delete confirmation; replaces window.confirm. */
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const deleteConfirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Tracks the previous `isOpen` so we can distinguish "modal just opened"
   * from "prefilled patched mid-modal by a background lookup". */
  const prevIsOpenRef = useRef(false);

  // Lock background scroll on iOS so the page can't rubber-band while the
  // modal is open and the keyboard is up.
  useBodyScrollLock(isOpen);

  const isEdit = !!productId;

  // Full reset on each open transition (closed → open).
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!justOpened) return;

    if (initialData) {
      setName(initialData.name ?? '');
      setSku(initialData.sku ?? '');
      setBarcode(initialData.barcode ?? '');
      setPrice(String(initialData.price ?? ''));
      setQuantity(String(initialData.quantity ?? '1'));
      setCategoryId(initialData.category_id ?? '');
      setIsPublished(parseIsPublished(initialData.is_published));
      setBestBeforeDate(initialData.best_before_date ?? '');
      setExpiryWarningDays(String(initialData.expiry_warning_days ?? 7));
    } else if (prefilled) {
      setName(prefilled.name ?? '');
      setBarcode(prefilled.barcode);
      setSku(prefilled.barcode);
      setPrice('');
      setQuantity('1');
      setCategoryId('');
      setIsPublished(false);
      setBestBeforeDate('');
      setExpiryWarningDays('7');
    } else {
      setName('');
      setSku('');
      setBarcode('');
      setPrice('');
      setQuantity('1');
      setCategoryId('');
      setIsPublished(false);
      setBestBeforeDate('');
      setExpiryWarningDays('7');
    }
    setError('');
  }, [prefilled, initialData, isOpen]);

  // Mid-modal patch: when the parent's background OpenFoodFacts lookup
  // resolves while the modal is already open, fill in fields the user
  // hasn't touched. This is what makes the "scan-to-add" feel instant —
  // the modal opens immediately with just the barcode, then auto-fills
  // the name/SKU once the API responds.
  useEffect(() => {
    if (!isOpen || !prefilled || initialData) return;
    setName((current) => (current.trim() ? current : (prefilled.name ?? '')));
    setBarcode((current) => (current.trim() ? current : prefilled.barcode));
    setSku((current) => (current.trim() ? current : prefilled.barcode));
  }, [prefilled, isOpen, initialData]);

  // Reset the two-step delete state whenever the modal opens or closes, and
  // clear any outstanding confirmation timer on unmount.
  useEffect(() => {
    setDeleteConfirming(false);
    if (deleteConfirmTimeoutRef.current) {
      clearTimeout(deleteConfirmTimeoutRef.current);
      deleteConfirmTimeoutRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (deleteConfirmTimeoutRef.current) {
        clearTimeout(deleteConfirmTimeoutRef.current);
      }
    };
  }, []);

  function resolvedImageUrl(): string | null {
    if (isEdit && initialData) {
      const v = initialData.image_url;
      return v && String(v).trim() !== '' ? v : null;
    }
    return null;
  }

  function resolvedIsPublished(): boolean {
    if (allowWebsitePublish) {
      return isPublished;
    }
    if (isEdit && initialData) {
      return parseIsPublished(initialData.is_published);
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Enter a valid price');
      return;
    }
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      setError('Enter a valid quantity');
      return;
    }
    const warningDays = parseInt(expiryWarningDays, 10);
    if (isNaN(warningDays) || warningDays < 1 || warningDays > 90) {
      setError('Warning days must be between 1 and 90');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim() || barcode.trim(),
        barcode: barcode.trim() || sku.trim(),
        price: priceNum,
        quantity: qtyNum,
        category_id: categoryId || null,
        image_url: resolvedImageUrl(),
        is_published: resolvedIsPublished(),
        best_before_date: bestBeforeDate.trim() || null,
        expiry_warning_days: warningDays,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function handleScannedBarcode(raw: string) {
    const code = sanitizeBarcode(raw);
    if (!code) {
      setError('Scanned value is not a valid barcode.');
      return;
    }
    const previousBarcode = barcode.trim();
    setBarcode(code);
    // If SKU was empty or auto-mirrored the previous barcode, keep it in sync.
    const trimmedSku = sku.trim();
    if (trimmedSku === '' || trimmedSku === previousBarcode) {
      setSku(code);
    }
    setError('');
  }

  // First tap on "Delete product" — arms an inline confirmation. After this,
  // the single button is replaced by [Cancel] [Yes, permanently delete], so
  // the destructive action lives on a *different* DOM element. This avoids a
  // mobile-Safari bug where two fast taps on the same button could land in
  // the same React batch and both observe a stale `deleteConfirming === false`,
  // re-arming the timer instead of deleting.
  function armDelete() {
    if (!onDelete || !isEdit) return;
    setDeleteConfirming(true);
    if (deleteConfirmTimeoutRef.current) {
      clearTimeout(deleteConfirmTimeoutRef.current);
    }
    deleteConfirmTimeoutRef.current = setTimeout(() => {
      setDeleteConfirming(false);
      deleteConfirmTimeoutRef.current = null;
    }, CONFIRM_DELETE_TIMEOUT_MS);
  }

  function cancelDelete() {
    if (deleteConfirmTimeoutRef.current) {
      clearTimeout(deleteConfirmTimeoutRef.current);
      deleteConfirmTimeoutRef.current = null;
    }
    setDeleteConfirming(false);
  }

  async function confirmDelete() {
    if (!onDelete || !isEdit) return;
    if (deleteConfirmTimeoutRef.current) {
      clearTimeout(deleteConfirmTimeoutRef.current);
      deleteConfirmTimeoutRef.current = null;
    }
    setDeleteConfirming(false);
    setDeleting(true);
    setError('');
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  }

  if (!isOpen) return null;

  const formId = 'add-product-form';
  const showLookupHint = !isEdit && prefilledLoading && !name.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="
          relative flex w-full sm:max-w-lg flex-col bg-white shadow-xl
          rounded-t-2xl sm:rounded-2xl
          max-h-[100dvh] sm:max-h-[calc(100dvh-2rem)]
          h-[100dvh] sm:h-auto
        "
      >
        {/* Sticky header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Edit product' : prefilled ? 'Add product from scan' : 'Add product'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <label className="block text-sm font-medium text-slate-700">Product name *</label>
              {showLookupHint && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Looking up product…
                </span>
              )}
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder={showLookupHint ? 'Looking up…' : 'e.g. Organic Milk 2%'}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">Barcode / UPC</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onBlur={() => {
                    if (barcode && !isValidBarcode(barcode)) {
                      setError('Barcode must be 6–32 letters, digits, or dashes.');
                    } else if (error.startsWith('Barcode must be')) {
                      setError('');
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 pl-4 pr-14 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Scan or type"
                  maxLength={32}
                />
                <button
                  type="button"
                  onClick={() => setScannerOpen(true)}
                  className="absolute inset-y-0 right-0 my-0.5 mr-0.5 inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  aria-label="Scan barcode"
                  title="Scan barcode"
                >
                  <ScanLine className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">Best before date</label>
              <input
                type="date"
                value={bestBeforeDate}
                onChange={(e) => setBestBeforeDate(e.target.value)}
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 sm:px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium text-slate-700">
                Expiry warning (days before)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={expiryWarningDays}
                onChange={(e) => setExpiryWarningDays(e.target.value)}
                className="mt-1 w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2.5 sm:px-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="7"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {allowWebsitePublish && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="published" className="text-sm text-slate-700">
                Show on website
              </label>
            </div>
          )}

          {allowDelete && isEdit && onDelete && (
            <div className="pt-2 border-t border-slate-200">
              {!deleteConfirming ? (
                <button
                  type="button"
                  onClick={armDelete}
                  disabled={deleting || saving}
                  className="w-full rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2.5 text-sm font-medium disabled:opacity-50 min-h-[44px] touch-manipulation transition-colors"
                >
                  {deleting ? 'Deleting…' : 'Delete product'}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-red-600 text-center">
                    This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      disabled={deleting || saving}
                      className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 text-sm font-medium disabled:opacity-50 min-h-[44px] touch-manipulation transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmDelete()}
                      disabled={deleting || saving}
                      className="flex-1 rounded-lg border border-red-600 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 min-h-[44px] touch-manipulation transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      {deleting ? 'Deleting…' : 'Yes, permanently delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Sticky footer (always reachable, even when the soft keyboard is up) */}
        <div
          className="
            flex-shrink-0 border-t border-slate-200 bg-white
            px-4 sm:px-6 py-3
            pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)]
          "
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-slate-700 hover:bg-slate-50 min-h-[44px] touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={formId}
              disabled={saving || deleting}
              className="flex-1 rounded-lg bg-emerald-500 px-4 py-2.5 font-medium text-white hover:bg-emerald-600 disabled:opacity-50 min-h-[44px] touch-manipulation"
            >
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </div>
      </div>

      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScannedBarcode}
      />
    </div>
  );
}
