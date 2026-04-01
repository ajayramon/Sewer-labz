'use client'
import { useState } from 'react'

type DefectImage = { id: string; url: string; name: string }
type Defect = {
  id: string
  code: string
  description: string
  severity: string
  narrative: string
  images: DefectImage[]
  expanded: boolean
}

const severityColors: Record<string, { bg: string; color: string }> = {
  Low:      { bg: '#F0FDF4', color: '#16A34A' },
  Medium:   { bg: '#FFFBEB', color: '#D97706' },
  High:     { bg: '#FFF7ED', color: '#EA580C' },
  Critical: { bg: '#FEF2F2', color: '#DC2626' },
}

export default function ReportBuilder() {
  const [title, setTitle] = useState('New Inspection Report')
  const [editingTitle, setEditingTitle] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [details, setDetails] = useState({
    jobNumber: '',
    clientName: '',
    location: '',
    inspectedAt: new Date().toISOString().split('T')[0],
    inspector: '',
    notes: '',
  })
  const [defects, setDefects] = useState<Defect[]>([])
  const [dragOver, setDragOver] = useState<string | null>(null)

  const updateDetail = (k: string, v: string) =>
    setDetails(p => ({ ...p, [k]: v }))

  const addDefect = () => {
    setDefects(p => [...p, {
      id: Date.now().toString(),
      code: '', description: '', severity: 'Medium',
      narrative: '', images: [], expanded: true,
    }])
  }

  const updateDefect = (id: string, k: string, v: string) =>
    setDefects(p => p.map(d => d.id === id ? { ...d, [k]: v } : d))

  const toggleExpand = (id: string) =>
    setDefects(p => p.map(d => d.id === id ? { ...d, expanded: !d.expanded } : d))

  const deleteDefect = (id: string) =>
    setDefects(p => p.filter(d => d.id !== id))

  const handleImageUpload = (defectId: string, files: FileList | null) => {
    if (!files) return
    const defect = defects.find(d => d.id === defectId)
    if (!defect) return
    const remaining = 6 - defect.images.length
    const toAdd = Array.from(files).slice(0, remaining)
    const newImages: DefectImage[] = toAdd.map(f => ({
      id: Date.now().toString() + Math.random(),
      url: URL.createObjectURL(f),
      name: f.name,
    }))
    setDefects(p => p.map(d =>
      d.id === defectId ? { ...d, images: [...d.images, ...newImages] } : d
    ))
  }

  const removeImage = (defectId: string, imageId: string) =>
    setDefects(p => p.map(d =>
      d.id === defectId ? { ...d, images: d.images.filter(i => i.id !== imageId) } : d
    ))

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: { ...details, title },
          defects,
        }),
      })
      const html = await res.text()
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(html)
        win.document.close()
        setTimeout(() => win.print(), 800)
      }
    } catch (err) {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle = {
    width: '100%',
    height: '38px',
    borderRadius: '6px',
    border: '1px solid #E2E8F0',
    padding: '0 12px',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box' as const,
    background: '#F8FAFC',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600 as const,
    color: '#64748B',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
            ← Reports
          </a>
          <span style={{ color: '#E2E8F0' }}>|</span>
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              style={{ ...inputStyle, width: '280px', fontWeight: 600, fontSize: '15px' }}
            />
          ) : (
            <span
              onClick={() => setEditingTitle(true)}
              style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', cursor: 'pointer' }}
            >
              {title} ✏️
            </span>
          )}
          <span style={{
            background: '#F1F5F9',
            color: '#64748B',
            fontSize: '11px',
            fontWeight: 600,
            padding: '3px 8px',
            borderRadius: '20px',
          }}>DRAFT</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && (
            <span style={{ fontSize: '13px', color: '#2D8C4E', fontWeight: 500 }}>✓ Saved</span>
          )}
          <button
            onClick={handleSave}
            style={{
              background: 'none',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#64748B',
            }}
          >
            Save Draft
          </button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            style={{
              background: generating ? '#94A3B8' : '#2D8C4E',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >
            {generating ? 'Generating...' : 'Generate PDF'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'flex', gap: '24px', padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

        {/* Left panel */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <div style={{
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
            position: 'sticky',
            top: '70px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
              Report Details
            </h3>

            {[
              { label: 'Job Number', key: 'jobNumber', placeholder: 'JOB-001' },
              { label: 'Client Name', key: 'clientName', placeholder: 'City Council' },
              { label: 'Site Location', key: 'location', placeholder: '123 Main Street' },
              { label: 'Inspector Name', key: 'inspector', placeholder: 'John Smith' },
            ].map(({ label, key, placeholder }) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="text"
                  value={details[key as keyof typeof details]}
                  onChange={e => updateDetail(key, e.target.value)}
                  placeholder={placeholder}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Inspection Date</label>
              <input
                type="date"
                value={details.inspectedAt}
                onChange={e => updateDetail('inspectedAt', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Notes / Summary</label>
              <textarea
                value={details.notes}
                onChange={e => updateDetail('notes', e.target.value)}
                placeholder="Add general notes..."
                rows={4}
                style={{
                  ...inputStyle,
                  height: 'auto',
                  padding: '10px 12px',
                  resize: 'vertical',
                  lineHeight: '1.5',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>
              Defects{defects.length > 0 && ` (${defects.length})`}
            </h2>
            <button
              onClick={addDefect}
              style={{
                background: '#2D8C4E',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Add Defect
            </button>
          </div>

          {defects.length === 0 && (
            <div style={{
              background: '#fff',
              border: '2px dashed #E2E8F0',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '6px' }}>
                No defects added yet
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
                Click the button below to add your first defect
              </div>
              <button
                onClick={addDefect}
                style={{
                  background: '#2D8C4E',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Add First Defect
              </button>
            </div>
          )}

          {defects.map((defect, index) => (
            <div key={defect.id} style={{
              background: '#fff',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              marginBottom: '16px',
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderBottom: defect.expanded ? '1px solid #F1F5F9' : 'none',
                background: '#FAFAFA',
              }}>
                <span style={{ color: '#94A3B8', fontSize: '16px' }}>⠿</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', minWidth: '24px' }}>
                  #{index + 1}
                </span>
                <input
                  value={defect.code}
                  onChange={e => updateDefect(defect.id, 'code', e.target.value)}
                  placeholder="Code (e.g. B:01.A)"
                  style={{ ...inputStyle, width: '140px', flex: 'none' }}
                />
                <input
                  value={defect.description}
                  onChange={e => updateDefect(defect.id, 'description', e.target.value)}
                  placeholder="Defect description"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <select
                  value={defect.severity}
                  onChange={e => updateDefect(defect.id, 'severity', e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '110px',
                    flex: 'none',
                    background: severityColors[defect.severity]?.bg,
                    color: severityColors[defect.severity]?.color,
                    fontWeight: 600,
                  }}
                >
                  {['Low', 'Medium', 'High', 'Critical'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => toggleExpand(defect.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#64748B',
                  }}
                >
                  {defect.expanded ? '▲' : '▼'}
                </button>
                <button
                  onClick={() => deleteDefect(defect.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#DC2626',
                  }}
                >
                  🗑
                </button>
              </div>

              {defect.expanded && (
                <div style={{ padding: '16px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={labelStyle}>Narrative / Description</label>
                    <textarea
                      value={defect.narrative}
                      onChange={e => updateDefect(defect.id, 'narrative', e.target.value)}
                      placeholder="Describe the defect in detail..."
                      rows={3}
                      style={{
                        ...inputStyle,
                        height: 'auto',
                        padding: '10px 12px',
                        resize: 'vertical',
                        lineHeight: '1.5',
                      }}
                    />
                  </div>

                  <label style={labelStyle}>Images ({defect.images.length}/6)</label>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(defect.id) }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => {
                      e.preventDefault()
                      setDragOver(null)
                      handleImageUpload(defect.id, e.dataTransfer.files)
                    }}
                    onClick={() => {
                      if (defect.images.length >= 6) return
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.multiple = true
                      input.onchange = e => handleImageUpload(defect.id, (e.target as HTMLInputElement).files)
                      input.click()
                    }}
                    style={{
                      border: `2px dashed ${dragOver === defect.id ? '#2D8C4E' : '#E2E8F0'}`,
                      borderRadius: '8px',
                      padding: '20px',
                      textAlign: 'center',
                      background: dragOver === defect.id ? '#F0FDF4' : '#F8FAFC',
                      transition: 'all 0.2s',
                      marginBottom: '12px',
                      cursor: defect.images.length >= 6 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📸</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>
                      {defect.images.length >= 6
                        ? 'Maximum 6 images reached'
                        : 'Drag & drop images here or click to upload'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      Up to 6 images per defect — JPG, PNG accepted
                    </div>
                  </div>

                  {defect.images.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '8px',
                    }}>
                      {defect.images.map((img, imgIndex) => (
                        <div key={img.id} style={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          aspectRatio: '4/3',
                        }}>
                          <img
                            src={img.url}
                            alt={img.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}>
                            {imgIndex + 1}
                          </div>
                          <button
                            onClick={() => removeImage(defect.id, img.id)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#DC2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {defects.length > 0 && (
            <button
              onClick={addDefect}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px dashed #E2E8F0',
                borderRadius: '12px',
                background: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#64748B',
                fontWeight: 500,
              }}
            >
              + Add Another Defect
            </button>
          )}
        </div>
      </div>
    </div>
  )
}