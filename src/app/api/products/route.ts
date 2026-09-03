import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getLocalProducts } from '@/lib/local-products';

const querySchema = z.object({ q: z.string().optional(), category: z.string().optional(), page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(48).default(24) });

export async function GET(request: Request) {
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid filters' }, { status: 400 });
  const { q, category, page, pageSize } = parsed.data;
  if (!process.env.DATABASE_URL) {
    const all = getLocalProducts().filter((product) => (!q || `${product.name} ${product.description}`.toLowerCase().includes(q.toLowerCase())) && (!category || product.category.toLowerCase() === category.toLowerCase()));
    return NextResponse.json({ products: all.slice((page - 1) * pageSize, page * pageSize), total: all.length, page, pageSize });
  }
  const where = { active: true, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' as const } }, { description: { contains: q, mode: 'insensitive' as const } }] } : {}), ...(category ? { category: { slug: category } } : {}) };
  const [products, total] = await Promise.all([prisma.product.findMany({ where, include: { category: true, images: { orderBy: { sortOrder: 'asc' } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), prisma.product.count({ where })]);
  return NextResponse.json({ products: products.map((product) => ({ id: product.id, name: product.name, slug: product.slug, price: product.price, salePrice: product.salePrice ?? undefined, stock: product.stock, category: product.category.name, image: product.images[0]?.url ?? '', featured: product.featured, bestSeller: product.bestSeller, description: product.description, sku: product.sku })), total, page, pageSize });
}
