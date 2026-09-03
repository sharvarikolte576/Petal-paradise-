'use client';

import Image from 'next/image';
import { useEffect, useState, type FormEvent } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { products as catalogProducts } from '@/lib/catalog';

type ProductStatus = 'Delivered' | 'Processing' | 'Out of stock';
type ProductRow = (typeof catalogProducts)[number] & { status: ProductStatus };
const initialProducts: ProductRow[] = catalogProducts.map((product) => ({ ...product, status: product.stock ? 'Processing' : 'Out of stock' }));

export default function AdminProducts() {
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products').then((response) => response.ok ? response.json() : Promise.reject(new Error())).then(({ products: databaseProducts }) => setProducts(databaseProducts.map((product: typeof catalogProducts[number]) => ({ ...product, status: product.stock ? 'Processing' : 'Out of stock' })))).catch(() => setError('Unable to load the latest products'));
  }, []);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/products', { method: 'POST', body: new FormData(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to create product');
      form.reset();
      setShow(false);
      window.location.reload();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create product');
    } finally { setSaving(false); }
  }

  async function saveStatus(product: ProductRow, status: ProductStatus) {
    setSaving(true); setError('');
    const stock = status === 'Out of stock' ? 0 : product.stock || 1;
    try {
      if (product.id.length > 20) {
        const response = await fetch(`/api/admin/inventory/${product.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'set', amount: stock, reason: `Status changed to ${status}` }) });
        if (!response.ok) throw new Error('Unable to save product status');
      }
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, status, stock } : item));
      setEditingId(null);
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save product status'); }
    finally { setSaving(false); }
  }

  async function deleteProduct(product: ProductRow) {
    if (!window.confirm(`Delete ${product.name}?`)) return;
    setSaving(true); setError('');
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Unable to delete product');
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete product'); }
    finally { setSaving(false); }
  }

  return <main className="p-5 md:p-10">
    <div className="flex items-end justify-between"><div><p className="label">Catalog</p><h1 className="serif mt-2 text-4xl">Products</h1><p className="mt-2 text-sm text-[#718776]">Manage what customers see in the shop.</p></div><button onClick={() => setShow(!show)} className="btn btn-dark"><Plus size={15} />New product</button></div>
    {show && <form onSubmit={createProduct} encType="multipart/form-data" className="mt-8 grid gap-4 rounded-2xl bg-white p-6 sm:grid-cols-2"><input name="name" required placeholder="Product name" className="rounded-xl border border-[#dedbd1] p-3" /><input name="sku" required placeholder="SKU" className="rounded-xl border border-[#dedbd1] p-3" /><input name="price" required min="0" type="number" placeholder="Price (INR)" className="rounded-xl border border-[#dedbd1] p-3" /><input name="stock" required min="0" type="number" placeholder="Stock quantity" className="rounded-xl border border-[#dedbd1] p-3" /><select name="categoryName" required defaultValue="" className="rounded-xl border border-[#dedbd1] p-3"><option value="" disabled>Choose category</option><option>Roses</option><option>Bouquets</option><option>Seasonal</option><option>Plants</option><option>Gifts</option></select><input name="image" type="file" accept="image/*" aria-label="Flower image" className="rounded-xl border border-[#dedbd1] p-3 file:mr-3 file:border-0 file:bg-transparent file:font-bold" /><input name="categoryOverride" placeholder="Or enter a new category" className="rounded-xl border border-[#dedbd1] p-3 sm:col-span-2" /><textarea name="description" required placeholder="Description" className="min-h-24 rounded-xl border border-[#dedbd1] p-3 sm:col-span-2" /><button disabled={saving} className="btn btn-dark sm:col-span-2 disabled:opacity-60">{saving ? 'Saving...' : 'Save product'}</button></form>}
    <div className="mt-8 rounded-2xl bg-white p-6"><div className="flex items-center gap-2 rounded-xl border border-[#dedbd1] px-4 py-3 md:w-80"><Search size={16} className="text-[#718776]" /><input placeholder="Search catalog" className="w-full bg-transparent text-sm outline-none" /></div>{error && <p className="mt-4 text-sm text-[#b65f56]">{error}</p>}<div className="mt-6 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-[#718776]"><tr><th className="pb-4">Image</th><th className="pb-4">Product</th><th className="pb-4">Category</th><th className="pb-4">Price</th><th className="pb-4">Stock</th><th className="pb-4">Status</th><th /></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-t border-[#eeeae1]"><td className="py-4"><Image src={product.image} alt="" width={48} height={48} className="h-12 w-12 rounded-lg object-cover" /></td><td className="font-bold">{product.name}</td><td>{product.category}</td><td>₹{(product.salePrice ?? product.price).toLocaleString('en-IN')}</td><td>{product.stock}</td><td><span className={`rounded-full px-3 py-1 text-xs ${product.status === 'Out of stock' ? 'bg-[#f3d6d0]' : 'bg-[#e5e7d9]'}`}>{product.status}</span></td><td><button type="button" aria-label={`Edit status for ${product.name}`} onClick={() => setEditingId(editingId === product.id ? null : product.id)} className="mr-3"><Edit3 size={15} /></button><button type="button" aria-label={`Delete ${product.name}`} disabled={saving} onClick={() => deleteProduct(product)} className="text-[#c77b70] disabled:opacity-50"><Trash2 size={15} /></button>{editingId === product.id && <div className="mt-3 flex min-w-44 flex-col gap-2 rounded-xl border border-[#dedbd1] bg-[#f8f5ee] p-3"><span className="text-xs font-bold">Change status</span>{(['Delivered', 'Processing', 'Out of stock'] as ProductStatus[]).map((status) => <button key={status} type="button" disabled={saving} onClick={() => saveStatus(product, status)} className="rounded-lg border border-[#dedbd1] px-3 py-2 text-left text-xs hover:bg-white disabled:opacity-50">{status}</button>)}</div>}</td></tr>)}</tbody></table></div></div>
  </main>;
}
