'use client'
import { useState, useTransition, Fragment } from 'react'
import { createDeal, updateDeal, deleteDeal } from '@/app/actions/deals'
import { Plus, Download, ChevronDown, ChevronRight, Check, X, Trash2 } from 'lucide-react'

type DealStatus = 'FILMING' | 'POST_NOW' | 'SIGNED' | 'PENDING' | 'NEGOTIATING' | 'BRIEF' | 'PREPROD' | 'WAITING' | 'NO_RESPONSE' | 'STALLED' | 'PASSED'
type DealSection = 'ACTIVE' | 'HOT' | 'INBOUND' | 'CLOSED'

type Deal = {
  id: string
  userId: string
  name: string
  source: string | null
  detail: string | null
  amount: string | null
  amountSub: string | null
  status: DealStatus
  section: DealSection
  conceptApproved: boolean
  depositPaid: boolean
  contentCreated: boolean
  posted: boolean
  finalPaid: boolean
  postDate: string | null
  invoiceNotes: string | null
  requirements: string | null
  action: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

const STATUS_LABELS: Record<DealStatus, string> = {
  FILMING: 'Filming',
  POST_NOW: 'Post now',
  SIGNED: 'Signed',
  PENDING: 'Pending',
  NEGOTIATING: 'Negotiating',
  BRIEF: 'Brief received',
  PREPROD: 'Pre-production',
  WAITING: 'Awaiting reply',
  NO_RESPONSE: 'No response',
  STALLED: 'Stalled',
  PASSED: 'Passed'
}

const STATUS_COLORS: Record<DealStatus, string> = {
  FILMING: 'bg-[rgba(91,156,246,0.1)] text-[#5b9cf6]',
  POST_NOW: 'bg-[rgba(232,162,58,0.1)] text-[#e8a23a]',
  SIGNED: 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]',
  PENDING: 'bg-[rgba(255,255,255,0.05)] text-[#8b8d97]',
  NEGOTIATING: 'bg-[rgba(155,127,232,0.1)] text-[#9b7fe8]',
  BRIEF: 'bg-[rgba(61,201,176,0.1)] text-[#3dc9b0]',
  PREPROD: 'bg-[rgba(91,156,246,0.1)] text-[#5b9cf6]',
  WAITING: 'bg-[rgba(232,162,58,0.1)] text-[#e8a23a]',
  NO_RESPONSE: 'bg-[rgba(224,82,82,0.08)] text-[#e07070]',
  STALLED: 'bg-[rgba(224,82,82,0.1)] text-[#e05252]',
  PASSED: 'bg-[rgba(255,255,255,0.03)] text-[#4e5058]'
}

const SECTIONS: { key: DealSection; label: string }[] = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'HOT', label: 'Hot Negotiations' },
  { key: 'INBOUND', label: 'Inbound Pipeline' },
  { key: 'CLOSED', label: 'Closed / Passed' },
]

type Filter = 'all' | 'action' | 'waiting' | 'no-response' | 'closed'

export default function DealsClient({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals)
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [newDeal, setNewDeal] = useState({
    name: '',
    amount: '',
    source: '',
    section: 'INBOUND' as DealSection,
    status: 'PENDING' as DealStatus
  })
  const [editMap, setEditMap] = useState<Record<string, Partial<Deal>>>({})
  const [pending, startTransition] = useTransition()

  const confirmedRevenue = deals
    .filter(d => ['ACTIVE', 'HOT'].includes(d.section) && ['SIGNED', 'FILMING', 'POST_NOW', 'PREPROD', 'BRIEF'].includes(d.status))
    .reduce((sum, d) => {
      const n = parseFloat((d.amount || '').replace(/[^0-9.]/g, ''))
      return sum + (isNaN(n) ? 0 : n)
    }, 0)

  const hotPipeline = deals.filter(d => d.section === 'HOT').length
  const awaitingReply = deals.filter(d => d.status === 'WAITING').length
  const noResponse = deals.filter(d => d.status === 'NO_RESPONSE').length

  function filterDeals(d: Deal): boolean {
    if (filter === 'all') return true
    if (filter === 'action') return ['FILMING', 'POST_NOW', 'BRIEF', 'PREPROD', 'PENDING'].includes(d.status)
    if (filter === 'waiting') return d.status === 'WAITING'
    if (filter === 'no-response') return d.status === 'NO_RESPONSE'
    if (filter === 'closed') return d.section === 'CLOSED'
    return true
  }

  function exportCSV() {
    const cols = ['name', 'source', 'detail', 'amount', 'status', 'section', 'postDate', 'action', 'conceptApproved', 'depositPaid', 'contentCreated', 'posted', 'finalPaid', 'notes']
    const rows = deals.map(d => cols.map(c => JSON.stringify((d as Record<string, unknown>)[c] ?? '')).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `deals-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  function setEdit(id: string, field: string, value: unknown) {
    setEditMap(m => ({ ...m, [id]: { ...m[id], [field]: value } }))
  }

  function handleSave(deal: Deal) {
    const changes = editMap[deal.id] || {}
    startTransition(async () => {
      // Strip null values — updateDeal expects Partial with string | undefined fields
      const cleanChanges = Object.fromEntries(
        Object.entries(changes).filter(([, v]) => v !== null)
      ) as Parameters<typeof updateDeal>[1]
      await updateDeal(deal.id, cleanChanges)
      setDeals(prev => prev.map(d => d.id === deal.id ? { ...d, ...changes } : d))
      setExpanded(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDeal(id)
      setDeals(prev => prev.filter(d => d.id !== id))
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createDeal(newDeal)
      setDeals(prev => [...prev, {
        ...newDeal,
        id: Date.now().toString(),
        userId: '',
        amountSub: null,
        detail: null,
        conceptApproved: false,
        depositPaid: false,
        contentCreated: false,
        posted: false,
        finalPaid: false,
        postDate: null,
        invoiceNotes: null,
        requirements: null,
        action: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Deal])
      setNewDeal({ name: '', amount: '', source: '', section: 'INBOUND', status: 'PENDING' })
      setShowNew(false)
    })
  }

  const filterLinks: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All deals' },
    { key: 'action', label: 'Needs action' },
    { key: 'waiting', label: 'Awaiting reply' },
    { key: 'no-response', label: 'No response' },
    { key: 'closed', label: 'Closed' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Filter sidebar */}
      <div className="w-[160px] min-w-[160px] border-r border-[rgba(255,255,255,0.06)] px-2 py-4 space-y-0.5">
        <div className="text-[#4e5058] text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5">Filter</div>
        {filterLinks.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors ${
              filter === f.key
                ? 'bg-[rgba(94,106,210,0.12)] text-[#e2e2e2]'
                : 'text-[#8b8d97] hover:bg-[#16161a] hover:text-[#e2e2e2]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <div className="sticky top-0 bg-[rgba(10,10,11,0.95)] backdrop-blur border-b border-[rgba(255,255,255,0.06)] px-6 py-3 flex items-center justify-between z-40">
          <div>
            <div className="text-[#e2e2e2] font-semibold">Deal Pipeline</div>
            <div className="text-[#4e5058] text-xs mt-0.5">
              {deals.length} deals · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-[#8b8d97] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.10)] hover:text-[#e2e2e2] transition-colors"
            >
              <Download size={12} /> Export CSV
            </button>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
            >
              <Plus size={12} /> New deal
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Confirmed Revenue', value: confirmedRevenue > 0 ? `$${confirmedRevenue.toLocaleString()}` : '—', color: 'text-[#4caf7d]' },
              { label: 'Hot Pipeline', value: `${hotPipeline} deals`, color: 'text-[#e8a23a]' },
              { label: 'Awaiting Reply', value: awaitingReply.toString(), color: 'text-[#5b9cf6]' },
              { label: 'No Response', value: noResponse.toString(), color: 'text-[#e05252]' },
            ].map(m => (
              <div key={m.label} className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-3.5">
                <div className="text-[#4e5058] text-[11px] uppercase tracking-wider mb-2">{m.label}</div>
                <div className={`text-2xl font-semibold ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* New deal form */}
          {showNew && (
            <div className="bg-[#111113] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 mb-4">
              <form onSubmit={handleCreate} className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Brand *</label>
                  <input
                    value={newDeal.name}
                    onChange={e => setNewDeal(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Brand name"
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs w-40 focus:outline-none focus:border-[#5e6ad2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Amount</label>
                  <input
                    value={newDeal.amount}
                    onChange={e => setNewDeal(p => ({ ...p, amount: e.target.value }))}
                    placeholder="$0"
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:border-[#5e6ad2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Source</label>
                  <input
                    value={newDeal.source}
                    onChange={e => setNewDeal(p => ({ ...p, source: e.target.value }))}
                    placeholder="Direct / agency"
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs w-36 focus:outline-none focus:border-[#5e6ad2]"
                  />
                </div>
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Section</label>
                  <select
                    value={newDeal.section}
                    onChange={e => setNewDeal(p => ({ ...p, section: e.target.value as DealSection }))}
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="HOT">Hot Negotiations</option>
                    <option value="INBOUND">Inbound</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={newDeal.status}
                    onChange={e => setNewDeal(p => ({ ...p, status: e.target.value as DealStatus }))}
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={pending}
                    className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white text-xs rounded transition-colors disabled:opacity-50"
                  >
                    Add deal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="px-3 py-1.5 text-[#8b8d97] text-xs rounded hover:bg-[#16161a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Deal sections */}
          {SECTIONS.map(section => {
            const sectionDeals = deals.filter(d => d.section === section.key && filterDeals(d))
            const showLifecycle = section.key !== 'INBOUND' && section.key !== 'CLOSED'
            return (
              <div key={section.key} className="mb-8">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                  <span className="text-[#e2e2e2] font-medium text-sm">{section.label}</span>
                  <span className="text-[#4e5058] text-[10px] font-mono bg-[#16161a] px-1.5 py-0.5 rounded">
                    {sectionDeals.length}
                  </span>
                </div>

                {sectionDeals.length === 0 ? (
                  <div className="text-[#4e5058] text-xs py-4 px-2">No deals in this section</div>
                ) : (
                  <table className="w-full border-separate border-spacing-y-1">
                    <thead>
                      <tr>
                        <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-left px-3 pb-1">Brand</th>
                        <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-left px-3 pb-1">Amount</th>
                        <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-left px-3 pb-1">Status</th>
                        {showLifecycle && (
                          <>
                            <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-center px-2 pb-1">Concept</th>
                            <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-center px-2 pb-1">Deposit</th>
                            <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-center px-2 pb-1">Content</th>
                            <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-center px-2 pb-1">Posted</th>
                            <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-center px-2 pb-1">Paid</th>
                          </>
                        )}
                        <th className="text-[#4e5058] text-[10px] uppercase tracking-wider font-medium text-left px-3 pb-1">Next action</th>
                        <th className="pb-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionDeals.map(deal => {
                        const isExpanded = expanded === deal.id
                        const edits = editMap[deal.id] || {}
                        const current = { ...deal, ...edits }
                        return (
                          <Fragment key={deal.id}>
                            <tr
                              className={`cursor-pointer ${isExpanded ? 'bg-[#16161a]' : 'bg-[#111113] hover:bg-[#16161a]'} transition-colors`}
                              onClick={() => setExpanded(isExpanded ? null : deal.id)}
                            >
                              <td className="px-3 py-2.5 rounded-l-md border border-r-0 border-[rgba(255,255,255,0.06)]">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-[#e2e2e2]">
                                  {isExpanded
                                    ? <ChevronDown size={13} className="text-[#4e5058]" />
                                    : <ChevronRight size={13} className="text-[#4e5058]" />
                                  }
                                  {deal.name}
                                </div>
                                {deal.source && (
                                  <div className="text-[#4e5058] text-[10px] font-mono mt-0.5 ml-5">{deal.source}</div>
                                )}
                              </td>
                              <td className="px-3 py-2.5 border-t border-b border-[rgba(255,255,255,0.06)]">
                                <div className="text-[#e2e2e2] text-xs font-mono">{deal.amount || '—'}</div>
                              </td>
                              <td className="px-3 py-2.5 border-t border-b border-[rgba(255,255,255,0.06)]">
                                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded ${STATUS_COLORS[deal.status]}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                  {STATUS_LABELS[deal.status]}
                                </span>
                              </td>
                              {showLifecycle && (
                                <>
                                  {(['conceptApproved', 'depositPaid', 'contentCreated', 'posted', 'finalPaid'] as const).map(f => (
                                    <td key={f} className="px-2 py-2.5 text-center border-t border-b border-[rgba(255,255,255,0.06)]">
                                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${deal[f] ? 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]' : 'bg-[rgba(255,255,255,0.04)] text-[#4e5058]'}`}>
                                        {deal[f] ? '✓' : '·'}
                                      </span>
                                    </td>
                                  ))}
                                </>
                              )}
                              <td className="px-3 py-2.5 border-t border-b border-[rgba(255,255,255,0.06)]">
                                <div className="text-[#8b8d97] text-xs truncate max-w-[180px]">{deal.action || '—'}</div>
                              </td>
                              <td
                                className="px-3 py-2.5 rounded-r-md border border-l-0 border-[rgba(255,255,255,0.06)]"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => handleDelete(deal.id)}
                                  className="text-[#4e5058] hover:text-[#e05252] transition-colors p-1 rounded"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${deal.id}-exp`}>
                                <td
                                  colSpan={showLifecycle ? 10 : 5}
                                  className="px-4 py-4 bg-[#16161a] border border-t-0 border-[rgba(255,255,255,0.08)] rounded-b-md"
                                >
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Status</label>
                                      <select
                                        value={current.status}
                                        onChange={e => setEdit(deal.id, 'status', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                                      >
                                        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Post Date</label>
                                      <input
                                        value={current.postDate || ''}
                                        onChange={e => setEdit(deal.id, 'postDate', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                                        placeholder="TBD or date"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Section</label>
                                      <select
                                        value={current.section}
                                        onChange={e => setEdit(deal.id, 'section', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                                      >
                                        <option value="ACTIVE">Active</option>
                                        <option value="HOT">Hot Negotiations</option>
                                        <option value="INBOUND">Inbound</option>
                                        <option value="CLOSED">Closed</option>
                                      </select>
                                    </div>
                                    <div className="col-span-2">
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Next Action</label>
                                      <input
                                        value={current.action || ''}
                                        onChange={e => setEdit(deal.id, 'action', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                                        placeholder="What needs to happen next?"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Amount</label>
                                      <input
                                        value={current.amount || ''}
                                        onChange={e => setEdit(deal.id, 'amount', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                                      />
                                    </div>
                                    <div className="col-span-3">
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1.5">Lifecycle</label>
                                      <div className="flex gap-4">
                                        {([
                                          ['conceptApproved', 'Concept'],
                                          ['depositPaid', 'Deposit'],
                                          ['contentCreated', 'Content'],
                                          ['posted', 'Posted'],
                                          ['finalPaid', 'Paid']
                                        ] as const).map(([f, label]) => (
                                          <label
                                            key={f}
                                            className="flex items-center gap-1.5 cursor-pointer"
                                            onClick={e => e.stopPropagation()}
                                          >
                                            <input
                                              type="checkbox"
                                              checked={!!current[f]}
                                              onChange={e => setEdit(deal.id, f, e.target.checked)}
                                              className="accent-[#5e6ad2] w-3.5 h-3.5"
                                            />
                                            <span className="text-[#8b8d97] text-xs">{label}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="col-span-3">
                                      <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Private Notes</label>
                                      <textarea
                                        value={current.notes || ''}
                                        onChange={e => setEdit(deal.id, 'notes', e.target.value)}
                                        onClick={e => e.stopPropagation()}
                                        rows={2}
                                        className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2] resize-none"
                                        placeholder="Internal notes..."
                                      />
                                    </div>
                                  </div>
                                  <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                                    <button
                                      onClick={() => handleSave(deal)}
                                      disabled={pending}
                                      className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white text-xs rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      <Check size={11} /> Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setExpanded(null)
                                        setEditMap(m => { const n = { ...m }; delete n[deal.id]; return n })
                                      }}
                                      className="px-3 py-1.5 text-[#8b8d97] text-xs rounded hover:bg-[#1c1c21] transition-colors flex items-center gap-1.5"
                                    >
                                      <X size={11} /> Cancel
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
