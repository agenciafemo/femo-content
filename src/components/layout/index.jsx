import { useState } from 'react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-home', section: 'Visão geral' },
  { id: 'clientes', label: 'Meus clientes', icon: 'ti-building', section: 'Clientes', badge: true },
  { id: 'briefing', label: 'Novo briefing', icon: 'ti-file-description', section: null },
  { id: 'diagnostico', label: 'Diagnóstico', icon: 'ti-chart-bar', section: null },
  { id: 'planejar', label: 'Planejar mês', icon: 'ti-layout-grid', section: 'Criar', dot: 'ora' },
  { id: 'videos', label: 'Vídeos', icon: 'ti-video', section: null, badge: true },
  { id: 'carrosseis', label: 'Carrosséis', icon: 'ti-layout-columns', section: null, badge: true },
  { id: 'relatorios', label: 'Performance', icon: 'ti-chart-line', section: 'Relatórios', dot: 'green' },
  { id: 'banco', label: 'Banco do criador', icon: 'ti-bulb', section: 'Base', badge: true },
  { id: 'formatos', label: 'Formatos', icon: 'ti-list', section: null },
  { id: 'teste', label: 'Teste API', icon: 'ti-flask-2', section: 'Desenvolvimento' },
]

const BADGES = { clientes: 3, videos: 8, carrosseis: 8, banco: 6 }

export function Sidebar({ ativo, onNav }) {
  return (
    <aside style={{
      width: 220, background: '#161616',
      borderRight: '0.5px solid #272727',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0
    }}>
      <div style={{
        padding: '18px 14px 14px',
        borderBottom: '0.5px solid #272727',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 30, height: 30, background: '#FF6B00',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <i className="ti ti-brain" style={{ fontSize: 16, color: '#fff' }} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', letterSpacing: '0.02em' }}>FEMO CONTENT</div>
          <div style={{ fontSize: 10, color: '#555' }}>Cérebro criativo</div>
        </div>
      </div>

      <nav style={{ padding: '10px 8px', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item, idx) => {
          const prevSection = idx > 0 ? NAV_ITEMS[idx - 1].section : null
          const showSection = item.section && item.section !== prevSection

          return (
            <div key={item.id}>
              {showSection && (
                <div style={{
                  fontSize: 10, color: '#555',
                  padding: '8px 8px 4px',
                  letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>{item.section}</div>
              )}
              <button
                onClick={() => onNav(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 6,
                  cursor: 'pointer', fontSize: 12,
                  color: ativo === item.id ? '#FF8C33' : '#9A9A9A',
                  marginBottom: 1, border: 'none', width: '100%', textAlign: 'left',
                  background: ativo === item.id ? '#FF6B0018' : 'none',
                  outline: ativo === item.id ? '0.5px solid #FF6B0040' : 'none',
                  fontWeight: ativo === item.id ? 500 : 400,
                  fontFamily: 'inherit'
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 14, flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && BADGES[item.id] && (
                  <span style={{
                    fontSize: 10, background: ativo === item.id ? '#FF6B0018' : '#272727',
                    color: ativo === item.id ? '#FF8C33' : '#9A9A9A',
                    borderRadius: 10, padding: '1px 6px'
                  }}>{BADGES[item.id]}</span>
                )}
                {item.dot === 'ora' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF6B00' }} />
                )}
                {item.dot === 'green' && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
                )}
              </button>
            </div>
          )
        })}
      </nav>

      <div style={{
        padding: '12px 14px',
        borderTop: '0.5px solid #272727',
        display: 'flex', alignItems: 'center', gap: 8
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: '#FF6B0018', border: '1px solid #FF6B0040',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 500, color: '#FF8C33', flexShrink: 0
        }}>FE</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#E0E0E0' }}>FEMO Agency</div>
          <div style={{ fontSize: 10, color: '#555' }}>Administrador</div>
        </div>
      </div>
    </aside>
  )
}

export function Topbar({ title, subtitle, children }) {
  return (
    <div style={{
      padding: '12px 20px',
      borderBottom: '0.5px solid #272727',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: '#161616', flexShrink: 0
    }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{subtitle}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {children}
      </div>
    </div>
  )
}

export function Notification({ msg, tipo }) {
  if (!msg) return null
  const colors = {
    ok:      { bg: '#22C55E18', border: '#22C55E', text: '#4ADE80' },
    warn:    { bg: '#F59E0B18', border: '#F59E0B', text: '#FBBF24' },
    erro:    { bg: '#EF444418', border: '#EF4444', text: '#F87171' },
    loading: { bg: '#FF6B0018', border: '#FF6B00', text: '#FF8C33' }
  }
  const c = colors[tipo] || colors.ok
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      background: c.bg, border: `0.5px solid ${c.border}`,
      color: c.text, padding: '10px 14px',
      borderRadius: 10, fontSize: 13,
      display: 'flex', alignItems: 'center', gap: 8
    }}>
      {tipo === 'loading' && <span className="spin" />}
      {msg}
    </div>
  )
}

export function OraBtn({ children, onClick, disabled, style = {} }) {
  return (
    <button className="btn-ora" onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}

export function GhostBtn({ children, onClick, style = {} }) {
  return (
    <button className="btn-ghost" onClick={onClick} style={style}>
      {children}
    </button>
  )
}
