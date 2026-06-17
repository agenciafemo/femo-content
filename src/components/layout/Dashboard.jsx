import { OraBtn, GhostBtn } from '../layout'

const CLIENTES_MOCK = [
  { id: 'bella', ini: 'CB', nome: 'Clínica Bella Vita', nicho: 'Estética e saúde', posts: 20, pendentes: 8, score: 62, cls: 'av-o sc-med' },
  { id: 'tech',  ini: 'TF', nome: 'TechFlow SaaS',     nicho: 'Tecnologia B2B',   posts: 12, pendentes: 12, score: 44, cls: 'av-b sc-low' },
  { id: 'pad',   ini: 'PM', nome: 'Padaria Artesanal Mór', nicho: 'Alimentação local', posts: 16, pendentes: 2, score: 78, cls: 'av-g sc-ok' },
]

const PLATAFORMAS = [
  { icon: 'ti-search',         cor: '#FF8C33', bg: '#FF6B0018', nome: 'Google Ads',       score: 78, fillW: '78%', fillC: '#FF6B00', tag: 'ROI ok',   tagCls: 'tag-ok' },
  { icon: 'ti-chart-line',     cor: '#4ADE80', bg: '#22C55E12', nome: 'Google Analytics', score: 65, fillW: '65%', fillC: '#22C55E', tag: 'CTR baixo',tagCls: 'tag-warn' },
  { icon: 'ti-brand-instagram',cor: '#F472B6', bg: '#EC489912', nome: 'Instagram',        score: 62, fillW: '62%', fillC: '#EC4899', tag: '4.8%',     tagCls: 'tag-ok' },
  { icon: 'ti-brand-facebook', cor: '#60A5FA', bg: '#3B82F618', nome: 'Meta Ads',         score: 71, fillW: '71%', fillC: '#3B82F6', tag: 'freq. alta',tagCls: 'tag-warn' },
  { icon: 'ti-brand-linkedin', cor: '#38BDF8', bg: '#0EA5E912', nome: 'LinkedIn',         score: 44, fillW: '44%', fillC: '#0EA5E9', tag: 'aquecendo',tagCls: 'tag-bad' },
]

export function Dashboard({ onNav }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{
        background: '#FF6B00', borderRadius: 10, padding: '16px 18px',
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 20
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#ffffffBB', marginBottom: 2 }}>Conteúdos planejados este mês</div>
          <div style={{ fontSize: 32, fontWeight: 500, color: '#fff' }}>16 posts</div>
          <div style={{ fontSize: 12, color: '#ffffffAA', marginTop: 2 }}>Clínica Bella Vita • 8 vídeos + 8 carrosséis</div>
          <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: '#ffffff22', color: '#fff' }}>8 gerados</span>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 100, background: '#ffffff22', color: '#fff' }}>8 pendentes</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#ffffffBB', marginBottom: 4 }}>Score médio</div>
          <div style={{ fontSize: 36, fontWeight: 500, color: '#fff' }}>62</div>
          <div style={{ fontSize: 11, color: '#ffffffAA' }}>/ 100</div>
        </div>
      </div>

      <div className="grid4">
        {[
          { val: '3',  label: 'Clientes ativos',     delta: 'briefings completos',  cls: 'd-ok' },
          { val: 'R$4.8k', label: 'Investimento ads',delta: 'Google + Meta',        cls: 'd-neu' },
          { val: '312', label: 'Conversões',          delta: '+18% vs mai',          cls: 'd-ok' },
          { val: '12',  label: 'Formatos treinados',  delta: '6 vídeo + 6 carrossel',cls: 'd-ora' },
        ].map(m => (
          <div className="met" key={m.label}>
            <div className="met-val">{m.val}</div>
            <div className="met-label">{m.label}</div>
            <div className={`met-delta ${m.cls}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid2">
        <div>
          <div className="sec">
            Clientes
            <button style={{ fontSize: 11, color: '#FF8C33', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onNav('clientes')}>ver todos</button>
          </div>
          <div className="card">
            {CLIENTES_MOCK.map(c => {
              const [avCls, scCls] = c.cls.split(' ')
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '0.5px solid #272727' }}>
                  <div className={`cli-av ${avCls}`}>{c.ini}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.nome}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{c.posts} posts • {c.pendentes} pendentes</div>
                  </div>
                  <span className={`score-pill ${scCls}`}>{c.score}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="sec">
            Performance
            <button style={{ fontSize: 11, color: '#FF8C33', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => onNav('relatorios')}>ver relatórios</button>
          </div>
          <div className="card">
            {PLATAFORMAS.map(p => (
              <div key={p.nome} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '0.5px solid #272727' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${p.icon}`} style={{ fontSize: 14, color: p.cor }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', marginBottom: 3 }}>{p.nome}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: p.fillW, background: p.fillC }} /></div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#FF8C33', minWidth: 24 }}>{p.score}</span>
                <span className={`tag ${p.tagCls}`}>{p.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <OraBtn onClick={() => onNav('planejar')} style={{ justifyContent: 'center' }}>
          <i className="ti ti-layout-grid" /> Planejar novo mês
        </OraBtn>
        <GhostBtn onClick={() => onNav('briefing')} style={{ justifyContent: 'center' }}>
          <i className="ti ti-plus" /> Cadastrar cliente
        </GhostBtn>
      </div>
    </div>
  )
}
