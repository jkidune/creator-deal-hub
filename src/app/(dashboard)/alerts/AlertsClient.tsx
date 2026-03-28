'use client'
import { useState, useTransition } from 'react'
import { createAlert, resolveAlert, deleteAlert } from '@/app/actions/alerts'
import { Plus, Check, Trash2, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react'

type AlertType = 'DANGER' | 'WARNING' | 'GOOD' | 'INFO'

type Alert = {
  id: string
  userId: string
  type: AlertType
  title: string
  body: string | null
  resolved: boolean
  createdAt: Date
  updatedAt: Date
}

const TYPE_CONFIG: Record<AlertType, {
  label: string
  border: string
  bg: string
  icon: typeof AlertCircle
  iconColor: string
  badge: string
}> = {
  DANGER: {
    label: 'Danger',
    border: 'border-l-[#e05252]',
    bg: 'bg-[rgba(224,82,82,0.04)]',
    icon: AlertCircle,
    iconColor: 'text-[#e05252]',
    badge: 'bg-[rgba(224,82,82,0.1)] text-[#e05252]'
  },
  WARNING: {
    label: 'Warning',
    border: 'border-l-[#e8a23a]',
    bg: 'bg-[rgba(232,162,58,0.04)]',
    icon: AlertTriangle,
    iconColor: 'text-[#e8a23a]',
    badge: 'bg-[rgba(232,162,58,0.1)] text-[#e8a23a]'
  },
  GOOD: {
    label: 'Good',
    border: 'border-l-[#4caf7d]',
    bg: 'bg-[rgba(76,175,125,0.04)]',
    icon: CheckCircle,
    iconColor: 'text-[#4caf7d]',
    badge: 'bg-[rgba(76,175,125,0.1)] text-[#4caf7d]'
  },
  INFO: {
    label: 'Info',
    border: 'border-l-[#5b9cf6]',
    bg: 'bg-[rgba(91,156,246,0.04)]',
    icon: Info,
    iconColor: 'text-[#5b9cf6]',
    badge: 'bg-[rgba(91,156,246,0.1)] text-[#5b9cf6]'
  }
}

type AlertFilter = 'active' | 'resolved' | 'all'

export default function AlertsClient({ initialAlerts }: { initialAlerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState<AlertFilter>('active')
  const [showNew, setShowNew] = useState(false)
  const [newAlert, setNewAlert] = useState({ type: 'INFO' as AlertType, title: '', body: '' })
  const [pending, startTransition] = useTransition()

  const activeAlerts = alerts.filter(a => !a.resolved)
  const resolvedAlerts = alerts.filter(a => a.resolved)

  const displayedAlerts = filter === 'active'
    ? activeAlerts
    : filter === 'resolved'
    ? resolvedAlerts
    : alerts

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await createAlert(newAlert)
      setAlerts(prev => [{
        ...newAlert,
        id: Date.now().toString(),
        userId: '',
        resolved: false,
        body: newAlert.body || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }, ...prev])
      setNewAlert({ type: 'INFO', title: '', body: '' })
      setShowNew(false)
    })
  }

  function handleResolve(id: string) {
    startTransition(async () => {
      await resolveAlert(id)
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a))
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAlert(id)
      setAlerts(prev => prev.filter(a => a.id !== id))
    })
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 bg-[rgba(10,10,11,0.95)] backdrop-blur border-b border-[rgba(255,255,255,0.06)] px-6 py-3 flex items-center justify-between z-40">
        <div>
          <div className="text-[#e2e2e2] font-semibold">Alerts & Money</div>
          <div className="text-[#4e5058] text-xs mt-0.5">
            {activeAlerts.length} active · {resolvedAlerts.length} resolved
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
        >
          <Plus size={12} /> New alert
        </button>
      </div>

      <div className="px-6 py-5">
        {/* Filters */}
        <div className="flex gap-1 mb-5">
          {([
            { key: 'active', label: `Active (${activeAlerts.length})` },
            { key: 'resolved', label: `Resolved (${resolvedAlerts.length})` },
            { key: 'all', label: 'All' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded text-xs transition-colors ${
                filter === f.key
                  ? 'bg-[rgba(94,106,210,0.12)] text-[#e2e2e2]'
                  : 'text-[#8b8d97] hover:bg-[#16161a] hover:text-[#e2e2e2]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* New alert form */}
        {showNew && (
          <div className="bg-[#111113] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 mb-4">
            <div className="text-[#e2e2e2] text-sm font-medium mb-3">New Alert</div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex gap-3">
                <div>
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={newAlert.type}
                    onChange={e => setNewAlert(p => ({ ...p, type: e.target.value as AlertType }))}
                    className="bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                  >
                    <option value="DANGER">Danger</option>
                    <option value="WARNING">Warning</option>
                    <option value="GOOD">Good</option>
                    <option value="INFO">Info</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Title *</label>
                  <input
                    value={newAlert.title}
                    onChange={e => setNewAlert(p => ({ ...p, title: e.target.value }))}
                    required
                    placeholder="Alert title"
                    className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Details</label>
                <textarea
                  value={newAlert.body}
                  onChange={e => setNewAlert(p => ({ ...p, body: e.target.value }))}
                  rows={2}
                  placeholder="Additional context (invoice number, amount, deadline...)"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2] resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white text-xs rounded transition-colors disabled:opacity-50"
                >
                  Create alert
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

        {/* Alert summary stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {(['DANGER', 'WARNING', 'GOOD', 'INFO'] as AlertType[]).map(type => {
            const cfg = TYPE_CONFIG[type]
            const count = activeAlerts.filter(a => a.type === type).length
            const Icon = cfg.icon
            return (
              <div key={type} className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={13} className={cfg.iconColor} />
                  <span className="text-[#4e5058] text-[10px] uppercase tracking-wider">{cfg.label}</span>
                </div>
                <div className={`text-xl font-semibold ${cfg.iconColor}`}>{count}</div>
              </div>
            )
          })}
        </div>

        {/* Alerts list */}
        {displayedAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#16161a] flex items-center justify-center mb-3">
              <CheckCircle size={18} className="text-[#4e5058]" />
            </div>
            <div className="text-[#8b8d97] text-sm font-medium mb-1">
              {filter === 'active' ? 'No active alerts' : filter === 'resolved' ? 'No resolved alerts' : 'No alerts'}
            </div>
            <div className="text-[#4e5058] text-xs">
              {filter === 'active' ? 'All clear — no flags or payment issues' : 'Create alerts to track invoices, payments, and flags'}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {displayedAlerts.map(alert => {
              const cfg = TYPE_CONFIG[alert.type]
              const Icon = cfg.icon
              return (
                <div
                  key={alert.id}
                  className={`border border-[rgba(255,255,255,0.06)] border-l-4 rounded-lg px-4 py-3.5 flex items-start gap-3 ${cfg.border} ${cfg.bg} ${alert.resolved ? 'opacity-50' : ''}`}
                >
                  <Icon size={15} className={`${cfg.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[#e2e2e2] text-sm font-medium">{alert.title}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      {alert.resolved && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.04)] text-[#4e5058]">
                          Resolved
                        </span>
                      )}
                    </div>
                    {alert.body && (
                      <div className="text-[#8b8d97] text-xs mt-1">{alert.body}</div>
                    )}
                    <div className="text-[#4e5058] text-[10px] mt-1.5">
                      {new Date(alert.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!alert.resolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={pending}
                        className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] text-[#4caf7d] bg-[rgba(76,175,125,0.08)] hover:bg-[rgba(76,175,125,0.14)] transition-colors disabled:opacity-50"
                        title="Mark resolved"
                      >
                        <Check size={11} /> Resolve
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.id)}
                      disabled={pending}
                      className="text-[#4e5058] hover:text-[#e05252] transition-colors p-1.5 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
