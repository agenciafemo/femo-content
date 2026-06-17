import { useState } from 'react'
import { useBriefing } from '../../hooks'
import { OraBtn, GhostBtn } from '../layout'

const TONS = [
  { id: 'sofisticado',  nome: 'Sofisticado',      desc: 'Elegante, maduro, seletivo' },
  { id: 'tecnico',      nome: 'Técnico e direto',  desc: 'Preciso, sem rodeios' },
  { id: 'caloroso',     nome: 'Caloroso e humano', desc: 'Próximo, acolhedor' },
  { id: 'inspirador',   nome: 'Inspirador',        desc: 'Motivacional, aspiracional' },
  { id: 'educativo',    nome: 'Educativo',         desc: 'Didático, confiável' },
  { id: 'irreverente',  nome: 'Irreverente',       desc: 'Ousado, descontraído' },
]

const OBJETIVOS = [
  { id: 'autoridade', icon: 'ti-crown',         label: 'Construir autoridade' },
  { id: 'audiencia',  icon: 'ti-users',          label: 'Crescer audiência' },
  { id: 'vendas',     icon: 'ti-coin',           label: 'Gerar vendas diretas' },
  { id: 'engajamento',icon: 'ti-heart',          label: 'Engajamento e comunidade' },
  { id: 'educar',     icon: 'ti-school',         label: 'Educar o público' },
  { id: 'premium',    icon: 'ti-diamond',        label: 'Posicionamento premium' },
]

const REGRAS_CFM = [
  'Proibido garantir resultados de procedimentos ou tratamentos',
  'Proibido uso de imagens "antes e depois" de pacientes',
  'Proibido divulgar preços, promoções ou descontos de procedimentos médicos',
  'Proibido usar "o melhor médico", "especialista número 1" ou superlativos',
  'Proibido mencionar nomes de pacientes sem autorização expressa documentada',
  'Proibido comparações depreciativas com outros profissionais',
  'Proibido anunciar especialidade não reconhecida pelo CFM',
  'Proibido induzir paciente a procedimentos desnecessários',
  'Todo conteúdo deve ter caráter educativo, não publicitário direto',
]

export function BriefingForm({ onSalvar }) {
  const { loading, perfilIG, briefing, buscarInstagram, atualizarBriefing } = useBriefing()
  const [igHandle, setIgHandle] = useState('')
  const [igBuscado, setIgBuscado] = useState(false)
  const [proibList, setProibList] = useState([])
  const [proibInput, setProibInput] = useState('')
  const [kwList, setKwList] = useState([])
  const [kwInput, setKwInput] = useState('')
  const [tomSel, setTomSel] = useState('')
  const [objSel, setObjSel] = useState([])

  async function handleBuscarIG() {
    if (!igHandle) return
    const handle = igHandle.replace('@', '').trim()
    await buscarInstagram(handle, briefing.nicho || '')
    setIgBuscado(true)
    if (briefing.palavras_chave) setKwList(briefing.palavras_chave)
  }

  function addProib(e) {
    if (e.key === 'Enter' && proibInput.trim()) {
      setProibList(p => [...p, proibInput.trim()])
      setProibInput('')
    }
  }

  function addKw(e) {
    if (e.key === 'Enter' && kwInput.trim()) {
      setKwList(p => [...p, kwInput.trim()])
      setKwInput('')
    }
  }

  function toggleObj(id) {
    setObjSel(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id])
  }

  function handleSalvar() {
    const completo = {
      ...briefing,
      tom_voz: tomSel,
      objetivos: objSel,
      nunca_usar: proibList,
      palavras_chave: kwList,
      instagram_handle: igHandle.replace('@', '').trim()
    }
    onSalvar?.(completo)
  }

  const progress = [
    briefing.nome, briefing.nicho, briefing.dor_publica, briefing.desejo_secreto,
    tomSel, briefing.produto, briefing.diferencial, briefing.cta_keyword, kwList.length
  ].filter(Boolean).length

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{ height: 3, background: '#272727', borderRadius: 2, marginBottom: 16 }}>
        <div style={{ height: '100%', background: '#FF6B00', borderRadius: 2, width: `${Math.round((progress / 9) * 100)}%`, transition: 'width .3s' }} />
      </div>

      {/* Instagram */}
      <div className="sec">Instagram — busca automática</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input-dark"
            value={igHandle}
            onChange={e => setIgHandle(e.target.value)}
            placeholder="@handle do cliente"
            onKeyDown={e => e.key === 'Enter' && handleBuscarIG()}
          />
          <OraBtn onClick={handleBuscarIG} disabled={loading} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {loading ? <span className="spin" /> : <i className="ti ti-search" />}
            Buscar
          </OraBtn>
        </div>

        {igBuscado && perfilIG && (
          <div style={{ marginTop: 12, padding: 12, background: '#1E1E1E', borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className="cli-av av-o" style={{ fontSize: 13 }}>{perfilIG.nome?.slice(0, 2).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{perfilIG.nome}</div>
                <div style={{ fontSize: 11, color: '#9A9A9A' }}>{perfilIG.nicho_confirmado}</div>
              </div>
              {perfilIG.is_medico && (
                <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 100, background: '#EF444418', color: '#F87171', border: '0.5px solid #EF4444' }}>
                  <i className="ti ti-shield" style={{ fontSize: 10, marginRight: 3 }} />Médico — CFM ativo
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {perfilIG.palavras_chave?.map(kw => (
                <span key={kw} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: '#22C55E18', color: '#4ADE80' }}>{kw}</span>
              ))}
            </div>
            <OraBtn onClick={() => { atualizarBriefing({ nome: perfilIG.nome, nicho: perfilIG.nicho_confirmado, tom_voz: perfilIG.tom_aparente, medico: perfilIG.is_medico, especialidade_medica: perfilIG.especialidade_medica }); setKwList(perfilIG.palavras_chave || []); setTomSel(perfilIG.tom_aparente || '') }} style={{ width: '100%', justifyContent: 'center' }}>
              <i className="ti ti-download" /> Aplicar ao briefing
            </OraBtn>
          </div>
        )}
      </div>

      {/* Identidade */}
      <div className="sec">Identidade</div>
      <div className="grid2">
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Nome do cliente</label>
          <input className="input-dark" value={briefing.nome || ''} onChange={e => atualizarBriefing({ nome: e.target.value })} placeholder="Ex: Clínica Bella Vita" />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Nicho</label>
          <input className="input-dark" value={briefing.nicho || ''} onChange={e => atualizarBriefing({ nicho: e.target.value })} placeholder="Ex: Estética e saúde" />
        </div>
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Posicionamento em uma frase</label>
        <input className="input-dark" value={briefing.posicionamento || ''} onChange={e => atualizarBriefing({ posicionamento: e.target.value })} placeholder="Ex: Clínica premium para mulheres que valorizam resultado real" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Área de atuação</label>
        <select className="input-dark" value={briefing.area || ''} onChange={e => atualizarBriefing({ area: e.target.value, medico: ['medico', 'dentista'].includes(e.target.value) })}>
          <option value="">Selecione...</option>
          <option value="medico">Médico / medicina</option>
          <option value="dentista">Dentista / odontologia</option>
          <option value="estetica">Estética (não médica)</option>
          <option value="nutri">Nutricionista / saúde</option>
          <option value="outro">Outro</option>
        </select>
      </div>

      {/* Público */}
      <div className="sec">Público-alvo</div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Dor principal do público</label>
        <textarea className="input-dark" rows={2} value={briefing.dor_publica || ''} onChange={e => atualizarBriefing({ dor_publica: e.target.value })} placeholder="Ex: Não consegue resultado real, desconfia de promessas vazias..." />
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Desejo secreto do público</label>
        <textarea className="input-dark" rows={2} value={briefing.desejo_secreto || ''} onChange={e => atualizarBriefing({ desejo_secreto: e.target.value })} placeholder="O que eles realmente querem mas não dizem..." />
        <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>Usado nos prompts de Vendas e Quebra de Padrão</div>
      </div>

      {/* Tom */}
      <div className="sec">Tom de voz</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        {TONS.map(t => (
          <div key={t.id} onClick={() => setTomSel(t.id)} style={{
            background: tomSel === t.id ? '#FF6B0018' : '#1E1E1E',
            border: tomSel === t.id ? '1px solid #FF6B00' : '0.5px solid #333',
            borderRadius: 8, padding: '8px 10px', cursor: 'pointer'
          }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{t.nome}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{t.desc}</div>
          </div>
        ))}
      </div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Pode usar</label>
          <textarea className="input-dark" rows={2} value={briefing.pode_usar || ''} onChange={e => atualizarBriefing({ pode_usar: e.target.value })} placeholder="Ex: linguagem sofisticada, referências culturais..." />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Nunca usar</label>
          <textarea className="input-dark" rows={2} value={briefing.nunca_usar_texto || ''} onChange={e => atualizarBriefing({ nunca_usar_texto: e.target.value })} placeholder="Ex: clichês, emojis, gírias..." />
        </div>
      </div>

      {/* Palavras-chave */}
      <div className="sec">Palavras-chave</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: '#9A9A9A', marginBottom: 8 }}>Extraídas do Instagram + adicionadas manualmente</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {kwList.map(kw => (
            <span key={kw} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: '#FF6B0018', color: '#FF8C33', border: '0.5px solid #FF6B0040', display: 'flex', alignItems: 'center', gap: 4 }}>
              {kw}
              <i className="ti ti-x" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setKwList(p => p.filter(k => k !== kw))} />
            </span>
          ))}
        </div>
        <input className="input-dark" value={kwInput} onChange={e => setKwInput(e.target.value)} onKeyDown={addKw} placeholder="Digite uma palavra-chave e pressione Enter" />
      </div>

      {/* Produto */}
      <div className="sec">Produto / serviço</div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Produto ou serviço principal</label>
        <input className="input-dark" value={briefing.produto || ''} onChange={e => atualizarBriefing({ produto: e.target.value })} placeholder="Ex: Tratamentos de bioestimulação facial" />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Grande diferencial</label>
        <textarea className="input-dark" rows={2} value={briefing.diferencial || ''} onChange={e => atualizarBriefing({ diferencial: e.target.value })} placeholder="O que só você entrega..." />
      </div>

      {/* Objetivos */}
      <div className="sec">Objetivos de conteúdo</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12 }}>
        {OBJETIVOS.map(o => (
          <div key={o.id} onClick={() => toggleObj(o.id)} style={{
            background: objSel.includes(o.id) ? '#FF6B0018' : '#1E1E1E',
            border: objSel.includes(o.id) ? '1px solid #FF6B00' : '0.5px solid #333',
            borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8
          }}>
            <i className={`ti ${o.icon}`} style={{ fontSize: 15, color: objSel.includes(o.id) ? '#FF8C33' : '#555' }} />
            <span style={{ fontSize: 12, color: '#fff' }}>{o.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="sec">CTA</div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Palavra-chave do CTA</label>
          <input className="input-dark" value={briefing.cta_keyword || ''} onChange={e => atualizarBriefing({ cta_keyword: e.target.value })} placeholder="Ex: ESSÊNCIA / OPERA" />
          <div style={{ fontSize: 10, color: '#555', marginTop: 3 }}>Usada nos prompts de Quebra de Padrão e Vendas</div>
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 4 }}>Ação principal desejada</label>
          <select className="input-dark" value={briefing.acao_cta || ''} onChange={e => atualizarBriefing({ acao_cta: e.target.value })}>
            <option value="">Selecione...</option>
            <option>Enviar mensagem no DM</option>
            <option>Clicar no link da bio</option>
            <option>Salvar o post</option>
            <option>Agendar consulta</option>
          </select>
        </div>
      </div>

      {/* Restrições */}
      <div className="sec">Expressões proibidas</div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {proibList.map(p => (
            <span key={p} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 100, background: '#F59E0B18', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 4 }}>
              {p}
              <i className="ti ti-x" style={{ fontSize: 10, cursor: 'pointer' }} onClick={() => setProibList(l => l.filter(x => x !== p))} />
            </span>
          ))}
        </div>
        <input className="input-dark" value={proibInput} onChange={e => setProibInput(e.target.value)} onKeyDown={addProib} placeholder="Digite e pressione Enter" />
      </div>

      {/* CFM */}
      {briefing.medico && (
        <>
          <div className="sec">Regras do CFM — compliance médico</div>
          <div style={{ background: '#EF444408', border: '0.5px solid #EF4444', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <i className="ti ti-shield" style={{ fontSize: 15, color: '#F87171' }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#F87171' }}>Restrições automáticas — Res. CFM nº 1.974/2011</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 100, background: '#EF444418', color: '#F87171' }}>Fixo e bloqueado</span>
            </div>
            {REGRAS_CFM.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, fontSize: 11, color: '#F87171', lineHeight: 1.4 }}>
                <i className="ti ti-x" style={{ fontSize: 11, flexShrink: 0, marginTop: 1 }} />
                {r}
              </div>
            ))}
            <div style={{ fontSize: 10, color: '#F87171', marginTop: 8, paddingTop: 6, borderTop: '0.5px solid #EF444430' }}>
              A IA aplica estas regras automaticamente em todos os roteiros deste cliente.
            </div>
          </div>
        </>
      )}

      <div style={{ display: 'flex', gap: 8, paddingBottom: 20 }}>
        <OraBtn onClick={handleSalvar} style={{ flex: 1, justifyContent: 'center' }}>
          <i className="ti ti-check" /> Salvar cliente
        </OraBtn>
        <GhostBtn>
          <i className="ti ti-sparkles" /> Preencher com IA ↗
        </GhostBtn>
      </div>
    </div>
  )
}
