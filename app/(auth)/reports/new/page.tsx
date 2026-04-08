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
  'Lead',
  'Stainless Steel',
  'Standard Dimensional Ratio (SDR)',
]

const severityColors: Record<string, { bg: string; color: string }> = {
  'No Defect': { bg: '#F0FDF4', color: '#16A34A' },
  'Minor': { bg: '#FFFBEB', color: '#D97706' },
  'Moderate': { bg: '#FFF7ED', color: '#EA580C' },
  'Major': { bg: '#FEF2F2', color: '#DC2626' },
  'Suggested Maintenance': { bg: '#F3F4F6', color: '#6B7280' },
}

export default function ReportBuilder() {
  const [title, setTitle] = useState('New Inspection Report')
  const [editingTitle, setEditingTitle] = useState(false)
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
    videoLinks: ['', '', '', ''] as string[],
    notes: '',
    endOfReportComments: '',
    correctiveActions: [] as { type: string; description: string }[],
  })

  const [propertyPhotos, setPropertyPhotos] = useState<string[]>([])
  const [defects, setDefects] = useState<Defect[]>([])
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'system' | 'conditions' | 'actions'>('details')

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
      videoTime: '', footage: '', conditionType: 'Select Condition Type',
      description: '', severity: 'Minor', narrative: '', images: [], expanded: true,
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

  const handlePropertyPhotos = (files: FileList | null) => {
    if (!files) return
    const remaining = 3 - propertyPhotos.length
    const toAdd = Array.from(files).slice(0, remaining)
    toAdd.forEach(f => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPropertyPhotos(p => [...p, e.target?.result as string])
      }
      reader.readAsDataURL(f)
    })
  }

  const removePropertyPhoto = (index: number) => {
    setPropertyPhotos(p => p.filter((_, i) => i !== index))
  }

  const handleGeneratePDF = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/reports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report: {
            ...details,
            videoLinks: details.videoLinks.filter(link => link.trim() !== ''),
            title,
            propertyPhotos
          },
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
    width: '100%', height: '38px', borderRadius: '6px',
    border: '1px solid #E2E8F0', padding: '0 12px',
    fontSize: '13px', color: '#0F172A', outline: 'none',
    boxSizing: 'border-box' as const, background: '#F8FAFC',
  }

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600 as const,
    color: '#64748B', marginBottom: '4px',
    textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  }

  const tabStyle = (active: boolean) => ({
    padding: '8px 16px', borderRadius: '6px', fontSize: '13px',
    fontWeight: 600 as const, cursor: 'pointer' as const,
    background: active ? '#0F2A4A' : 'transparent',
    color: active ? '#fff' : '#64748B', border: 'none',
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#F8FAFC', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E2E8F0',
        padding: '12px 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="/" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>← Reports</a>
          <span style={{ color: '#E2E8F0' }}>|</span>
          {editingTitle ? (
            <input
              autoFocus value={title}
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
            fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px',
          }}>DRAFT</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        <button style={tabStyle(activeTab === 'actions')} onClick={() => setActiveTab('actions')}>
          ✅ Corrective Actions
        </button>
      </div>

      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>

        {/* TAB 1 — Client & Site Info */}
        {activeTab === 'details' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                  File & Client Information
                </h3>
                {[
                  { label: 'File Number', key: 'fileNumber', placeholder: 'McNeil/1590' },
                  { label: 'Client Name', key: 'clientName', placeholder: 'Justin McNeil' },
                  { label: 'Property Address', key: 'location', placeholder: '1590 Main St, Las Vegas NV' },
                  { label: "Buyer's Agent", key: 'buyersAgent', placeholder: 'Agent name' },
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
                    <input type="date" value={details.inspectedAt} onChange={e => updateDetail('inspectedAt', e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Inspection Time</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="text"
                        value={details.inspectionTime.split(':')[0] || ''}
                        onChange={e => {
                          const hours = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const currentTime = details.inspectionTime.split(':')
                          const newTime = `${hours}:${currentTime[1] || '00'}`
                          updateDetail('inspectionTime', newTime)
                        }}
                        placeholder="HH"
                        style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 8px', fontSize: '13px', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '16px', fontWeight: 'bold' }}>:</span>
                      <input
                        type="text"
                        value={details.inspectionTime.split(':')[1]?.split(' ')[0] || ''}
                        onChange={e => {
                          const minutes = e.target.value.replace(/\D/g, '').slice(0, 2)
                          const currentTime = details.inspectionTime.split(':')
                          const ampm = currentTime[1]?.split(' ')[1] || 'AM'
                          const newTime = `${currentTime[0] || '00'}:${minutes} ${ampm}`
                          updateDetail('inspectionTime', newTime)
                        }}
                        placeholder="MM"
                        style={{ width: '40px', height: '38px', borderRadius: '6px', border: '1px solid #E2E8F0', padding: '0 8px', fontSize: '13px', textAlign: 'center' }}
                      />
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          onClick={() => {
                            const time = details.inspectionTime.split(' ')
                            updateDetail('inspectionTime', `${time[0]} AM`)
                          }}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #E2E8F0',
                            background: details.inspectionTime.includes('AM') ? '#2D8C4E' : '#F8FAFC',
                            color: details.inspectionTime.includes('AM') ? '#fff' : '#64748B',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >AM</button>
                        <button
                          onClick={() => {
                            const time = details.inspectionTime.split(' ')
                            updateDetail('inspectionTime', `${time[0]} PM`)
                          }}
                          style={{
                            padding: '6px 8px',
                            border: '1px solid #E2E8F0',
                            background: details.inspectionTime.includes('PM') ? '#2D8C4E' : '#F8FAFC',
                            color: details.inspectionTime.includes('PM') ? '#fff' : '#64748B',
                            borderRadius: '4px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >PM</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Inspector Name</label>
                  <input type="text" value={details.inspector} onChange={e => updateDetail('inspector', e.target.value)} placeholder="Inspector full name" style={inputStyle} />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Building Occupied</label>
                  <select value={details.buildingOccupied} onChange={e => updateDetail('buildingOccupied', e.target.value)} style={inputStyle}>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Unknown</option>
                  </select>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Weather / Soil Conditions</label>
                  <input type="text" value={details.weather} onChange={e => updateDetail('weather', e.target.value)} placeholder="e.g. Sunny, 80-90°F, soil dry at the surface" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 4px' }}>
                  Property Photos
                </h3>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '12px' }}>
                  Up to 3 photos — shown on cover page
                </p>

                {/* Upload zone */}
                {propertyPhotos.length < 3 && (
                  <div
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.multiple = true
                      input.onchange = e => handlePropertyPhotos((e.target as HTMLInputElement).files)
                      input.click()
                    }}
                    style={{
                      border: '2px dashed #E2E8F0', borderRadius: '8px',
                      padding: '24px 20px', textAlign: 'center',
                      cursor: 'pointer', background: '#F8FAFC', marginBottom: '12px',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏠</div>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>
                      Click to upload property photos
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      {propertyPhotos.length}/3 photos added
                    </div>
                  </div>
                )}

                {/* Photo grid */}
                {propertyPhotos.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    {propertyPhotos.map((photo, index) => (
                      <div key={index} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={photo} alt={`Property ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => removePropertyPhoto(index)}
                          style={{
                            position: 'absolute', top: '4px', right: '4px',
                            background: '#DC2626', color: '#fff', border: 'none',
                            borderRadius: '50%', width: '20px', height: '20px',
                            cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                          }}
                        >×</button>
                        <div style={{
                          position: 'absolute', bottom: '4px', left: '4px',
                          background: 'rgba(0,0,0,0.6)', color: '#fff',
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        }}>Photo {index + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                  General Notes / Comments
                </h3>
                <textarea
                  value={details.notes}
                  onChange={e => updateDetail('notes', e.target.value)}
                  placeholder="Add general notes, comments, or recommendations..."
                  rows={6}
                  style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Sewer System Info */}
        {activeTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                Sewer System Details
              </h3>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Cleanout Location</label>
                <textarea
                  value={details.cleanoutLocation}
                  onChange={e => updateDetail('cleanoutLocation', e.target.value)}
                  placeholder="e.g. Located at front side of structure, left to main entry."
                  rows={3}
                  style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Sewer Video Links (YouTube)</label>
                {[0, 1, 2, 3].map(index => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={details.videoLinks[index] || ''}
                      onChange={e => {
                        const newLinks = [...details.videoLinks]
                        newLinks[index] = e.target.value
                        setDetails(p => ({ ...p, videoLinks: newLinks }))
                      }}
                      placeholder={`Link ${index + 1}: https://youtu.be/...`}
                      style={inputStyle}
                    />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Camera Entry / Cleanout Type</label>
                <input type="text" value={details.fileNumber} onChange={e => updateDetail('fileNumber', e.target.value)} placeholder='e.g. 4" Cast Iron' style={inputStyle} />
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
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
                      fontWeight: 600, cursor: 'pointer',
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
                <div style={{ marginTop: '16px', padding: '12px', background: '#F8FAFC', borderRadius: '8px', fontSize: '13px', color: '#0F2A4A' }}>
                  <strong>Selected:</strong> {details.pipeMaterials.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3 — Pipe Conditions */}
        {activeTab === 'conditions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>
                Pipe Conditions {defects.length > 0 && `(${defects.length})`}
              </h2>
              <button onClick={addDefect} style={{
                background: '#2D8C4E', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>+ Add Condition</button>
            </div>

            {defects.length === 0 && (
              <div style={{
                background: '#fff', border: '2px dashed #E2E8F0',
                borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '6px' }}>No conditions added yet</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>Add conditions observed during the inspection</div>
                <button onClick={addDefect} style={{
                  background: '#2D8C4E', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                }}>Add First Condition</button>
              </div>
            )}

            {defects.map((defect, index) => (
              <div key={defect.id} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', marginBottom: '16px', overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px',
                  borderBottom: defect.expanded ? '1px solid #F1F5F9' : 'none',
                  background: '#FAFAFA', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F2A4A', minWidth: '32px' }}>#{index + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>@</span>
                    <input value={defect.videoTime} onChange={e => updateDefect(defect.id, 'videoTime', e.target.value)} placeholder="05:32" style={{ ...inputStyle, width: '70px' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input value={defect.footage} onChange={e => updateDefect(defect.id, 'footage', e.target.value)} placeholder="13 ft" style={{ ...inputStyle, width: '70px' }} />
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>approx.</span>
                  </div>
                  <select value={defect.conditionType} onChange={e => updateDefect(defect.id, 'conditionType', e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: '200px' }}>
                    {conditionTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
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
                    {['No Defect', 'Minor', 'Moderate', 'Major', 'Suggested Maintenance'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => toggleExpand(defect.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748B' }}>
                    {defect.expanded ? '▲' : '▼'}
                  </button>
                  <button onClick={() => deleteDefect(defect.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#DC2626' }}>
                    🗑
                  </button>
                </div>

                {defect.expanded && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={labelStyle}>Detailed Description / Narrative</label>
                      <textarea
                        value={defect.narrative}
                        onChange={e => updateDefect(defect.id, 'narrative', e.target.value)}
                        placeholder="e.g. Root intrusion; unable to determine where roots are originating. Cable or hydro jet to cut."
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
                width: '100%', padding: '14px', border: '2px dashed #E2E8F0',
                borderRadius: '12px', background: 'none', cursor: 'pointer',
                fontSize: '14px', color: '#64748B', fontWeight: 500,
              }}>+ Add Another Condition</button>
            )}
          </div>
        )}

        {/* TAB 4 — Corrective Actions */}
        {activeTab === 'actions' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>
                Corrective Actions & Recommendations
              </h2>
              <button
                onClick={() => {
                  setDetails(p => ({
                    ...p,
                    correctiveActions: [...p.correctiveActions, { type: '', description: '' }]
                  }))
                }}
                style={{
                  background: '#2D8C4E', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                }}
              >+ Add Action</button>
            </div>

            {details.correctiveActions.length === 0 && (
              <div style={{
                background: '#fff', border: '2px dashed #E2E8F0',
                borderRadius: '12px', padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F2A4A', marginBottom: '6px' }}>No corrective actions added yet</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>Add recommended corrective actions and repairs</div>
                <button
                  onClick={() => {
                    setDetails(p => ({
                      ...p,
                      correctiveActions: [{ type: 'Recommended Repair', description: 'Full evaluation and/or corrections with written findings and costs to cure by a competent licensed plumbing contractor.' }]
                    }))
                  }}
                  style={{
                    background: '#2D8C4E', color: '#fff', border: 'none',
                    borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                  }}
                >Add Default Actions</button>
              </div>
            )}

            {details.correctiveActions.map((action, index) => (
              <div key={index} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', marginBottom: '16px', padding: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>
                    Action #{index + 1}
                  </h3>
                  <button
                    onClick={() => {
                      setDetails(p => ({
                        ...p,
                        correctiveActions: p.correctiveActions.filter((_, i) => i !== index)
                      }))
                    }}
                    style={{
                      background: '#DC2626', color: '#fff', border: 'none',
                      borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer',
                    }}
                  >Remove</button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>Action Type</label>
                  <select
                    value={action.type}
                    onChange={e => {
                      const newActions = [...details.correctiveActions]
                      newActions[index].type = e.target.value
                      setDetails(p => ({ ...p, correctiveActions: newActions }))
                    }}
                    style={inputStyle}
                  >
                    <option value="">Select Action Type</option>
                    <option value="Immediate Repair">Immediate Repair</option>
                    <option value="Scheduled Maintenance">Scheduled Maintenance</option>
                    <option value="Further Evaluation">Further Evaluation</option>
                    <option value="Monitor Condition">Monitor Condition</option>
                    <option value="Professional Consultation">Professional Consultation</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    value={action.description}
                    onChange={e => {
                      const newActions = [...details.correctiveActions]
                      newActions[index].description = e.target.value
                      setDetails(p => ({ ...p, correctiveActions: newActions }))
                    }}
                    placeholder="Describe the recommended corrective action..."
                    rows={3}
                    style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
                  />
                </div>
              </div>
            ))}

            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', marginTop: '24px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F2A4A', margin: '0 0 16px' }}>
                End of Report Comments
              </h3>
              <textarea
                value={details.endOfReportComments}
                onChange={e => updateDetail('endOfReportComments', e.target.value)}
                placeholder="Add final comments or recommendations for the end of the report..."
                rows={4}
                style={{ ...inputStyle, height: 'auto', padding: '10px 12px', resize: 'vertical', lineHeight: '1.6' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}