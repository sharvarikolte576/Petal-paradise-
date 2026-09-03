import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';
import { addLocalProduct, removeLocalProduct } from '@/lib/local-products';
import { products as seedProducts } from '@/lib/catalog';

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = String(formData.get('name') ?? '').trim();
    const sku = String(formData.get('sku') ?? '').trim();
    const categoryName = String(formData.get('categoryOverride') || formData.get('categoryName') || '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const price = Number(formData.get('price'));
    const stock = Number(formData.get('stock'));
    const image = formData.get('image');
    if (!name || !sku || !categoryName || !description || !Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return NextResponse.json({ error: 'Complete all product fields with valid values.' }, { status: 400 });
    if (image instanceof File && image.size > 0 && !image.type.startsWith('image/')) return NextResponse.json({ error: 'The uploaded file must be an image.' }, { status: 400 });
    const slug = `${slugify(name)}-${Date.now()}`;
    let imageUrl = '';
    if (image instanceof File && image.size > 0) {
      const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}-${slugify(name)}.${extension}`;
      await mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
      await writeFile(path.join(process.cwd(), 'public', 'uploads', fileName), Buffer.from(await image.arrayBuffer()));
      imageUrl = `/uploads/${fileName}`;
    }
    if (!process.env.DATABASE_URL) {
      const product = { id: `local-${Date.now()}`, name, slug, price, stock, category: categoryName, image: imageUrl || seedProducts[0].image, featured: false, bestSeller: false, description, sku };
      addLocalProduct(product);
      return NextResponse.json({ product }, { status: 201 });
    }
    const categorySlug = slugify(categoryName);
    const product = await prisma.$transaction(async (transaction) => {
      const category = await transaction.category.upsert({ where: { slug: categorySlug }, update: {}, create: { name: categoryName, slug: categorySlug } });
      return transaction.product.create({ data: { name, slug, sku, price, stock, description, shortDescription: description, categoryId: category.id, ...(imageUrl ? { images: { create: { url: imageUrl, altText: name } } } : {}) }, include: { category: true, images: true } });
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Unable to create product', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') return NextResponse.json({ error: 'A product with this SKU already exists. Please enter a different SKU.' }, { status: 409 });
    return NextResponse.json({ error: 'Unable to create product. Check your product details and try again.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });
  try {
    if (!process.env.DATABASE_URL) {
      if (!removeLocalProduct(id)) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    } else {
      await prisma.product.delete({ where: { id } });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Unable to delete product', error);
    return NextResponse.json({ error: 'Unable to delete product.' }, { status: 500 });
  }
}
