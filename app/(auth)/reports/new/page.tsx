'use client'
import { useState } from 'react'

type DefectImage = { id: string; url: string; name: string }
type Defect = {
  id: string
  videoTime: string
  footage: string
  conditionType: string
  description: string
  severity: string
  narrative: string
  images: DefectImage[]
  expanded: boolean
}

const conditionTypes = [
  'Select Condition Type',
  'Root Intrusion',
  'Offset Joint',
  'Circumferential Crack',
  'Longitudinal Crack',
  'Erosion At Joint',
  'Debris Within Pipe',
  'Deteriorated Pipe Material',
  'Pipe Traversed Material',
  'Joints Performing As Designed - No Defect',
  'Camera Reached Inspection Limit',
  'City Connection Reached',
  'Grease Deposit',
  'Broken Pipe',
  'Belly/Positive Grade',
  'Other',
]

const pipeMaterials = [
  'ABS',
  'Cast Iron',
  'Asbestos Cement/Transite',
  'Clay/Terracotta',
  'PVC',
  'Concrete',
  'Orangeburg',
  'CIPP',
  'HDPE',
  'Galvanized Steel',
  'Copper',
]

const severityColors: Record<string, { bg: string; color: string }> = {
  'No Defect': { bg: '#F0FDF4', color: '#16A34A' },
  Minor: { bg: '#FFFBEB', color: '#D97706' },
  Moderate: { bg: '#FFF7ED', color: '#EA580C' },
  Major: { bg: '#FEF2F2', color: '#DC2626' },
}

export default function ReportBuilder() {
  const [title, setTitle] = useState('New Inspection Report')
  const [editingTitle, setEditingTitle] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [details, setDetails] = useState({
    fileNumber: '',
    clientName: '',
    location: '',
    inspectedAt: new Date().toISOString().split('T')[0],
    inspectionTime: '',
    inspector: '',
    peoplePresent: '',
    buyersAgent: '',
    buildingOccupied: 'Yes',
    weather: '',
    cleanoutLocation: '',
    pipeMaterials: [] as string[],
    videoLink: '',
    notes: '',
  })

  const [propertyPhoto, setPropertyPhoto] = useState<string | null>(null)
  const [defects, setDefects] = useState<Defect[]>([])
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'system' | 'conditions'>('details')

  const updateDetail = (k: string, v: string) =>
    setDetails(p => ({ ...p, [k]: v }))

  const toggleMaterial = (material: string) => {
    setDetails(p => ({
      ...p,
      pipeMaterials: p.pipeMaterials.includes(material)
        ? p.pipeMaterials.filter(m => m !== material)
        : [...p.pipeMaterials, material],
    }))
  }

  const addDefect = () => {
    setDefects(p => [...p, {
      id: Date.now().toString(),
      videoTime: '',
      footage: '',
      conditionType: 'Select Condition Type',
      description: '',
      severity: 'Minor',
      narrative: '',
      images: [],
      expanded: true,
    }])
    setActiveTab('conditions')
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

  const handlePropertyPhoto = (files: FileList | null) => {
    if (!files || !files[0]) return
    setPropertyPhoto(URL.createObjectURL(files[0]))
  }

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
          report: { ...details, title, propertyPhoto },
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
    } catch {
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

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600 as const,
    cursor: 'pointer' as const,
    background: active ? '#0F2A4A' : 'transparent',
    color: active ? '#fff' : '#64748B',
    border: 'none',
  })

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
          <a href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>← Reports</a>
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
            >{title} ✏️</span>
          )}
          <span style={{
            background: '#F1F5F9', color: '#64748B',
            fontSize: '11px', fontWeight: 600,
            padding: '3px 8px', borderRadius: '20px',
          }}>DRAFT</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {saved && <span style={{ fontSize: '13px', color: '#2D8C4E', fontWeight: 500 }}>✓ Saved</span>}
          <button onClick={handleSave} style={{
            background: 'none', border: '1px solid #E2E8F0',
            borderRadius: '8px', padding: '8px 16px',
            fontSize: '13px', cursor: 'pointer', color: '#64748B',
          }}>Save Draft</button>
          <button
            onClick={handleGeneratePDF}
            disabled={generating}
            style={{
              background: generating ? '#94A3B8' : '#2D8C4E',
              color: '#fff', border: 'none', borderRadius: '8px',
              padding: '8px 16px', fontSize: '13px',
              fontWeight: 600, cursor: generating ? 'not-allowed' : 'pointer',
            }}
          >{generating ? 'Generating...' : 'Generate PDF'}</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E2E8F0',
        padding: '8px 24px', display: 'flex', gap: '8px',
      }}>
        <button style={tabStyle(activeTab === 'details')} onClick={() => setActiveTab('details')}>
          📋 Client & Site Info
        </button>
        <button style={tabStyle(activeTab === 'system')} onClick={() => setActiveTab('system')}>
          🔧 Sewer System Info
        </button>
        <button style={tabStyle(activeTab === 'conditions')} onClick={() => setActiveTab('conditions')}>
          🔍 Pipe Conditions {defects.length > 0 && `(${defects.length})`}
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* TAB 1 — Client & Site Info */}
        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '20px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                  File & Client Information
                </h3>
                {[
                  { label: 'File Number', key: 'fileNumber', placeholder: 'McNeil/1590' },
                  { label: 'Client Name', key: 'clientName', placeholder: 'Justin McNeil' },
                  { label: 'Property Address', key: 'location', placeholder: '1590 Main St, Las Vegas NV' },
                  { label: 'Buyer\'s Agent', key: 'buyersAgent', placeholder: 'Agent name' },
                  { label: 'People Present', key: 'peoplePresent', placeholder: 'Client, Home Inspector, Buyers Agent' },
                ].map(({ label, key, placeholder }) => (
                  <div key={key} style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>{label}</label>
                    <input
                      type="text"
                      value={details[key as keyof typeof details] as string}
                      onChange={e => updateDetail(key, e.target.value)}
                      placeholder={placeholder}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={labelStyle}>Inspection Date</label>
                    <input
                      type="date"
                      value={details.inspectedAt}
                      onChange={e => updateDetail('inspectedAt', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Time</label>
                    <input
                      type="time"
                      value={details.inspectionTime}
                      onChange={e => updateDetail('inspectionTime', e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Inspector Name</label>
                  <input
                    type="text"
                    value={details.inspector}
                    onChange={e => updateDetail('inspector', e.target.value)}
                    placeholder="Inspector full name"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Building Occupied</label>
                  <select
                    value={details.buildingOccupied}
                    onChange={e => updateDetail('buildingOccupied', e.target.value)}
                    style={inputStyle}
                  >
                    <option>Yes</option>
                    <option>No</option>
                    <option>Unknown</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Weather / Soil Conditions</label>
                  <input
                    type="text"
                    value={details.weather}
                    onChange={e => updateDetail('weather', e.target.value)}
                    placeholder="e.g. Sunny, 90-100°F, ground dry at surface"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Right column — property photo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '20px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                  Property Photo
                </h3>
                {propertyPhoto ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={propertyPhoto}
                      alt="Property"
                      style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '240px' }}
                    />
                    <button
                      onClick={() => setPropertyPhoto(null)}
                      style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: '#DC2626', color: '#fff', border: 'none',
                        borderRadius: '50%', width: '24px', height: '24px',
                        cursor: 'pointer', fontSize: '14px', fontWeight: 700,
                      }}
                    >×</button>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = e => handlePropertyPhoto((e.target as HTMLInputElement).files)
                      input.click()
                    }}
                    style={{
                      border: '2px dashed #E2E8F0', borderRadius: '8px',
                      padding: '40px 20px', textAlign: 'center',
                      cursor: 'pointer', background: '#F8FAFC',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏠</div>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                      Click to upload property photo
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      Shown on cover page of report
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '20px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                  General Notes / Comments
                </h3>
                <textarea
                  value={details.notes}
                  onChange={e => updateDetail('notes', e.target.value)}
                  placeholder="Add general notes, comments, or recommendations..."
                  rows={6}
                  style={{
                    ...inputStyle, height: 'auto',
                    padding: '10px 12px', resize: 'vertical', lineHeight: '1.6',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Sewer System Info */}
        {activeTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                Sewer System Details
              </h3>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Cleanout Location</label>
                <textarea
                  value={details.cleanoutLocation}
                  onChange={e => updateDetail('cleanoutLocation', e.target.value)}
                  placeholder="e.g. Located at front side of structure, left to main entry. Cleanout cap and riser were ABS material."
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Sewer Video Link (YouTube)</label>
                <input
                  type="text"
                  value={details.videoLink}
                  onChange={e => updateDetail('videoLink', e.target.value)}
                  placeholder="https://youtu.be/..."
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Camera Entry / Cleanout Type</label>
                <input
                  type="text"
                  value={details.fileNumber}
                  onChange={e => updateDetail('fileNumber', e.target.value)}
                  placeholder='e.g. 4" Cast Iron'
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{
              background: '#fff', border: '1px solid #E2E8F0',
              borderRadius: '12px', padding: '20px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                Pipe Materials Found
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {pipeMaterials.map(material => (
                  <button
                    key={material}
                    onClick={() => toggleMaterial(material)}
                    style={{
                      padding: '6px 12px', borderRadius: '20px', fontSize: '12px',
                      fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      background: details.pipeMaterials.includes(material) ? '#0F2A4A' : '#F1F5F9',
                      color: details.pipeMaterials.includes(material) ? '#fff' : '#64748B',
                      border: details.pipeMaterials.includes(material) ? '1px solid #0F2A4A' : '1px solid #E2E8F0',
                    }}
                  >
                    {details.pipeMaterials.includes(material) ? '✓ ' : ''}{material}
                  </button>
                ))}
              </div>
              {details.pipeMaterials.length > 0 && (
                <div style={{
                  marginTop: '16px', padding: '12px',
                  background: '#F8FAFC', borderRadius: '8px',
                  fontSize: '13px', color: '#0F2A4A',
                }}>
                  <strong>Selected:</strong> {details.pipeMaterials.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 — Pipe Conditions */}
        {activeTab === 'conditions' && (
          <div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>
                Pipe Conditions {defects.length > 0 && `(${defects.length})`}
              </h2>
              <button onClick={addDefect} style={{
                background: '#2D8C4E', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>+ Add Condition</button>
            </div>

            {defects.length === 0 && (
              <div style={{
                background: '#fff', border: '2px dashed #E2E8F0',
                borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '6px' }}>
                  No conditions added yet
                </div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
                  Add conditions observed during the inspection
                </div>
                <button onClick={addDefect} style={{
                  background: '#2D8C4E', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '10px 20px',
                  fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>Add First Condition</button>
              </div>
            )}

            {defects.map((defect, index) => (
              <div key={defect.id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', marginBottom: '16px', overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  borderBottom: defect.expanded ? '1px solid #F1F5F9' : 'none',
                  background: '#FAFAFA',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2A4A', minWidth: '32px' }}>
                    #{index + 1}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>@</span>
                    <input
                      value={defect.videoTime}
                      onChange={e => updateDefect(defect.id, 'videoTime', e.target.value)}
                      placeholder="05:32"
                      style={{ ...inputStyle, width: '70px' }}
                      title="Video timestamp"
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      value={defect.footage}
                      onChange={e => updateDefect(defect.id, 'footage', e.target.value)}
                      placeholder="13 ft"
                      style={{ ...inputStyle, width: '70px' }}
                      title="Footage distance"
                    />
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>approx.</span>
                  </div>

                  <select
                    value={defect.conditionType}
                    onChange={e => updateDefect(defect.id, 'conditionType', e.target.value)}
                    style={{ ...inputStyle, flex: 1, minWidth: '200px' }}
                  >
                    {conditionTypes.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>

                  <select
                    value={defect.severity}
                    onChange={e => updateDefect(defect.id, 'severity', e.target.value)}
                    style={{
                      ...inputStyle, width: '110px', flex: 'none',
                      background: severityColors[defect.severity]?.bg || '#F1F5F9',
                      color: severityColors[defect.severity]?.color || '#64748B',
                      fontWeight: 600,
                    }}
                  >
                    {['No Defect', 'Minor', 'Moderate', 'Major'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => toggleExpand(defect.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}
                  >{defect.expanded ? '▲' : '▼'}</button>
                  <button
                    onClick={() => deleteDefect(defect.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#DC2626' }}
                  >🗑</button>
                </div>

                {/* Body */}
                {defect.expanded && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Detailed Description / Narrative</label>
                      <textarea
                        value={defect.narrative}
                        onChange={e => updateDefect(defect.id, 'narrative', e.target.value)}
                        placeholder="e.g. Root intrusion; unable to determine where roots are originating. Cable or hydro jet to cut. Recommend spot patch to prevent re-growth."
                        rows={3}
                        style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
                      />
                    </div>

                    <label style={labelStyle}>Photos ({defect.images.length}/6)</label>
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
                        borderRadius: '8px', padding: '16px', textAlign: 'center',
                        background: dragOver === defect.id ? '#F0FDF4' : '#F8FAFC',
                        marginBottom: '12px', cursor: defect.images.length >= 6 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>📸</div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        {defect.images.length >= 6 ? 'Maximum 6 photos reached' : 'Drag & drop or click to upload inspection photos'}
                      </div>
                    </div>

                    {defect.images.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {defect.images.map((img, imgIndex) => (
                          <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3' }}>
                            <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{
                              position: 'absolute', top: '4px', left: '4px',
                              background: 'rgba(0,0,0,0.7)', color: '#fff',
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                            }}>{imgIndex + 1}</div>
                            <button
                              onClick={() => removeImage(defect.id, img.id)}
                              style={{
                                position: 'absolute', top: '4px', right: '4px',
                                background: '#DC2626', color: '#fff', border: 'none',
                                borderRadius: '50%', width: '20px', height: '20px',
                                cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                              }}
                            >×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {defects.length > 0 && (
              <button onClick={addDefect} style={{
                width: '100%', padding: '14px',
                border: '2px dashed #E2E8F0', borderRadius: '12px',
                background: 'none', cursor: 'pointer',
                fontSize: '14px', color: '#64748B', fontWeight: 500,
              }}>+ Add Another Condition</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}