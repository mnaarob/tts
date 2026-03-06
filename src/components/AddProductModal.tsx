import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { LookupResult } from '../hooks/useBarcodeLookup';

type Category = { id: string; name: string };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: {
    name: string;
    sku: string;
    barcode: string;
    price: number;
    quantity: number;
    category_id: string | null;
    image_url: string | null;
    is_published: boolean;
  }) => Promise<void>;
  categories: Category[];
  prefilled?: LookupResult & { barcode: string };
};

export function AddProductModal({
  isOpen,
  onClose,
  onSave,
  categories,
  prefilled,
}: Props) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (prefilled) {
      setName(prefilled.name);
      setBarcode(prefilled.barcode);
      setSku(prefilled.barcode);
      if (prefilled.imageUrl) setImageUrl(prefilled.imageUrl);
    } else {
      setName('');
      setSku('');
      setBarcode('');
      setImageUrl('');
    }
    setPrice('');
    setQuantity('1');
    setCategoryId('');
    setIsPublished(false);
    setError('');
  }, [prefilled, isOpen]);

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

    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        sku: sku.trim() || barcode.trim(),
        barcode: barcode.trim() || sku.trim(),
        price: priceNum,
        quantity: qtyNum,
        category_id: categoryId || null,
        image_url: imageUrl.trim() || null,
        is_published: isPublished,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {prefilled ? 'Add product from scan' : 'Add product'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700">Product name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Organic Milk 2%"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Barcode / UPC</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="From scan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">SKU</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Price *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Quantity *</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 h-20 w-20 rounded-lg object-cover"
                onError={() => setImageUrl('')}
              />
            )}
          </div>

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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
