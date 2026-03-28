import Sidebar from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen bg-[#0a0a0b]">
      <Sidebar />
      <main className="flex-1 ml-[220px] min-w-0">
        {children}
      </main>
    </div>
  )
}
