'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/deals')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-[#5e6ad2] font-semibold text-sm tracking-wider uppercase mb-1">Creator Deal Hub</div>
          <h1 className="text-[#e2e2e2] text-2xl font-semibold">Sign in</h1>
          <p className="text-[#8b8d97] text-sm mt-1">Manage your brand deals in one place</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[#8b8d97] text-xs font-medium mb-1.5 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-[#111113] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#5e6ad2] transition-colors placeholder-[#4e5058]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-[#8b8d97] text-xs font-medium mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-[#111113] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#5e6ad2] transition-colors placeholder-[#4e5058]"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-[#e05252] text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white font-medium py-2.5 rounded-md text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-[#8b8d97] text-sm mt-6 text-center">
          No account?{' '}
          <Link href="/signup" className="text-[#5e6ad2] hover:text-[#6e7ae2] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
