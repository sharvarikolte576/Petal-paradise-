import './globals.css';
import { ShoppingBag, UserRound } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Petal Paradise A Online Flower Shop | Flowers grown with love',
  description: 'Farm-fresh flowers, plants and considered gifts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-[#dedbd1] bg-[#f8f5ee]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
            <Link href="/" className="serif text-2xl">Petal Paradie</Link>
            <nav className="hidden gap-8 text-sm md:flex">
              <Link href="/shop">Shop flowers</Link>
              <Link href="/#story">Our farm</Link>
              <Link href="/#journal">Journal</Link>
              <Link href="/admin">Admin</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/admin/login" aria-label="Account"><UserRound size={18}/></Link>
              <Link href="/cart" aria-label="Shopping cart"><ShoppingBag size={19}/></Link>
            </div>
          </div>
        </header>
        {children}
        <footer className="mt-24 bg-[#23352c] px-5 py-14 text-[#f8f5ee]">
          <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div>
              <div className="serif text-3xl">Petal Paradie</div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#c9d1c8]">Flowers grown slowly, gathered thoughtfully, and sent with a little more joy than necessary.</p>
            </div>
            <div><div className="label text-[#c9d1c8]">Shop</div><div className="mt-4 space-y-3 text-sm text-[#eef0e9]"><Link className="block" href="/shop">Fresh flowers</Link><Link className="block" href="/shop?category=Plants">Plants</Link><Link className="block" href="/shop?category=Gifts">Gifts</Link></div></div>
            <div><div className="label text-[#c9d1c8]">Help</div><div className="mt-4 space-y-3 text-sm text-[#eef0e9]"><div>Delivery & returns</div><div>Care guide</div><div>Contact us</div></div></div>
            <div><div className="label text-[#c9d1c8]">Visit</div><p className="mt-4 text-sm leading-6 text-[#eef0e9]">Open fields, Saturdays<br/>8:00 am - 5:00 pm<br/>Pune, Maharashtra</p></div>
          </div>
          <div className="mx-auto mt-12 max-w-7xl border-t border-white/20 pt-5 text-xs text-[#c9d1c8]">© 2026 Petal Paradie. Grown with love.</div>
        </footer>
      </body>
    </html>
  );
}