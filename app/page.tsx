export default function Home() {
  return (
    <main>
      <h1>Welcome to My New Site!</h1>
      <p>This is no longer the default page.</p>
    </main>
  );
}
'use client'
import { useState } from 'react'

const stats = [
  { label: 'Total Reports', value: '24', icon: '📄' },
  { label: 'Completed This Month', value: '8', icon: '✅' },
  { label: 'Drafts', value: '5', icon: '📝' },
  { label: 'Templates Used', value: '3', icon: '📋' },
]

const reports = [
  { title: 'Main St Inspection', job: 'JOB-001', client: 'City Council', date: '30 Mar 2026', status: 'Complete' },
  { title: 'Harbor Rd Survey', job: 'JOB-002', client: 'Port Authority', date: '29 Mar 2026', status: 'Draft' },
  { title: 'Oak Ave Pipeline', job: 'JOB-003', client: 'Waterworks Ltd', date: '28 Mar 2026', status: 'Draft' },
  { title: 'Central Park Drain', job: 'JOB-004', client: 'Parks Dept', date: '27 Mar 2026', status: 'Complete' },
  { title: 'West End Sewer', job: 'JOB-005', client: 'BuildCo', date: '26 Mar 2026', status: 'Archived' },
]

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#F8FAFC' }}>

      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? '240px' : '0',
        minHeight: '100vh',
        background: '#0F2A4A',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
        flexShrink: 0,
      }}>

        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', whiteSpace: 'nowrap' }}>
          <div style={{ fontSize: '22px', fontWeight: 900 }}>
            <span style={{ color: '#ffffff' }}>SEWER </span>
            <span style={{ color: '#2D8C4E' }}>LABZ</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
            Inspection Platform
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {[
            { icon: '⊞', label: 'Dashboard', href: '/', active: true },
            { icon: '📄', label: 'Reports', href: '/reports/new', active: false },
            { icon: '📋', label: 'Templates', href: '/templates', active: false },
            { icon: '⚙️', label: 'Settings', href: '#', active: false },
          ].map(item => (
            <div
              key={item.label}
              onClick={() => window.location.href = item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                marginBottom: '4px',
                background: item.active ? '#2D8C4E' : 'transparent',
                color: item.active ? '#fff' : 'rgba(255,255,255,0.65)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontSize: '14px',
                fontWeight: item.active ? 600 : 400,
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#2D8C4E', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff', fontWeight: 700,
              fontSize: '14px', flexShrink: 0,
            }}>AR</div>
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>Ajay Raymon</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Admin</div>
            </div>
          </div>
          <button style={{
            marginTop: '12px', width: '100%', padding: '8px',
            borderRadius: '6px', background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.6)', fontSize: '12px',
            textAlign: 'center', cursor: 'pointer', border: 'none',
          }}>Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #E2E8F0',
          padding: '16px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748B' }}
            >☰</button>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>Dashboard</h1>
          </div>
          <button
            onClick={() => window.location.href = '/reports/new'}
            style={{
              background: '#2D8C4E', color: '#fff', border: 'none',
              padding: '9px 18px', borderRadius: '8px', fontSize: '14px',
              fontWeight: 600, cursor: 'pointer',
            }}
          >+ New Report</button>
        </div>

        {/* Trial banner */}
        <div style={{
          background: '#FFFBEB', borderBottom: '1px solid #FDE68A',
          padding: '10px 24px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ color: '#92400E', fontSize: '14px' }}>
            ⚠️ You have <strong>5 days</strong> left on your free trial.
          </span>
          <button style={{
            background: '#2D8C4E', color: '#fff', border: 'none',
            padding: '6px 14px', borderRadius: '6px',
            fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>Subscribe Now</button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1 }}>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {stats.map(stat => (
              <div key={stat.label} style={{
                background: '#fff', border: '1px solid #E2E8F0',
                borderRadius: '12px', padding: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#0F2A4A' }}>{stat.value}</div>
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#E8F5EE', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>{stat.icon}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #E2E8F0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F2A4A', margin: 0 }}>Recent Reports</h2>
              <span style={{ fontSize: '13px', color: '#2D8C4E', cursor: 'pointer', fontWeight: 500 }}>View all →</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  {['Report Title', 'Job #', 'Client', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: 'left', fontSize: '12px',
                      fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 600, color: '#0F2A4A' }}>{r.title}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748B' }}>{r.job}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748B' }}>{r.client}</td>
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#64748B' }}>{r.date}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                        background: r.status === 'Complete' ? '#E8F5EE' : r.status === 'Draft' ? '#F1F5F9' : '#EFF6FF',
                        color: r.status === 'Complete' ? '#2D8C4E' : r.status === 'Draft' ? '#64748B' : '#0F2A4A',
                      }}>{r.status}</span>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['View', 'Edit'].map(action => (
                          <button key={action} style={{
                            background: 'none', border: '1px solid #E2E8F0',
                            borderRadius: '6px', padding: '5px 10px',
                            fontSize: '12px', cursor: 'pointer',
                            color: '#64748B', fontWeight: 500,
                          }}>{action}</button>
                        ))}
                        <button style={{
                          background: '#2D8C4E', border: 'none',
                          borderRadius: '6px', padding: '5px 10px',
                          fontSize: '12px', cursor: 'pointer',
                          color: '#fff', fontWeight: 500,
                        }}>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}