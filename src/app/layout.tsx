import "./globals.css";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";


export const metadata = {
  title: "sonic-app",
  description: "Menaxhimi i garazhit",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body className="bg-gray-50">
        <div className="min-h-screen">
          <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4">
            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 md:block">
              <div className="sticky top-4 space-y-3">
                <div className="rounded-xl border bg-white p-4">
                 <div className="flex items-center gap-3">
  <img
    src="/logo.png"
    alt="Sonic Garage"
    className="h-10 w-10 rounded-lg object-contain border"
  />
  <div>
    <div className="font-semibold leading-tight">sonic-app</div>
    <div className="text-xs text-gray-600">Shqip • EUR</div>
  </div>
</div>
                </div>

                <nav className="rounded-xl border bg-white p-2 text-sm text-gray-900">
                  <NavItem href="/" label="Dashboard" />
                  <NavItem href="/kliente" label="Klientë" />
                  <NavItem href="/automjete" label="Automjete" />
                  <NavItem href="/servise" label="Servise" />
                   <NavItem href="/inspekt" label="Inspekt" />
                    <NavItem href="/inspekt/kategori" label="Inspekt Kategori" />
                  <NavItem href="/faktura" label="Faktura" />
                  <NavItem href="/shpenzime" label="Shpenzime" />
                  <NavItem href="/inventar" label="Inventar" />
                  <NavItem href="/furnizues" label="Furnizues" />
                  <NavItem href="/raporte" label="Raporte Mujore" />
                  <NavItem href="/raporte/ditore" label="Raporte Ditore" />

                </nav>

                <form action="/api/auth/logout" method="post" className="rounded-xl border bg-white p-2">
                  <button  className="w-full rounded-lg bg-black px-3 py-2 text-sm text-white">
                    Dil
                  </button>
                </form>
              </div>
            </aside>

            {/* Mobile top bar */}
            <main className="w-full">
              <div className="mb-4 flex items-center justify-between rounded-xl border bg-white p-3 md:hidden">
                <Link className="font-semibold text-gray-900" href="/dashboard">
                  sonic-app
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button className="rounded-lg bg-black px-3 py-2 text-sm text-white">
                    Dil
                    </button>
                </form>
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm text-gray-900">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded-lg px-3 py-2 hover:bg-gray-50">
      {label}
    </Link>
  );
}
