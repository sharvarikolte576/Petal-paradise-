# Petal Paradise A Online Flower Shop

A full-stack flower farm shop built with Next.js, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. The public storefront and admin dashboard share the same relational product, inventory, order, and settings model.

## Run locally

Install Node.js 20+, PostgreSQL, and npm, then:

```bash
npm install
copy .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Development admin: `admin@meadowandstem.com` / `ChangeMe123!`. Change it before production.

## Production services

Set `DATABASE_URL` and `AUTH_SECRET`. Razorpay, Cloudinary, and Resend are intentionally environment-backed: add their credentials to `.env` and connect their SDKs in `src/lib/integrations`. Never expose provider secrets to client components.

## Architecture

Prisma owns PostgreSQL persistence. Server routes must validate request bodies with Zod, calculate totals from database prices, and update stock inside transactions. Admin routes require the authenticated ADMIN role. Product images are stored as URLs so uploads can be managed from the dashboard rather than source code.

## Deployment

Deploy to Vercel or another Node host, use managed PostgreSQL, run `prisma migrate deploy`, configure all environment variables, and rotate the seeded admin password. Add a real Razorpay webhook endpoint before accepting production payments.
