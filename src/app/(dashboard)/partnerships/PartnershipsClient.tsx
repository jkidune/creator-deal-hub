'use client'
import { useState, useTransition } from 'react'
import {
  createPartnership,
  addDeadline,
  toggleDeadline,
  addSpeakingSlot,
  addProduct,
  updateProductStatus,
  deletePartnership
} from '@/app/actions/partnerships'
import { Plus, Trash2, Calendar, Mic, Package, Check, AlertCircle } from 'lucide-react'

type ProductStatus = 'IN_PROGRESS' | 'ITERATING' | 'DEVELOPMENT' | 'DONE'

type Deadline = {
  id: string
  partnershipId: string
  dueDate: Date
  task: string
  done: boolean
  createdAt: Date
}

type SpeakingSlot = {
  id: string
  partnershipId: string
  brand: string
  eventDate: Date
  timeSlot: string | null
  fee: string | null
  depositPaid: boolean
  finalPaid: boolean
  notes: string | null
  createdAt: Date
}

type PartnerProduct = {
  id: string
  partnershipId: string
  name: string
  status: ProductStatus
  createdAt: Date
}

type Partnership = {
  id: string
  userId: string
  brandName: string
  dealValue: string | null
  type: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

type FullPartnership = Partnership & {
  deadlines: Deadline[]
  speakingSlots: SpeakingSlot[]
  products: PartnerProduct[]
}

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  IN_PROGRESS: 'In progress',
  ITERATING: 'Iterating',
  DEVELOPMENT: 'Development',
  DONE: 'Done'
}

const PRODUCT_STATUS_COLORS: Record<ProductStatus, string> = {
  IN_PROGRESS: 'bg-[rgba(91,156,246,0.1)] text-[#5b9cf6]',
  ITERATING: 'bg-[rgba(232,162,58,0.1)] text-[#e8a23a]',
  DEVELOPMENT: 'bg-[rgba(155,127,232,0.1)] text-[#9b7fe8]',
  DONE: 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]'
}

function getDeadlineColor(dueDate: Date, done: boolean): string {
  if (done) return 'text-[#4e5058] line-through'
  const now = new Date()
  const diff = dueDate.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  if (days < 0) return 'text-[#e05252]'
  if (days <= 7) return 'text-[#e8a23a]'
  return 'text-[#8b8d97]'
}

function EmptyBriefcase({ size, className }: { size: number; className: string }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

type DLFormEntry = { task: string; dueDate: string }
type SlotFormEntry = { brand: string; eventDate: string; timeSlot: string; fee: string; notes: string }

export default function PartnershipsClient({ initialPartnerships }: { initialPartnerships: FullPartnership[] }) {
  const [partnerships, setPartnerships] = useState(initialPartnerships)
  const [showNew, setShowNew] = useState(false)
  const [newPartner, setNewPartner] = useState({ brandName: '', dealValue: '', type: '', notes: '' })
  const [dlForms, setDlForms] = useState<Record<string, DLFormEntry>>({})
  const [slotForms, setSlotForms] = useState<Record<string, SlotFormEntry>>({})
  const [productForms, setProductForms] = useState<Record<string, string>>({})
  const [showDLForm, setShowDLForm] = useState<string | null>(null)
  const [showSlotForm, setShowSlotForm] = useState<string | null>(null)
  const [showProductForm, setShowProductForm] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleCreatePartner(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const created = await createPartnership(newPartner)
      setPartnerships(prev => [...prev, {
        ...created,
        deadlines: [],
        speakingSlots: [],
        products: [],
      }])
      setNewPartner({ brandName: '', dealValue: '', type: '', notes: '' })
      setShowNew(false)
    })
  }

  function handleAddDeadline(partnershipId: string) {
    const form = dlForms[partnershipId]
    if (!form?.task || !form?.dueDate) return
    startTransition(async () => {
      const newDeadline = await addDeadline(partnershipId, form.dueDate, form.task)
      setPartnerships(prev => prev.map(p => p.id === partnershipId ? {
        ...p,
        deadlines: [...p.deadlines, newDeadline]
      } : p))
      setDlForms(f => ({ ...f, [partnershipId]: { task: '', dueDate: '' } }))
      setShowDLForm(null)
    })
  }

  function handleToggleDeadline(partnershipId: string, deadlineId: string) {
    startTransition(async () => {
      await toggleDeadline(deadlineId)
      setPartnerships(prev => prev.map(p => p.id === partnershipId ? {
        ...p,
        deadlines: p.deadlines.map(d => d.id === deadlineId ? { ...d, done: !d.done } : d)
      } : p))
    })
  }

  function handleAddSlot(partnershipId: string) {
    const form = slotForms[partnershipId]
    if (!form?.brand || !form?.eventDate) return
    startTransition(async () => {
      const newSlot = await addSpeakingSlot(partnershipId, form)
      setPartnerships(prev => prev.map(p => p.id === partnershipId ? {
        ...p,
        speakingSlots: [...p.speakingSlots, newSlot]
      } : p))
      setSlotForms(f => ({ ...f, [partnershipId]: { brand: '', eventDate: '', timeSlot: '', fee: '', notes: '' } }))
      setShowSlotForm(null)
    })
  }

  function handleAddProduct(partnershipId: string) {
    const name = (productForms[partnershipId] || '').trim()
    if (!name) return
    startTransition(async () => {
      const newProduct = await addProduct(partnershipId, name)
      setPartnerships(prev => prev.map(p => p.id === partnershipId ? {
        ...p,
        products: [...p.products, newProduct]
      } : p))
      setProductForms(f => ({ ...f, [partnershipId]: '' }))
      setShowProductForm(null)
    })
  }

  function handleUpdateProductStatus(partnershipId: string, productId: string, status: ProductStatus) {
    startTransition(async () => {
      await updateProductStatus(productId, status)
      setPartnerships(prev => prev.map(p => p.id === partnershipId ? {
        ...p,
        products: p.products.map(pr => pr.id === productId ? { ...pr, status } : pr)
      } : p))
    })
  }

  function handleDeletePartnership(id: string) {
    startTransition(async () => {
      await deletePartnership(id)
      setPartnerships(prev => prev.filter(p => p.id !== id))
    })
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 bg-[rgba(10,10,11,0.95)] backdrop-blur border-b border-[rgba(255,255,255,0.06)] px-6 py-3 flex items-center justify-between z-40">
        <div>
          <div className="text-[#e2e2e2] font-semibold">Partnerships</div>
          <div className="text-[#4e5058] text-xs mt-0.5">
            {partnerships.length} active {partnerships.length === 1 ? 'partnership' : 'partnerships'}
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
        >
          <Plus size={12} /> New partnership
        </button>
      </div>

      <div className="px-6 py-5">
        {/* New partnership form */}
        {showNew && (
          <div className="bg-[#111113] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 mb-6">
            <div className="text-[#e2e2e2] text-sm font-medium mb-3">New Partnership</div>
            <form onSubmit={handleCreatePartner} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Brand Name *</label>
                <input
                  value={newPartner.brandName}
                  onChange={e => setNewPartner(p => ({ ...p, brandName: e.target.value }))}
                  required
                  placeholder="Brand name"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Deal Value</label>
                <input
                  value={newPartner.dealValue}
                  onChange={e => setNewPartner(p => ({ ...p, dealValue: e.target.value }))}
                  placeholder="$0 / year"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Type</label>
                <input
                  value={newPartner.type}
                  onChange={e => setNewPartner(p => ({ ...p, type: e.target.value }))}
                  placeholder="Ambassador / Speaking / Collab"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Notes</label>
                <input
                  value={newPartner.notes}
                  onChange={e => setNewPartner(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Any context..."
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white text-xs rounded transition-colors disabled:opacity-50"
                >
                  Add partnership
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

        {partnerships.length === 0 && !showNew ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#16161a] flex items-center justify-center mb-3">
              <EmptyBriefcase size={18} className="text-[#4e5058]" />
            </div>
            <div className="text-[#8b8d97] text-sm font-medium mb-1">No partnerships yet</div>
            <div className="text-[#4e5058] text-xs mb-4">Add your long-term brand relationships</div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
            >
              <Plus size={12} /> Add partnership
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {partnerships.map(p => (
              <div key={p.id} className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden">
                {/* Card header */}
                <div className="px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)] flex items-start justify-between">
                  <div>
                    <div className="text-[#e2e2e2] font-semibold text-sm">{p.brandName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {p.dealValue && (
                        <span className="text-[#4caf7d] text-xs font-mono">{p.dealValue}</span>
                      )}
                      {p.type && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(94,106,210,0.1)] text-[#5e6ad2]">
                          {p.type}
                        </span>
                      )}
                    </div>
                    {p.notes && (
                      <div className="text-[#4e5058] text-xs mt-1.5">{p.notes}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePartnership(p.id)}
                    className="text-[#4e5058] hover:text-[#e05252] transition-colors p-1 rounded"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* Deadlines */}
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#8b8d97] text-[11px] font-medium uppercase tracking-wider">
                      <Calendar size={11} />
                      Deadlines
                    </div>
                    <button
                      onClick={() => setShowDLForm(showDLForm === p.id ? null : p.id)}
                      className="text-[#4e5058] hover:text-[#5e6ad2] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>

                  {showDLForm === p.id && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <input
                        value={dlForms[p.id]?.task || ''}
                        onChange={e => setDlForms(f => ({ ...f, [p.id]: { ...f[p.id], task: e.target.value, dueDate: f[p.id]?.dueDate || '' } }))}
                        placeholder="Task description"
                        className="flex-1 min-w-[140px] bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <input
                        type="date"
                        value={dlForms[p.id]?.dueDate || ''}
                        onChange={e => setDlForms(f => ({ ...f, [p.id]: { ...f[p.id], dueDate: e.target.value, task: f[p.id]?.task || '' } }))}
                        className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <button
                        onClick={() => handleAddDeadline(p.id)}
                        disabled={pending}
                        className="px-2.5 py-1 bg-[#5e6ad2] text-white text-xs rounded hover:bg-[#6e7ae2] transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {p.deadlines.length === 0 ? (
                    <div className="text-[#4e5058] text-xs py-1">No deadlines set</div>
                  ) : (
                    <div className="space-y-1">
                      {p.deadlines.map(d => (
                        <div
                          key={d.id}
                          className="flex items-center gap-2 cursor-pointer group"
                          onClick={() => handleToggleDeadline(p.id, d.id)}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                            d.done
                              ? 'bg-[#5e6ad2] border-[#5e6ad2]'
                              : 'border-[rgba(255,255,255,0.12)] group-hover:border-[#5e6ad2]'
                          }`}>
                            {d.done && <Check size={10} className="text-white" />}
                          </div>
                          <span className={`text-xs flex-1 ${getDeadlineColor(new Date(d.dueDate), d.done)}`}>
                            {d.task}
                          </span>
                          <span className={`text-[10px] font-mono flex-shrink-0 ${getDeadlineColor(new Date(d.dueDate), d.done)}`}>
                            {new Date(d.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          {!d.done && new Date(d.dueDate) < new Date() && (
                            <AlertCircle size={11} className="text-[#e05252] flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Speaking Slots */}
                <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#8b8d97] text-[11px] font-medium uppercase tracking-wider">
                      <Mic size={11} />
                      Speaking Slots
                    </div>
                    <button
                      onClick={() => setShowSlotForm(showSlotForm === p.id ? null : p.id)}
                      className="text-[#4e5058] hover:text-[#5e6ad2] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>

                  {showSlotForm === p.id && (
                    <div className="flex gap-2 mb-2 flex-wrap">
                      <input
                        value={slotForms[p.id]?.brand || ''}
                        onChange={e => setSlotForms(f => {
                          const cur = f[p.id] || { brand: '', eventDate: '', timeSlot: '', fee: '', notes: '' }
                          return { ...f, [p.id]: { ...cur, brand: e.target.value } }
                        })}
                        placeholder="Event / brand"
                        className="flex-1 min-w-[120px] bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <input
                        type="date"
                        value={slotForms[p.id]?.eventDate || ''}
                        onChange={e => setSlotForms(f => {
                          const cur = f[p.id] || { brand: '', eventDate: '', timeSlot: '', fee: '', notes: '' }
                          return { ...f, [p.id]: { ...cur, eventDate: e.target.value } }
                        })}
                        className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <input
                        value={slotForms[p.id]?.fee || ''}
                        onChange={e => setSlotForms(f => {
                          const cur = f[p.id] || { brand: '', eventDate: '', timeSlot: '', fee: '', notes: '' }
                          return { ...f, [p.id]: { ...cur, fee: e.target.value } }
                        })}
                        placeholder="Fee"
                        className="w-20 bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <button
                        onClick={() => handleAddSlot(p.id)}
                        disabled={pending}
                        className="px-2.5 py-1 bg-[#5e6ad2] text-white text-xs rounded hover:bg-[#6e7ae2] transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {p.speakingSlots.length === 0 ? (
                    <div className="text-[#4e5058] text-xs py-1">No speaking slots</div>
                  ) : (
                    <div className="space-y-1.5">
                      {p.speakingSlots.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-1.5 px-2.5 rounded bg-[#16161a]">
                          <div>
                            <div className="text-[#e2e2e2] text-xs font-medium">{s.brand}</div>
                            {s.timeSlot && <div className="text-[#4e5058] text-[10px]">{s.timeSlot}</div>}
                          </div>
                          <div className="text-right">
                            <div className="text-[#8b8d97] text-[10px] font-mono">
                              {new Date(s.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            {s.fee && <div className="text-[#4caf7d] text-[10px] font-mono">{s.fee}</div>}
                            <div className="flex gap-1.5 mt-0.5 justify-end">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.depositPaid ? 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]' : 'bg-[rgba(255,255,255,0.04)] text-[#4e5058]'}`}>
                                Dep
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${s.finalPaid ? 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]' : 'bg-[rgba(255,255,255,0.04)] text-[#4e5058]'}`}>
                                Final
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Products */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[#8b8d97] text-[11px] font-medium uppercase tracking-wider">
                      <Package size={11} />
                      Products
                    </div>
                    <button
                      onClick={() => setShowProductForm(showProductForm === p.id ? null : p.id)}
                      className="text-[#4e5058] hover:text-[#5e6ad2] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Plus size={10} /> Add
                    </button>
                  </div>

                  {showProductForm === p.id && (
                    <div className="flex gap-2 mb-2">
                      <input
                        value={productForms[p.id] || ''}
                        onChange={e => setProductForms(f => ({ ...f, [p.id]: e.target.value }))}
                        placeholder="Product name"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddProduct(p.id) } }}
                        className="flex-1 bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2 py-1 text-xs focus:outline-none focus:border-[#5e6ad2]"
                      />
                      <button
                        onClick={() => handleAddProduct(p.id)}
                        disabled={pending}
                        className="px-2.5 py-1 bg-[#5e6ad2] text-white text-xs rounded hover:bg-[#6e7ae2] transition-colors disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>
                  )}

                  {p.products.length === 0 ? (
                    <div className="text-[#4e5058] text-xs py-1">No products</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {p.products.map(pr => (
                        <div key={pr.id} className="flex items-center gap-1.5 bg-[#16161a] px-2 py-1 rounded">
                          <span className="text-[#e2e2e2] text-xs">{pr.name}</span>
                          <select
                            value={pr.status}
                            onChange={e => handleUpdateProductStatus(p.id, pr.id, e.target.value as ProductStatus)}
                            className={`text-[10px] px-1.5 py-0.5 rounded border-0 cursor-pointer focus:outline-none ${PRODUCT_STATUS_COLORS[pr.status]}`}
                            style={{ background: 'transparent' }}
                          >
                            {Object.entries(PRODUCT_STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="bg-[#111113] text-[#e2e2e2]">{v}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
