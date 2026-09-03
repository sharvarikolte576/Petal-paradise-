import { prisma } from './prisma';
import { products as preview, type Product } from './catalog';
import { getLocalProducts } from './local-products';

export async function getProducts(): Promise<Product[]> {
  if (!process.env.DATABASE_URL) return getLocalProducts();
  try {
    const rows = await prisma.product.findMany({ where: { active: true }, include: { category: true, images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { createdAt: 'desc' } });
    if (!rows.length) return preview;
    return rows.map((product) => ({ id: product.id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice ?? undefined, stock: product.stock, category: product.category.name, image: product.images[0]?.url ?? preview[0].image, featured: product.featured, bestSeller: product.bestSeller, description: product.description, sku: product.sku }));
  } catch { return preview; }
}

export async function getProduct(slug: string) {
  return (await getProducts()).find((product) => product.slug === slug);
}
