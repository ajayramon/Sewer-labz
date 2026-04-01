'use client'
import { useState } from 'react'

type Template = {
  id: string
  name: string
  description: string
  isShared: boolean
  createdAt: string
  defectCount: number
}

const sampleTemplates: Template[] = [
  { id: '1', name: 'Standard CCTV Inspection', description: 'Full CCTV pipeline inspection template', isShared: true, createdAt: '28 Mar 2026', defectCount: 12 },
  { id: '2', name: 'Mainline Sewer Survey', description: 'Mainline sewer condition assessment', isShared: false, createdAt: '25 Mar 2026', defectCount: 8 },
  { id: '3', name: 'Lateral Connection Check', description: 'Lateral connection and junction inspection', isShared: true, createdAt: '20 Mar 2026', defectCount: 6 },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(sampleTemplates)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const atLimit = templates.length >= 5

  const handleCreate = () => {
    if (!newName) return
    const t: Template = {
      id: Date.now().toString(),
      name: newName,
      description: newDesc,
      isShared: false,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      defectCount: 0,
    }
    setTemplates(p => [...p, t])
    setNewName('')
    setNewDesc('')
    setShowNew(false)
  }

  const handleDelete = (id: string) => {
    setTemplates(p => p.filter(t => t.id !== id))
    setDeleteId(null)
  }

  const toggleShare = (id: string) =>
    setTemplates(p => p.map(t => t.id === id ? { ...t, isShared: !t.isShared } : t))

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E2E8F0',
        padding: '16px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>← Dashboard</a>
          <span style={{ color: '#E2E8F0' }}>|</span>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#0F2A4A', margin: 0 }}>Templates</h1>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => !atLimit && setShowNew(true)}
            title={atLimit ? 'You have reached the 5 template limit' : ''}
            style={{
              background: atLimit ? '#94A3B8' : '#2D8C4E',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '14px', fontWeight: 600,
              cursor: atLimit ? 'not-allowed' : 'pointer',
            }}
          >+ New Template</button>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>

        {/* Limit banner */}
        {atLimit && (
          <div style={{
            background: '#FFFBEB', border: '1px solid #FDE68A',
            borderRadius: '10px', padding: '12px 16px',
            color: '#92400E', fontSize: '14px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ You have reached the <strong>5 template limit</strong>. Delete a template to create a new one.
          </div>
        )}

        {/* Template count */}
        <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
          {templates.length} of 5 templates used
          <div style={{
            display: 'inline-block', marginLeft: '12px',
            background: '#E2E8F0', borderRadius: '20px',
            height: '6px', width: '120px', verticalAlign: 'middle',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${(templates.length / 5) * 100}%`,
              background: templates.length >= 5 ? '#DC2626' : '#2D8C4E',
              borderRadius: '20px', transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Empty state */}
        {templates.length === 0 && (
          <div style={{
            background: '#fff', border: '2px dashed #E2E8F0',
            borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '6px' }}>
              No templates yet
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
              Save a report structure as a template to reuse it
            </div>
            <button onClick={() => setShowNew(true)} style={{
              background: '#2D8C4E', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 20px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}>Create First Template</button>
          </div>
        )}

        {/* Template grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {templates.map(t => (
            <div key={t.id} style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: '12px', padding: '20px',
              display: 'flex', flexDirection: 'column', gap: '12px',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '4px' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>{t.description}</div>
                </div>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{
                  background: t.isShared ? '#EFF6FF' : '#F1F5F9',
                  color: t.isShared ? '#0F2A4A' : '#64748B',
                  fontSize: '11px', fontWeight: 600,
                  padding: '3px 8px', borderRadius: '20px',
                }}>
                  {t.isShared ? '🔗 Shared with company' : '🔒 Personal'}
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  {t.defectCount} defect types
                </span>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Created {t.createdAt}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button style={{
                  flex: 1, background: '#2D8C4E', color: '#fff',
                  border: 'none', borderRadius: '6px', padding: '7px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}>Use</button>
                <button style={{
                  flex: 1, background: 'none', border: '1px solid #E2E8F0',
                  borderRadius: '6px', padding: '7px',
                  fontSize: '12px', cursor: 'pointer', color: '#64748B',
                }}>Edit</button>
                <button
                  onClick={() => toggleShare(t.id)}
                  style={{
                    flex: 1, background: 'none',
                    border: `1px solid ${t.isShared ? '#BFDBFE' : '#E2E8F0'}`,
                    borderRadius: '6px', padding: '7px',
                    fontSize: '12px', cursor: 'pointer',
                    color: t.isShared ? '#0F2A4A' : '#64748B',
                  }}
                >{t.isShared ? 'Unshare' : 'Share'}</button>
                <button
                  onClick={() => setDeleteId(t.id)}
                  style={{
                    background: 'none', border: '1px solid #FECACA',
                    borderRadius: '6px', padding: '7px 10px',
                    fontSize: '12px', cursor: 'pointer', color: '#DC2626',
                  }}
                >🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New template modal */}
      {showNew && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '440px',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 20px' }}>
              New Template
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                TEMPLATE NAME
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Standard CCTV Inspection"
                style={{
                  width: '100%', height: '42px', borderRadius: '8px',
                  border: '1px solid #E2E8F0', padding: '0 14px',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748B', marginBottom: '6px' }}>
                DESCRIPTION
              </label>
              <textarea
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Brief description of this template..."
                rows={3}
                style={{
                  width: '100%', borderRadius: '8px',
                  border: '1px solid #E2E8F0', padding: '10px 14px',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowNew(false)}
                style={{
                  flex: 1, background: 'none', border: '1px solid #E2E8F0',
                  borderRadius: '8px', padding: '10px',
                  fontSize: '14px', cursor: 'pointer', color: '#64748B',
                }}
              >Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!newName}
                style={{
                  flex: 1, background: newName ? '#2D8C4E' : '#94A3B8',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px', fontSize: '14px', fontWeight: 600,
                  cursor: newName ? 'pointer' : 'not-allowed',
                }}
              >Create Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, padding: '20px',
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '380px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗑️</div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 8px' }}>
              Delete Template?
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{
                  flex: 1, background: 'none', border: '1px solid #E2E8F0',
                  borderRadius: '8px', padding: '10px',
                  fontSize: '14px', cursor: 'pointer', color: '#64748B',
                }}
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                style={{
                  flex: 1, background: '#DC2626', color: '#fff',
                  border: 'none', borderRadius: '8px', padding: '10px',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}