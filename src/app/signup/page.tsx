'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/deals')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="text-[#5e6ad2] font-semibold text-sm tracking-wider uppercase mb-1">Creator Deal Hub</div>
          <h1 className="text-[#e2e2e2] text-2xl font-semibold">Create account</h1>
          <p className="text-[#8b8d97] text-sm mt-1">Start tracking your brand deals</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-[#8b8d97] text-xs font-medium mb-1.5 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full bg-[#111113] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#5e6ad2] transition-colors placeholder-[#4e5058]"
              placeholder="Your name"
            />
          </div>
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
              minLength={6}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-[#8b8d97] text-sm mt-6 text-center">
          Have an account?{' '}
          <Link href="/login" className="text-[#5e6ad2] hover:text-[#6e7ae2] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
