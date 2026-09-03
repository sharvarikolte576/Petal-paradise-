import type {Product} from '@/lib/catalog';

export type CartItem = {product:Product; quantity:number};

const storageKey = 'petal-paradise-cart';

export function readCart():CartItem[]{
  if(typeof window==='undefined') return [];
  try{
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as CartItem[] : [];
  }catch{
    return [];
  }
}

export function writeCart(items:CartItem[]){
  window.localStorage.setItem(storageKey,JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function addToCart(product:Product){
  const items = readCart();
  const existing = items.find(item=>item.product.id===product.id);
  if(existing) existing.quantity = Math.min(existing.quantity+1,product.stock);
  else items.push({product,quantity:1});
  writeCart(items);
}

export function removeFromCart(productId:string){
  writeCart(readCart().filter(item=>item.product.id!==productId));
}

export function updateCartQuantity(productId:string,quantity:number){
  const items = readCart().map(item=>item.product.id===productId?{...item,quantity}:item);
  writeCart(items.filter(item=>item.quantity>0));
}