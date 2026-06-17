import { useState } from 'react'
import { useRelatorio } from '../../hooks'
import { OraBtn, GhostBtn } from '../layout'

const PLAT_CONFIG = {
  google_ads:  { icon: 'ti-search',          cor: '#FF8C33', bg: '#FF6B0018', nome: 'Google Ads',       fillC: '#FF6B00' },
  ga4:         { icon: 'ti-chart-line',       cor: '#4ADE80', bg: '#22C55E12', nome: 'Google Analytics', fillC: '#22C55E' },
  instagram:   { icon: 'ti-brand-instagram',  cor: '#F472B6', bg: '#EC489912', nome: 'Instagram',        fillC: '#EC4899' },
  meta_ads:    { icon: 'ti-brand-facebook',   cor: '#60A5FA', bg: '#3B82F618', nome: 'Meta Ads',         fillC: '#3B82F6' },
  linkedin:    { icon: 'ti-brand-linkedin',   cor: '#38BDF8', bg: '#0EA5E912', nome: 'LinkedIn',         fillC: '#0EA5E9' },
}

const SCORES_MOCK = { google_ads: 78, ga4: 65, instagram: 62, meta_ads: 71, linkedin: 44 }

const CLIENTES = [
  { id: 'bella', ini: 'CB', nome: 'Clínica Bella Vita', cls: 'av-o', contas: { googleAdsCustomerId: '123', ga4PropertyId: 'properties/456', igUserId: '789' } },
  { id: 'tech',  ini: 'TF', nome: 'TechFlow SaaS',     cls: 'av-b', contas: {} },
  { id: 'pad',   ini: 'PM', nome: 'Padaria Artesanal Mór', cls: 'av-g', contas: {} },
]

export function Relatorios({ onNotif }) {
  const [cliente, setCliente] = useState(CLIENTES[0])
  const [platAtiva, setPlatAtiva] = useState('overview')
  const [analiseTexto, setAnaliseTexto] = useState('')
  const { loading, dados, analiseIA, buscarTodos } = useRelatorio()

  async function handleAtualizar() {
    onNotif('Buscando dados de todas as plataformas...', 'loading')
    try {
      await buscarTodos(cliente, cliente.contas)
      onNotif('Relatório atualizado!', 'ok')
    } catch {
      onNotif('Usando dados de demonstração', 'warn')
    }
  }

  const relatorio = dados || {
    google_ads:  { impressoes: 48200, cliques: 1840, ctr: 0.0382, investimento: 2840, conversoes: 187, custo_conversao: 15.19 },
    ga4:         { sessoes: 3240, usuarios_ativos: 2180, tempo_medio: 134, taxa_engajamento: 0.41 },
    instagram:   { insights: { seguidores: 12400, alcance: 48600, impressoes: 124000, taxa_engajamento: 0.048 } },
    meta_ads:    { investimento: 1980, alcance: 84200, frequencia: 2.4, ctr: 0.0147, leads: 125 },
    linkedin:    { pagina: { seguidores: 1840, taxa_engajamento: 0.012 } }
  }

  const analise = analiseIA || analiseTexto

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
        <select className="input-dark" style={{ flex: 1 }} value={cliente.id} onChange={e => setCliente(CLIENTES.find(c => c.id === e.target.value))}>
          {CLIENTES.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
        <select className="input-dark" style={{ width: 140 }}>
          <option>Junho 2026</option>
          <option>Maio 2026</option>
          <option>Últimos 30 dias</option>
          <option>Últimos 90 dias</option>
        </select>
        <GhostBtn onClick={handleAtualizar} disabled={loading}>
          {loading ? <span className="spin" /> : <i className="ti ti-refresh" />}
          {loading ? 'Buscando...' : 'Atualizar'}
        </GhostBtn>
        <OraBtn onClick={() => onNotif('Gerando PDF...', 'loading')}>
          <i className="ti ti-file-text" /> Exportar PDF
        </OraBtn>
      </div>

      {/* Nav plataformas */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
        {[{ id: 'overview', label: 'Resumo' }, ...Object.entries(PLAT_CONFIG).map(([id, p]) => ({ id, label: p.nome }))].map(p => (
          <button key={p.id} onClick={() => setPlatAtiva(p.id)} style={{
            padding: '6px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 11,
            background: platAtiva === p.id ? '#FF6B00' : '#1E1E1E',
            color: platAtiva === p.id ? '#fff' : '#9A9A9A',
            fontFamily: 'inherit', fontWeight: platAtiva === p.id ? 500 : 400
          }}>{p.label}</button>
        ))}
      </div>

      {/* Overview */}
      {platAtiva === 'overview' && (
        <>
          <div className="grid4">
            {[
              { val: `R$${((relatorio.google_ads?.investimento || 0) + (relatorio.meta_ads?.investimento || 0)).toLocaleString('pt-BR')}`, label: 'Investimento total', delta: 'Google + Meta', cls: 'd-neu' },
              { val: relatorio.google_ads?.conversoes || 0, label: 'Conversões', delta: '+18% vs mai', cls: 'd-ok' },
              { val: `R$${(relatorio.google_ads?.custo_conversao || 0).toFixed(2)}`, label: 'Custo/conversão', delta: 'meta: R$20', cls: 'd-ok' },
              { val: `${((relatorio.instagram?.insights?.taxa_engajamento || 0) * 100).toFixed(1)}%`, label: 'Eng. Instagram', delta: '+0.6%', cls: 'd-ok' },
            ].map(m => (
              <div className="met" key={m.label}>
                <div className="met-val">{m.val}</div>
                <div className="met-label">{m.label}</div>
                <div className={`met-delta ${m.cls}`}>{m.delta}</div>
              </div>
            ))}
          </div>
          <div className="insight"><i className="ti ti-bulb" /> Google Ads com melhor ROI — CPL 23% abaixo da meta. Meta Ads com frequência 2.4x — recomendado trocar criativos. LinkedIn em aquecimento.</div>
          <div className="grid2">
            <div>
              <div className="sec">Performance por canal</div>
              <div className="card">
                {Object.entries(PLAT_CONFIG).map(([id, p]) => (
                  <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #272727' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`ti ${p.icon}`} style={{ fontSize: 14, color: p.cor }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: '#fff', marginBottom: 3 }}>{p.nome}</div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${SCORES_MOCK[id]}%`, background: p.fillC }} /></div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#FF8C33' }}>{SCORES_MOCK[id]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="sec">Análise do gestor</div>
              <div className="card" style={{ marginBottom: 8 }}>
                <textarea
                  className="input-dark"
                  rows={7}
                  value={analise || ''}
                  onChange={e => setAnaliseTexto(e.target.value)}
                  placeholder="Escreva sua análise estratégica do mês ou clique em 'Analisar com IA' para gerar automaticamente..."
                  style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 12 }}
                />
              </div>
              <GhostBtn style={{ width: '100%', justifyContent: 'center' }}>
                <i className="ti ti-sparkles" /> Analisar com IA ↗
              </GhostBtn>
            </div>
          </div>
        </>
      )}

      {/* Google Ads */}
      {platAtiva === 'google_ads' && (
        <>
          <div className="grid3">
            {[
              { val: relatorio.google_ads?.impressoes?.toLocaleString('pt-BR') || '48.2k', label: 'Impressões', delta: '+12%', cls: 'd-ok' },
              { val: relatorio.google_ads?.cliques?.toLocaleString('pt-BR') || '1.840', label: 'Cliques', delta: '+8%', cls: 'd-ok' },
              { val: `${((relatorio.google_ads?.ctr || 0.038) * 100).toFixed(2)}%`, label: 'CTR', delta: 'acima da média', cls: 'd-ok' },
              { val: `R$${(relatorio.google_ads?.custo_conversao || 15.19).toFixed(2)}`, label: 'Custo/conversão', delta: 'meta: R$20', cls: 'd-ok' },
              { val: relatorio.google_ads?.conversoes || 187, label: 'Conversões', delta: '+22%', cls: 'd-ok' },
              { val: `R$${(relatorio.google_ads?.investimento || 2840).toLocaleString('pt-BR')}`, label: 'Investimento', delta: 'orçado: R$3k', cls: 'd-neu' },
            ].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
          <div className="sec">Top palavras-chave por conversão</div>
          <div className="card">
            {[
              ['harmonização facial preço', 62], ['clínica estética', 48],
              ['bioestimulação facial', 31], ['botox perto de mim', 22], ['preenchimento labial', 14]
            ].map(([kw, conv], i) => (
              <div key={kw} className="row-item">
                <span className="row-num">{i + 1}</span>
                <span className="row-label">{kw}</span>
                <span className={`tag ${i < 3 ? 'tag-ok' : 'tag-warn'}`}>{conv} conv.</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* GA4 */}
      {platAtiva === 'ga4' && (
        <>
          <div className="grid4">
            {[
              { val: relatorio.ga4?.sessoes?.toLocaleString('pt-BR') || '3.240', label: 'Sessões', delta: '+14%', cls: 'd-ok' },
              { val: relatorio.ga4?.usuarios_ativos?.toLocaleString('pt-BR') || '2.180', label: 'Usuários ativos', delta: '+9%', cls: 'd-ok' },
              { val: `${Math.floor((relatorio.ga4?.tempo_medio || 134) / 60)}min ${(relatorio.ga4?.tempo_medio || 134) % 60}s`, label: 'Tempo médio', delta: '-18s vs mai', cls: 'd-warn' },
              { val: `${((relatorio.ga4?.taxa_engajamento || 0.41) * 100).toFixed(0)}%`, label: 'Taxa engajamento', delta: 'meta: 55%', cls: 'd-warn' },
            ].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
          <div className="sec">Origem do tráfego</div>
          <div className="card">
            {[['Google Ads (pago)', 56, '#FF6B00'], ['Instagram', 22, '#EC4899'], ['Google Orgânico', 12, '#22C55E'], ['Direto', 7, '#888'], ['Outros', 3, '#555']].map(([label, pct, cor]) => (
              <div key={label} className="bar-row">
                <span className="bar-label">{label}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%`, background: cor }} /></div>
                <span className="bar-val">{pct}%</span>
              </div>
            ))}
          </div>
          <div className="sec">Eventos de conversão</div>
          <div className="grid3">
            {[{ val: 284, label: 'Cliques WhatsApp', delta: '+31%', cls: 'd-ok' }, { val: 97, label: 'Formulários', delta: '+18%', cls: 'd-ok' }, { val: 43, label: 'Agendamentos', delta: '-4%', cls: 'd-bad' }].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
        </>
      )}

      {/* Instagram */}
      {platAtiva === 'instagram' && (
        <>
          <div className="grid4">
            {[
              { val: (relatorio.instagram?.insights?.seguidores || 12400).toLocaleString('pt-BR'), label: 'Seguidores', delta: '+312 este mês', cls: 'd-ok' },
              { val: (relatorio.instagram?.insights?.alcance || 48600).toLocaleString('pt-BR'), label: 'Alcance total', delta: '+22%', cls: 'd-ok' },
              { val: (relatorio.instagram?.insights?.impressoes || 124000).toLocaleString('pt-BR'), label: 'Impressões', delta: '+18%', cls: 'd-ok' },
              { val: `${((relatorio.instagram?.insights?.taxa_engajamento || 0.048) * 100).toFixed(1)}%`, label: 'Engajamento', delta: 'média: 3.2%', cls: 'd-ok' },
            ].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
          <div className="grid2">
            <div>
              <div className="sec">Top posts do mês</div>
              <div className="card">
                {[['Reel — Quebra de padrão: autoridade real', '8.4k', 'tag-ok'], ['Carrossel — 3 mitos sobre harmonização', '6.1k', 'tag-ok'], ['Reel — Storytelling: paciente que adiou', '5.8k', 'tag-ok'], ['Stories — bastidores do procedimento', '2.2k', 'tag-warn']].map(([t, v, c], i) => (
                  <div key={t} className="row-item">
                    <span className="row-num">{i + 1}</span>
                    <span className="row-label">{t}</span>
                    <span className={`tag ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="sec">Dados demográficos</div>
              <div className="card">
                {[['Feminino', 78, '#D4537E'], ['25–34 anos', 42, '#FF6B00'], ['35–44 anos', 31, '#378ADD'], ['São Paulo', 58, '#22C55E']].map(([l, p, c]) => (
                  <div key={l} className="bar-row">
                    <span className="bar-label">{l}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${p}%`, background: c }} /></div>
                    <span className="bar-val">{p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Meta Ads */}
      {platAtiva === 'meta_ads' && (
        <>
          <div className="grid4">
            {[
              { val: `R$${(relatorio.meta_ads?.investimento || 1980).toLocaleString('pt-BR')}`, label: 'Investido', delta: 'orçado: R$2k', cls: 'd-neu' },
              { val: (relatorio.meta_ads?.alcance || 84200).toLocaleString('pt-BR'), label: 'Alcance', delta: '+8%', cls: 'd-ok' },
              { val: `${(relatorio.meta_ads?.frequencia || 2.4).toFixed(1)}x`, label: 'Frequência', delta: 'ideal: 1.8–2.2x', cls: 'd-warn' },
              { val: relatorio.meta_ads?.leads || 125, label: 'Leads gerados', delta: '+16%', cls: 'd-ok' },
            ].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
          <div className="insight"><i className="ti ti-alert-triangle" style={{ color: '#FBBF24' }} /> Frequência acima do ideal (2.4x). Sinal de saturação de audiência. Recomendado expandir público ou trocar criativos.</div>
          <div className="sec">Campanhas por objetivo</div>
          <div className="card">
            {[['Conversão — Agendamentos', '82 leads • R$24,15/lead', 'tag-ok'], ['Tráfego — Landing Page', '43 leads • R$46,05/lead', 'tag-warn'], ['Engajamento — Posts', '+1.2k interações', 'tag-ok']].map(([t, v, c], i) => (
              <div key={t} className="row-item">
                <span className="row-num">{i + 1}</span>
                <span className="row-label">{t}</span>
                <span className={`tag ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* LinkedIn */}
      {platAtiva === 'linkedin' && (
        <>
          <div className="grid4">
            {[
              { val: (relatorio.linkedin?.pagina?.seguidores || 1840).toLocaleString('pt-BR'), label: 'Seguidores', delta: '+124 este mês', cls: 'd-ok' },
              { val: '4.200', label: 'Visualizações', delta: '+32%', cls: 'd-ok' },
              { val: '84', label: 'Cliques botão', delta: '+18%', cls: 'd-ok' },
              { val: `${((relatorio.linkedin?.pagina?.taxa_engajamento || 0.012) * 100).toFixed(1)}%`, label: 'Engajamento', delta: 'em crescimento', cls: 'd-warn' },
            ].map(m => <div className="met" key={m.label}><div className="met-val">{m.val}</div><div className="met-label">{m.label}</div><div className={`met-delta ${m.cls}`}>{m.delta}</div></div>)}
          </div>
          <div className="grid2">
            <div>
              <div className="sec">Posts com melhor desempenho</div>
              <div className="card">
                {[['O erro que impede autoridade real no Instagram', '1.2k'], ['Estratégia de conteúdo para clínicas em 2026', '840'], ['Bastidores da campanha de junho', '312']].map(([t, v], i) => (
                  <div key={t} className="row-item">
                    <span className="row-num">{i + 1}</span>
                    <span className="row-label">{t}</span>
                    <span className="row-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="sec">Perfil dos seguidores</div>
              <div className="card">
                {[['Medicina / saúde', 44, '#FF6B00'], ['Sênior / diretor', 38, '#3B82F6'], ['Empresas 11–50', 52, '#22C55E'], ['São Paulo', 61, '#F59E0B']].map(([l, p, c]) => (
                  <div key={l} className="bar-row">
                    <span className="bar-label">{l}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${p}%`, background: c }} /></div>
                    <span className="bar-val">{p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
