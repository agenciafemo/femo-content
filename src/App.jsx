import { useState } from 'react'
import './styles.css'
import { Sidebar, Topbar, Notification } from './components/layout'
import { Dashboard } from './components/layout/Dashboard'
import { BriefingForm } from './components/clientes/BriefingForm'
import { Planejador } from './components/criador/Planejador'
import { Relatorios } from './components/relatorios/Relatorios'
import { BancoCriador } from './components/banco/BancoCriador'
import { TesteAPI } from './components/TesteAPI'

const TB_META = {
  dashboard:   { title: 'Dashboard',         sub: 'Visão geral — Junho 2026',                 btnLabel: 'Nova criação' },
  clientes:    { title: 'Meus clientes',      sub: '3 clientes com briefings completos',       btnLabel: 'Novo cliente' },
  briefing:    { title: 'Novo briefing',      sub: 'Busque o @ para pré-preencher',            btnLabel: 'Preencher com IA ↗' },
  diagnostico: { title: 'Diagnóstico',        sub: 'Análise completa com Gemini',              btnLabel: 'Exportar PDF' },
  planejar:    { title: 'Planejar mês',       sub: 'Claude distribui temas e gera roteiros',   btnLabel: 'Iniciar' },
  videos:      { title: 'Vídeos',             sub: '8 vídeos pendentes — Clínica Bella Vita',  btnLabel: 'Gerar roteiro ↗' },
  carrosseis:  { title: 'Carrosséis',         sub: '8 carrosséis pendentes',                   btnLabel: 'Gerar carrossel ↗' },
  relatorios:  { title: 'Relatórios',         sub: 'Performance multicanal — Junho 2026',      btnLabel: 'Exportar PDF' },
  banco:       { title: 'Banco do criador',   sub: 'Ideias, ganchos, referências e estruturas',btnLabel: 'Adicionar' },
  formatos:    { title: 'Formatos treinados', sub: '12 formatos — 6 vídeos + 6 carrosséis',    btnLabel: 'Ver detalhes' },
  teste:       { title: 'Teste API',          sub: 'Verificar conexão Frontend ↔ Backend',     btnLabel: '🧪 Testar' },
}

const FORMATOS_LISTA = [
  { id: 'qp', label: 'Quebra de padrão', cls: 'fp-qp', desc: 'Hook confrontador → desconstrução → tese → CTA', dur: '45–60s', slides: '6 slides' },
  { id: 'ed', label: 'Educativo',        cls: 'fp-ed', desc: 'Fato impactante → 3 pontos → insight', dur: '60s–3min', slides: '7 slides' },
  { id: 'st', label: 'Storytelling',     cls: 'fp-st', desc: 'Personagem real → negligência → analogia → CTA', dur: '30s–1.5min', slides: '7 slides' },
  { id: 'rf', label: 'Reflexão',         cls: 'fp-rf', desc: 'Contraditório → helicóptero → trend → virada', dur: '30–60s', slides: '6 slides' },
  { id: 'vd', label: 'Vendas',           cls: 'fp-vd', desc: 'Conexão emocional → SPIN → proposta → fechamento', dur: '45–90s', slides: '8 slides' },
  { id: 'pf', label: 'Profundidade',     cls: 'fp-pf', desc: 'Gancho visceral → aforismo → síntese → desfecho', dur: '60s–2min', slides: '6 slides' },
]

export default function App() {
  const [painel, setPainel] = useState('dashboard')
  const [notif, setNotif] = useState(null)

  function mostrarNotif(msg, tipo = 'ok') {
    setNotif({ msg, tipo })
    setTimeout(() => setNotif(null), 4000)
  }

  const meta = TB_META[painel] || TB_META.dashboard
  const showPlanejador = ['planejar', 'videos', 'carrosseis'].includes(painel)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Notification msg={notif?.msg} tipo={notif?.tipo} />
      <Sidebar ativo={painel} onNav={setPainel} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar title={meta.title} subtitle={meta.sub}>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => mostrarNotif('IA auxiliar ↗', 'loading')}>
            <i className="ti ti-sparkles" style={{ fontSize: 12 }} /> IA ↗
          </button>
          <button className="btn-ora" style={{ fontSize: 12 }}>
            <i className="ti ti-sparkles" style={{ fontSize: 13 }} /> {meta.btnLabel}
          </button>
        </Topbar>

        {painel === 'dashboard'   && <Dashboard onNav={setPainel} />}
        {painel === 'briefing'    && <BriefingForm onSalvar={b => { mostrarNotif(`"${b.nome}" salvo!`, 'ok'); setPainel('clientes') }} />}
        {showPlanejador           && <Planejador onNotif={mostrarNotif} />}
        {painel === 'relatorios'  && <Relatorios onNotif={mostrarNotif} />}
        {painel === 'banco'       && <BancoCriador onNotif={mostrarNotif} />}
        {painel === 'teste'       && <div style={{ flex: 1, overflowY: 'auto' }}><TesteAPI /></div>}

        {painel === 'clientes' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div className="insight"><i className="ti ti-building" /> 3 clientes com briefing completo. Diagnóstico disponível para todos.</div>
            <div className="sec">Clientes cadastrados</div>
            {[
              { ini: 'CB', nome: 'Clínica Bella Vita',    meta: '@clinicabellavita • Estética • Sofisticado', score: 62, scCls: 'sc-med', avCls: 'av-o' },
              { ini: 'TF', nome: 'TechFlow SaaS',         meta: '@techflowsaas • B2B Tech • Técnico',         score: 44, scCls: 'sc-low', avCls: 'av-b' },
              { ini: 'PM', nome: 'Padaria Artesanal Mór', meta: '@padariaartesanalmor • Local • Caloroso',    score: 78, scCls: 'sc-ok',  avCls: 'av-g' },
            ].map(c => (
              <div key={c.nome} className="card" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div className={`cli-av ${c.avCls}`} style={{ width: 38, height: 38 }}>{c.ini}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: '#555' }}>{c.meta}</div>
                  </div>
                  <span className={`score-pill ${c.scCls}`}>{c.score} / 100</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => setPainel('diagnostico')}><i className="ti ti-chart-bar" style={{ fontSize: 13 }} /> Diagnóstico</button>
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => setPainel('planejar')}><i className="ti ti-layout-grid" style={{ fontSize: 13 }} /> Planejar</button>
                  <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={() => setPainel('relatorios')}><i className="ti ti-chart-line" style={{ fontSize: 13 }} /> Relatório</button>
                </div>
              </div>
            ))}
            <button className="btn-ora" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setPainel('briefing')}><i className="ti ti-plus" /> Novo cliente</button>
          </div>
        )}

        {painel === 'diagnostico' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div className="insight"><i className="ti ti-sparkles" /> Diagnóstico gerado pelo Gemini — análise de perfil Instagram + score por 6 dimensões + plano de ação.</div>
            <div className="sec">Diagnóstico por cliente</div>
            <div className="grid3">
              {[
                { ini: 'CB', nome: 'Clínica Bella Vita', score: 62, scCls: 'sc-med', avCls: 'av-o', dims: [70,55,48,65,58,72], clss: ['fill-med','fill-low','fill-low','fill-med','fill-med','fill-med'] },
                { ini: 'TF', nome: 'TechFlow SaaS',      score: 44, scCls: 'sc-low', avCls: 'av-b', dims: [40,38,35,45,32,50], clss: ['fill-low','fill-low','fill-low','fill-low','fill-low','fill-med'] },
                { ini: 'PM', nome: 'Padaria Artesanal',  score: 78, scCls: 'sc-ok',  avCls: 'av-g', dims: [82,80,72,88,75,70], clss: ['fill-ok','fill-ok','fill-med','fill-ok','fill-med','fill-med'] },
              ].map(c => (
                <div key={c.nome} className="card" style={{ cursor: 'pointer' }} onClick={() => mostrarNotif(`Abrindo diagnóstico de ${c.nome}...`, 'loading')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div className={`cli-av ${c.avCls}`}>{c.ini}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{c.nome}</div>
                    </div>
                    <span className={`score-pill ${c.scCls}`}>{c.score}</span>
                  </div>
                  {['Posicionamento','Qualidade','Frequência','Tom de voz','Engajamento','Métricas'].map((dim, i) => (
                    <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: '#555', width: 90 }}>{dim}</span>
                      <div className="bar-track" style={{ flex: 1 }}><div className={`bar-fill ${c.clss[i]}`} style={{ width: `${c.dims[i]}%` }} /></div>
                      <span style={{ fontSize: 10, color: '#555', minWidth: 20 }}>{c.dims[i]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button className="btn-ora" onClick={() => mostrarNotif('Gerando PDF...', 'loading')}><i className="ti ti-file-text" /> Exportar PDF</button>
          </div>
        )}

        {painel === 'formatos' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            <div className="grid2">
              {['Vídeos (6)', 'Carrosséis (6)'].map((tipo, ti) => (
                <div key={tipo}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8, fontWeight: 500 }}>{tipo}</div>
                  <div className="card" style={{ padding: '10px 14px' }}>
                    {FORMATOS_LISTA.map(f => (
                      <div key={f.id + ti} className="row-item">
                        <span className={`fmt-pill ${f.cls}`}>{f.label}</span>
                        <span style={{ flex: 1, fontSize: 11, color: '#9A9A9A', marginLeft: 6 }}>{f.desc}</span>
                        <span style={{ fontSize: 10, color: '#555' }}>{ti === 0 ? f.dur : f.slides}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
