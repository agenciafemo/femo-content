import { useState } from 'react'
import { usePlanejamento, useRoteiro } from '../../hooks'
import { OraBtn, GhostBtn } from '../layout'

const FORMATOS = [
  { id: 'quebra_padrao', label: 'Quebra de padrão', cls: 'fp-qp', desc: 'Hook confrontador → tese → CTA', dur: '45–60s', slides: '6 slides' },
  { id: 'educativo',     label: 'Educativo',        cls: 'fp-ed', desc: 'Fato impactante → 3 pontos → insight', dur: '60s–3min', slides: '7 slides' },
  { id: 'storytelling',  label: 'Storytelling',     cls: 'fp-st', desc: 'Personagem → analogia → CTA', dur: '30s–1.5min', slides: '7 slides' },
  { id: 'reflexao',      label: 'Reflexão',         cls: 'fp-rf', desc: 'Contraditório → helicóptero → virada', dur: '30–60s', slides: '6 slides' },
  { id: 'vendas',        label: 'Vendas',           cls: 'fp-vd', desc: 'SPIN → proposta → fechamento', dur: '45–90s', slides: '8 slides' },
  { id: 'profundidade',  label: 'Profundidade',     cls: 'fp-pf', desc: 'Gancho visceral → aforismo', dur: '60s–2min', slides: '6 slides' },
]

const CLIENTES_MOCK = [
  { id: 'bella', ini: 'CB', nome: 'Clínica Bella Vita', nicho: 'Estética', cls: 'av-o', briefing: { nome: 'Clínica Bella Vita', nicho: 'Estética e saúde', publico: 'Mulheres 25–44 anos, classe A/B', tom_voz: 'sofisticado', produto: 'Harmonização facial', diferencial: 'Protocolo exclusivo com resultado visível desde a 1ª sessão', desejo_secreto: 'Ser vista como sofisticada sem precisar justificar o investimento', cta_keyword: 'ESSÊNCIA', medico: false } },
  { id: 'tech',  ini: 'TF', nome: 'TechFlow SaaS', nicho: 'B2B Tech', cls: 'av-b', briefing: { nome: 'TechFlow SaaS', nicho: 'Tecnologia B2B', publico: 'Gestores e diretores de operação', tom_voz: 'tecnico', produto: 'Automação de processos', diferencial: 'Redução de 40% do tempo operacional em 90 dias', desejo_secreto: 'Escalar sem precisar contratar mais pessoas', cta_keyword: 'OPERA', medico: false } },
  { id: 'pad',   ini: 'PM', nome: 'Padaria Artesanal Mór', nicho: 'Local', cls: 'av-g', briefing: { nome: 'Padaria Artesanal Mór', nicho: 'Alimentação artesanal', publico: 'Moradores locais 30–50 anos', tom_voz: 'caloroso', produto: 'Pães e doces artesanais', diferencial: 'Fermentação natural 24h com ingredientes selecionados', desejo_secreto: 'Ritual de cuidado e pausa no dia a dia', cta_keyword: 'SABOR', medico: false } },
]

export function Planejador({ onNotif }) {
  const [etapa, setEtapa] = useState(1)
  const [cliente, setCliente] = useState(null)
  const [totalPosts, setTotalPosts] = useState(20)
  const [tipoSel, setTipoSel] = useState('video')
  const [formatoSel, setFormatoSel] = useState(null)
  const [tema, setTema] = useState('')
  const [roteiroGerado, setRoteiroGerado] = useState('')
  const { loading: loadPlan, distribuicao, gerarDistribuicao, aprovarTemas } = usePlanejamento()
  const { loading: loadRot, gerar: gerarRot, complianceCFM } = useRoteiro()

  const videos = Math.round(totalPosts / 2)
  const carrosseis = totalPosts - videos

  async function handleDistribuir() {
    if (!cliente) { onNotif('Selecione um cliente primeiro', 'warn'); return }
    onNotif('Distribuindo temas com Claude...', 'loading')
    await gerarDistribuicao(cliente.briefing, videos, carrosseis, [])
    onNotif('Distribuição gerada!', 'ok')
    setEtapa(3)
  }

  async function handleGerar() {
    if (!formatoSel || !tema) { onNotif('Selecione o formato e informe o tema', 'warn'); return }
    onNotif('Gerando roteiro com Claude...', 'loading')
    const dados = { tema, erro_mercado: tema, foco: tema, problema: tema, insight: tema }
    const resultado = await gerarRot(tipoSel, formatoSel, cliente.briefing, dados)
    setRoteiroGerado(resultado)
    if (complianceCFM && !complianceCFM.aprovado) {
      onNotif(`CFM: ${complianceCFM.violacoes?.length} item(s) a revisar`, 'warn')
    } else {
      onNotif('Roteiro gerado!', 'ok')
    }
    setEtapa(5)
  }

  const STEPS = ['Cliente', 'Volume', 'Distribuição', 'Gerar', 'Roteiro']

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'flex', marginBottom: 14 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            flex: 1, padding: '7px 4px', textAlign: 'center', fontSize: 11,
            color: etapa === i + 1 ? '#FF8C33' : etapa > i + 1 ? '#4ADE80' : '#555',
            background: etapa === i + 1 ? '#FF6B0018' : etapa > i + 1 ? '#22C55E0C' : '#1E1E1E',
            borderRight: i < STEPS.length - 1 ? '0.5px solid #272727' : 'none',
            borderRadius: i === 0 ? '6px 0 0 6px' : i === STEPS.length - 1 ? '0 6px 6px 0' : 0,
            fontWeight: etapa === i + 1 ? 500 : 400
          }}>
            {etapa > i + 1 ? <i className="ti ti-check" style={{ fontSize: 11 }} /> : s}
          </div>
        ))}
      </div>

      {/* Etapa 1: Cliente */}
      {etapa === 1 && (
        <>
          <div className="sec">Para qual cliente?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
            {CLIENTES_MOCK.map(c => (
              <div key={c.id} onClick={() => setCliente(c)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: cliente?.id === c.id ? '#FF6B0018' : '#161616',
                border: cliente?.id === c.id ? '1px solid #FF6B00' : '0.5px solid #272727'
              }}>
                <div className={`cli-av ${c.cls}`}>{c.ini}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.nome}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{c.nicho}</div>
                </div>
                {cliente?.id === c.id && <i className="ti ti-check" style={{ color: '#FF6B00' }} />}
              </div>
            ))}
          </div>
          <OraBtn onClick={() => { if (!cliente) { onNotif('Selecione um cliente', 'warn'); return }; setEtapa(2) }} style={{ width: '100%', justifyContent: 'center' }}>
            <i className="ti ti-arrow-right" /> Continuar
          </OraBtn>
        </>
      )}

      {/* Etapa 2: Volume */}
      {etapa === 2 && (
        <>
          <div className="sec">Volume mensal — {cliente?.nome}</div>
          <div className="grid3" style={{ marginBottom: 14 }}>
            <div className="met">
              <div style={{ fontSize: 11, color: '#555', marginBottom: 8, textAlign: 'center' }}>Total de posts</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <button className="btn-icon" onClick={() => setTotalPosts(p => Math.max(4, p - 2))}><i className="ti ti-minus" style={{ fontSize: 13 }} /></button>
                <div style={{ textAlign: 'center' }}>
                  <div className="met-val" style={{ fontSize: 24 }}>{totalPosts}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>posts/mês</div>
                </div>
                <button className="btn-icon" onClick={() => setTotalPosts(p => Math.min(60, p + 2))}><i className="ti ti-plus" style={{ fontSize: 13 }} /></button>
              </div>
            </div>
            <div className="met" style={{ textAlign: 'center' }}>
              <div className="met-label">Vídeos (50%)</div>
              <div className="met-val" style={{ marginTop: 8 }}>{videos}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Reels Instagram</div>
            </div>
            <div className="met" style={{ textAlign: 'center' }}>
              <div className="met-label">Carrosséis (50%)</div>
              <div className="met-val" style={{ marginTop: 8 }}>{carrosseis}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>posts Instagram</div>
            </div>
          </div>
          <div className="insight"><i className="ti ti-clock" /> IA verificará o histórico de temas usados e garantirá que nenhum tema se repita.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={() => setEtapa(1)}><i className="ti ti-arrow-left" /> Voltar</GhostBtn>
            <OraBtn onClick={handleDistribuir} disabled={loadPlan} style={{ flex: 1, justifyContent: 'center' }}>
              {loadPlan ? <span className="spin" /> : <i className="ti ti-sparkles" />} Distribuir com IA
            </OraBtn>
          </div>
        </>
      )}

      {/* Etapa 3: Distribuição */}
      {etapa === 3 && distribuicao && (
        <>
          <div className="sec">Distribuição sugerida — {videos} vídeos + {carrosseis} carrosséis</div>
          <div className="card" style={{ marginBottom: 12 }}>
            {FORMATOS.map(f => {
              const qv = distribuicao.videos?.filter(v => v.formato === f.id).length || 0
              const qc = distribuicao.carrosseis?.filter(c => c.formato === f.id).length || 0
              if (!qv && !qc) return null
              return (
                <div key={f.id} className="row-item">
                  <span className={`fmt-pill ${f.cls}`}>{f.label}</span>
                  <span className="row-label" style={{ fontSize: 11, color: '#555', marginLeft: 6 }}>Temas inéditos — sem repetição do histórico</span>
                  {qv > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: '#FF6B0018', color: '#FF8C33' }}>{qv} vídeo{qv > 1 ? 's' : ''}</span>}
                  {qc > 0 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: '#8B5CF618', color: '#A78BFA' }}>{qc} carrossel{qc > 1 ? 'is' : ''}</span>}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={() => setEtapa(2)}><i className="ti ti-arrow-left" /> Voltar</GhostBtn>
            <OraBtn onClick={() => { aprovarTemas(); setEtapa(4) }} style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-check" /> Aprovar e gerar roteiros
            </OraBtn>
          </div>
        </>
      )}

      {/* Etapa 4: Gerar roteiro */}
      {etapa === 4 && (
        <>
          <div className="sec">Gerar roteiro</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {['video', 'carrossel'].map(t => (
              <button key={t} onClick={() => setTipoSel(t)} style={{
                flex: 1, padding: '8px', borderRadius: 100, border: 'none', cursor: 'pointer',
                background: tipoSel === t ? '#FF6B00' : '#1E1E1E',
                color: tipoSel === t ? '#fff' : '#9A9A9A', fontSize: 13, fontFamily: 'inherit', fontWeight: 500
              }}>
                <i className={`ti ${t === 'video' ? 'ti-video' : 'ti-layout-columns'}`} style={{ marginRight: 6 }} />
                {t === 'video' ? 'Vídeo' : 'Carrossel'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {FORMATOS.map(f => (
              <div key={f.id} onClick={() => setFormatoSel(f.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px',
                borderRadius: 10, cursor: 'pointer',
                background: formatoSel === f.id ? '#FF6B0018' : '#1E1E1E',
                border: formatoSel === f.id ? '1px solid #FF6B00' : '0.5px solid transparent'
              }}>
                <span className={`fmt-pill ${f.cls}`}>{f.label}</span>
                <span style={{ flex: 1, fontSize: 11, color: '#9A9A9A' }}>{f.desc}</span>
                <span style={{ fontSize: 10, color: '#555' }}>{tipoSel === 'video' ? f.dur : f.slides}</span>
                {formatoSel === f.id && <i className="ti ti-check" style={{ color: '#FF6B00', fontSize: 14 }} />}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Tema do conteúdo</label>
            <input className="input-dark" value={tema} onChange={e => setTema(e.target.value)} placeholder="Ex: O erro que impede autoridade real no Instagram" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={() => setEtapa(3)}><i className="ti ti-arrow-left" /> Voltar</GhostBtn>
            <OraBtn onClick={handleGerar} disabled={loadRot || !formatoSel || !tema} style={{ flex: 1, justifyContent: 'center' }}>
              {loadRot ? <span className="spin" /> : <i className="ti ti-sparkles" />}
              {loadRot ? 'Gerando com Claude...' : 'Gerar roteiro'}
            </OraBtn>
          </div>
        </>
      )}

      {/* Etapa 5: Roteiro gerado */}
      {etapa === 5 && roteiroGerado && (
        <>
          <div className="sec">Roteiro gerado — {formatoSel?.replace('_', ' ')}</div>
          {complianceCFM && !complianceCFM.aprovado && (
            <div style={{ background: '#EF444408', border: '0.5px solid #EF4444', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#F87171', fontWeight: 500, marginBottom: 6 }}>
                <i className="ti ti-shield" style={{ marginRight: 6 }} />
                {complianceCFM.violacoes?.length} violação(ões) CFM detectada(s) — revise antes de publicar
              </div>
              {complianceCFM.violacoes?.map((v, i) => (
                <div key={i} style={{ fontSize: 11, color: '#F87171', marginBottom: 4 }}>
                  <strong>{v.regra}:</strong> {v.trecho} → {v.sugestao}
                </div>
              ))}
            </div>
          )}
          <div style={{ background: '#161616', border: '0.5px solid #272727', borderRadius: 10, padding: 14, marginBottom: 12, maxHeight: 380, overflowY: 'auto' }}>
            <pre style={{ fontSize: 12, color: '#E0E0E0', whiteSpace: 'pre-wrap', lineHeight: 1.7, fontFamily: 'inherit' }}>
              {roteiroGerado}
            </pre>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <GhostBtn onClick={() => { setEtapa(4); setRoteiroGerado('') }} style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-refresh" /> Gerar outro
            </GhostBtn>
            <OraBtn onClick={() => navigator.clipboard.writeText(roteiroGerado).then(() => onNotif('Copiado!', 'ok'))} style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-copy" /> Copiar roteiro
            </OraBtn>
          </div>
        </>
      )}
    </div>
  )
}
