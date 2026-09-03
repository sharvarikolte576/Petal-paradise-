import { products as seedProducts, type Product } from './catalog';

const globalStore = globalThis as typeof globalThis & { localProducts?: Product[] };

export function getLocalProducts() {
  globalStore.localProducts ??= [...seedProducts];
  return globalStore.localProducts;
}

export function addLocalProduct(product: Product) {
  getLocalProducts().unshift(product);
}

export function removeLocalProduct(id: string) {
  const products = getLocalProducts();
  const index = products.findIndex((product) => product.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}
