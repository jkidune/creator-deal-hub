'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, Bell, Briefcase, FolderKanban, LogOut } from 'lucide-react'

const nav = [
  { href: '/deals', label: 'Deal Pipeline', icon: BarChart2 },
  { href: '/partnerships', label: 'Partnerships', icon: Briefcase },
  { href: '/alerts', label: 'Alerts & Money', icon: Bell },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#111113] border-r border-[rgba(255,255,255,0.06)] flex flex-col z-50">
      <div className="px-4 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="text-[#e2e2e2] font-semibold text-sm">Creator Deal Hub</div>
        <div className="text-[#4e5058] text-xs mt-0.5">Brand deal management</div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <div className="text-[#4e5058] text-[10px] font-semibold uppercase tracking-wider px-2 py-2">Workspace</div>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-sm transition-colors ${
                active
                  ? 'bg-[rgba(94,106,210,0.12)] text-[#e2e2e2]'
                  : 'text-[#8b8d97] hover:bg-[#16161a] hover:text-[#e2e2e2]'
              }`}
            >
              <Icon size={15} className={active ? 'text-[#5e6ad2]' : 'text-[#4e5058]'} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded text-sm text-[#8b8d97] hover:bg-[#16161a] hover:text-[#e2e2e2] transition-colors w-full"
        >
          <LogOut size={15} className="text-[#4e5058]" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
