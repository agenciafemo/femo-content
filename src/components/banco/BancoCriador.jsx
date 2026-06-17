import { useState } from 'react'
import { useBancoCriador } from '../../hooks'
import { OraBtn, GhostBtn } from '../layout'

const CATS = [
  { id: 'gancho',    label: 'Gancho',    cls: 'fp-qp' },
  { id: 'ideia',     label: 'Ideia',     cls: 'fp-rf' },
  { id: 'ref',       label: 'Referência',cls: 'fp-vd' },
  { id: 'estrutura', label: 'Estrutura', cls: 'fp-pf' },
]

const ENTRADAS_MOCK = [
  { id: 1, cat: 'gancho',    texto: 'Você não tem problema de visibilidade. Você tem problema de substância.',                     fonte: 'Próprio',        tags: ['quebra de padrão'], star: true },
  { id: 2, cat: 'gancho',    texto: 'Todo mundo quer 100k seguidores. Ninguém pergunta se esses 100k compram.',                    fonte: 'Referência',     tags: ['reflexão', 'vendas'], star: false },
  { id: 3, cat: 'ideia',     texto: 'Série sobre os bastidores de uma campanha do zero — da estratégia à publicação.',             fonte: 'Ideia própria',  tags: ['série', 'bastidores'], star: false },
  { id: 4, cat: 'ideia',     texto: 'Comparar marcas que cresceram com consistência vs marcas que apostaram em virais e sumiram.', fonte: 'Observação',     tags: ['posicionamento'], star: true },
  { id: 5, cat: 'ref',       texto: 'Hormozi — estrutura de vídeo: contexto 5s, problema 15s, solução 40s, CTA 5s.',              fonte: '@hormozi',       tags: ['estrutura', 'reels'], star: false },
  { id: 6, cat: 'estrutura', texto: 'Carrossel 5 atos: provocação → espelho → virada → aplicação → CTA com frase incompleta.',   fonte: 'Próprio',        tags: ['carrossel', 'swipe'], star: true },
]

export function BancoCriador({ onNotif }) {
  const [entradas, setEntradas] = useState(ENTRADAS_MOCK)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')
  const [adicionando, setAdicionando] = useState(false)
  const [novaEntrada, setNovaEntrada] = useState({ cat: 'gancho', texto: '', fonte: '', tags: '' })
  const { loading, sugestoes, sugerirEntradas } = useBancoCriador()

  const filtradas = entradas.filter(e => {
    if (filtro !== 'todos' && filtro !== e.cat) return false
    if (filtro === 'favoritos' && !e.star) return false
    if (busca && !e.texto.toLowerCase().includes(busca.toLowerCase())) return false
    return true
  })

  function toggleStar(id) {
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, star: !e.star } : e))
  }

  function deletar(id) {
    setEntradas(prev => prev.filter(e => e.id !== id))
  }

  function salvarNova() {
    if (!novaEntrada.texto.trim()) return
    setEntradas(prev => [{
      id: Date.now(),
      cat: novaEntrada.cat,
      texto: novaEntrada.texto,
      fonte: novaEntrada.fonte || 'Próprio',
      tags: novaEntrada.tags.split(',').map(t => t.trim()).filter(Boolean),
      star: false
    }, ...prev])
    setNovaEntrada({ cat: 'gancho', texto: '', fonte: '', tags: '' })
    setAdicionando(false)
    onNotif('Entrada adicionada!', 'ok')
  }

  async function handleSugerir() {
    onNotif('Gerando sugestões com Claude...', 'loading')
    try {
      const resultado = await sugerirEntradas(entradas, 'agência de marketing digital')
      const novas = resultado.map((s, i) => ({ id: Date.now() + i, ...s, tags: s.tags || [], star: false }))
      setEntradas(prev => [...novas, ...prev])
      onNotif(`${novas.length} sugestões adicionadas!`, 'ok')
    } catch {
      onNotif('Erro ao gerar sugestões', 'erro')
    }
  }

  const cats_filtro = [
    { id: 'todos', label: `Todos (${entradas.length})` },
    ...CATS.map(c => ({ id: c.id, label: `${c.label} (${entradas.filter(e => e.cat === c.id).length})` })),
    { id: 'favoritos', label: `Favoritos (${entradas.filter(e => e.star).length})` }
  ]

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <OraBtn onClick={() => setAdicionando(true)}><i className="ti ti-plus" /> Adicionar</OraBtn>
        <GhostBtn onClick={handleSugerir} disabled={loading}>
          {loading ? <span className="spin" /> : <i className="ti ti-sparkles" />}
          {loading ? 'Gerando...' : 'Sugerir com IA ↗'}
        </GhostBtn>
      </div>

      {adicionando && (
        <div className="card" style={{ marginBottom: 12, border: '0.5px solid #FF6B0040' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#FF8C33', marginBottom: 10 }}>Nova entrada</div>
          <div className="grid2" style={{ marginBottom: 8 }}>
            <div>
              <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 3 }}>Categoria</label>
              <select className="input-dark" value={novaEntrada.cat} onChange={e => setNovaEntrada(p => ({ ...p, cat: e.target.value }))}>
                {CATS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: '#9A9A9A', display: 'block', marginBottom: 3 }}>Fonte (opcional)</label>
              <input className="input-dark" value={novaEntrada.fonte} onChange={e => setNovaEntrada(p => ({ ...p, fonte: e.target.value }))} placeholder="Ex: @handle, Próprio..." />
            </div>
          </div>
          <textarea className="input-dark" rows={3} value={novaEntrada.texto} onChange={e => setNovaEntrada(p => ({ ...p, texto: e.target.value }))} placeholder="Cole ou digite aqui — ideia, frase, referência, estrutura..." style={{ marginBottom: 8 }} />
          <input className="input-dark" value={novaEntrada.tags} onChange={e => setNovaEntrada(p => ({ ...p, tags: e.target.value }))} placeholder="Tags separadas por vírgula: ex: carrossel, swipe, engajamento" style={{ marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <OraBtn onClick={salvarNova}><i className="ti ti-check" /> Salvar</OraBtn>
            <GhostBtn onClick={() => setAdicionando(false)}><i className="ti ti-x" /> Cancelar</GhostBtn>
          </div>
        </div>
      )}

      <input className="input-dark" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por texto ou tag..." style={{ marginBottom: 10 }} />

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
        {cats_filtro.map(c => (
          <button key={c.id} onClick={() => setFiltro(c.id)} style={{
            padding: '5px 11px', borderRadius: 100, border: 'none', cursor: 'pointer', fontSize: 11,
            background: filtro === c.id ? '#FF6B00' : '#1E1E1E',
            color: filtro === c.id ? '#fff' : '#9A9A9A', fontFamily: 'inherit'
          }}>{c.label}</button>
        ))}
      </div>

      {sugestoes.length > 0 && (
        <>
          <div className="sec">Sugestões da IA</div>
          {sugestoes.map((s, i) => {
            const cat = CATS.find(c => c.id === s.categoria) || CATS[0]
            return (
              <div key={i} className="card2" style={{ border: '0.5px solid #FF6B0030', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span className={`fmt-pill ${cat.cls}`}>{cat.label}</span>
                  <span style={{ flex: 1, fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{s.texto}</span>
                  <button className="btn-icon" onClick={() => { setEntradas(prev => [{ id: Date.now(), cat: s.categoria, texto: s.texto, fonte: 'IA', tags: s.tags || [], star: false }, ...prev]); onNotif('Adicionado!', 'ok') }}>
                    <i className="ti ti-plus" style={{ color: '#FF8C33' }} />
                  </button>
                </div>
              </div>
            )
          })}
        </>
      )}

      <div className="sec">Banco do criador — {filtradas.length} {filtradas.length === 1 ? 'entrada' : 'entradas'}</div>

      {filtradas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>
          <i className="ti ti-inbox" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
          <p style={{ fontSize: 12 }}>Nenhuma entrada encontrada</p>
        </div>
      )}

      {filtradas.map(e => {
        const cat = CATS.find(c => c.id === e.cat) || CATS[0]
        return (
          <div key={e.id} className="card" style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <span className={`fmt-pill ${cat.cls}`}>{cat.label}</span>
              <span style={{ flex: 1, fontSize: 12, color: '#E0E0E0', lineHeight: 1.5 }}>{e.texto}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => toggleStar(e.id)}>
                <i className="ti ti-star" style={{ fontSize: 15, color: e.star ? '#BA7517' : '#555' }} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10, color: '#555', display: 'flex', alignItems: 'center', gap: 3 }}>
                <i className="ti ti-link" style={{ fontSize: 10 }} />{e.fonte}
              </span>
              <div style={{ display: 'flex', gap: 3, flex: 1 }}>
                {e.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 100, background: '#272727', color: '#555' }}>{t}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => navigator.clipboard.writeText(e.texto).then(() => onNotif('Copiado!', 'ok'))}>
                  <i className="ti ti-copy" style={{ fontSize: 11 }} />
                </button>
                <button className="btn-icon" style={{ width: 24, height: 24 }} onClick={() => deletar(e.id)}>
                  <i className="ti ti-trash" style={{ fontSize: 11, color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
