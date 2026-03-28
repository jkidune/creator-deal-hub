'use client'
import { useState, useTransition } from 'react'
import { createProject, addProjectItem, toggleProjectItem, deleteProject } from '@/app/actions/projects'
import { Plus, Trash2, Check, FolderKanban } from 'lucide-react'

type ProjectItem = {
  id: string
  projectId: string
  text: string
  done: boolean
  createdAt: Date
}

type Project = {
  id: string
  userId: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

type FullProject = Project & { items: ProjectItem[] }

export default function ProjectsClient({ initialProjects }: { initialProjects: FullProject[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [showNew, setShowNew] = useState(false)
  const [newProject, setNewProject] = useState({ title: '', description: '' })
  const [itemForms, setItemForms] = useState<Record<string, string>>({})
  const [pending, startTransition] = useTransition()

  function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const project = await createProject(newProject)
      setProjects(prev => [...prev, project])
      setNewProject({ title: '', description: '' })
      setShowNew(false)
    })
  }

  function handleAddItem(projectId: string) {
    const text = (itemForms[projectId] || '').trim()
    if (!text) return
    startTransition(async () => {
      const item = await addProjectItem(projectId, text)
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, items: [...p.items, item] } : p))
      setItemForms(f => ({ ...f, [projectId]: '' }))
    })
  }

  function handleToggleItem(projectId: string, itemId: string) {
    startTransition(async () => {
      await toggleProjectItem(itemId)
      setProjects(prev => prev.map(p => p.id === projectId ? {
        ...p,
        items: p.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i)
      } : p))
    })
  }

  function handleDeleteProject(id: string) {
    startTransition(async () => {
      await deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    })
  }

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <div className="sticky top-0 bg-[rgba(10,10,11,0.95)] backdrop-blur border-b border-[rgba(255,255,255,0.06)] px-6 py-3 flex items-center justify-between z-40">
        <div>
          <div className="text-[#e2e2e2] font-semibold">Projects</div>
          <div className="text-[#4e5058] text-xs mt-0.5">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
        >
          <Plus size={12} /> New project
        </button>
      </div>

      <div className="px-6 py-5">
        {/* New project form */}
        {showNew && (
          <div className="bg-[#111113] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 mb-6">
            <div className="text-[#e2e2e2] text-sm font-medium mb-3">New Project</div>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Title *</label>
                <input
                  value={newProject.title}
                  onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                  required
                  placeholder="Project name"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div>
                <label className="block text-[#4e5058] text-[10px] uppercase tracking-wider mb-1">Description</label>
                <input
                  value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="What is this project about?"
                  className="w-full bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white text-xs rounded transition-colors disabled:opacity-50"
                >
                  Create project
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

        {projects.length === 0 && !showNew ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 rounded-lg bg-[#16161a] flex items-center justify-center mb-3">
              <FolderKanban size={18} className="text-[#4e5058]" />
            </div>
            <div className="text-[#8b8d97] text-sm font-medium mb-1">No projects yet</div>
            <div className="text-[#4e5058] text-xs mb-4">Track your long-term personal projects with checklists</div>
            <button
              onClick={() => setShowNew(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[#5e6ad2] hover:bg-[#6e7ae2] text-white transition-colors"
            >
              <Plus size={12} /> Create first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {projects.map(project => {
              const doneCount = project.items.filter(i => i.done).length
              const totalCount = project.items.length
              const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

              return (
                <div key={project.id} className="bg-[#111113] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden">
                  {/* Card header */}
                  <div className="px-4 py-4 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-[#e2e2e2] font-semibold text-sm">{project.title}</div>
                        {project.description && (
                          <div className="text-[#4e5058] text-xs mt-1">{project.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-[#4e5058] hover:text-[#e05252] transition-colors p-1 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Progress */}
                    {totalCount > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[#4e5058] text-[10px]">Progress</span>
                          <span className="text-[#8b8d97] text-[10px] font-mono">{doneCount}/{totalCount}</span>
                        </div>
                        <div className="h-1 bg-[#16161a] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${progress}%`,
                              background: progress === 100 ? '#4caf7d' : '#5e6ad2'
                            }}
                          />
                        </div>
                        {progress === 100 && (
                          <div className="text-[#4caf7d] text-[10px] mt-1 flex items-center gap-1">
                            <Check size={10} /> Complete
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="px-4 py-3">
                    {project.items.length === 0 ? (
                      <div className="text-[#4e5058] text-xs py-1">No items yet — add your first task below</div>
                    ) : (
                      <div className="space-y-1 mb-3">
                        {project.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 cursor-pointer group py-0.5"
                            onClick={() => handleToggleItem(project.id, item.id)}
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                              item.done
                                ? 'bg-[#5e6ad2] border-[#5e6ad2]'
                                : 'border-[rgba(255,255,255,0.12)] group-hover:border-[#5e6ad2]'
                            }`}>
                              {item.done && <Check size={10} className="text-white" />}
                            </div>
                            <span className={`text-xs transition-colors ${
                              item.done ? 'text-[#4e5058] line-through' : 'text-[#e2e2e2]'
                            }`}>
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add item form */}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={itemForms[project.id] || ''}
                        onChange={e => setItemForms(f => ({ ...f, [project.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddItem(project.id)
                          }
                        }}
                        placeholder="Add a task... (Enter to add)"
                        className="flex-1 bg-[#0a0a0b] border border-[rgba(255,255,255,0.06)] text-[#e2e2e2] rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#5e6ad2] placeholder-[#4e5058]"
                      />
                      <button
                        onClick={() => handleAddItem(project.id)}
                        disabled={pending || !itemForms[project.id]?.trim()}
                        className="px-2.5 py-1.5 text-[#5e6ad2] hover:bg-[rgba(94,106,210,0.1)] rounded text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
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
