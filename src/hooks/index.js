import { useState, useCallback } from 'react'
import { gerarRoteiro, conduzirBriefing, distribuirTemas, analisarRelatorioIA, sugerirBancoCriador } from '../api/claude'
import { analisarPerfilInstagram, gerarDiagnostico, verificarComplianceCFM, buscarTrends } from '../api/gemini'
import { buscarDadosGoogleAds, buscarDadosGA4 } from '../api/google'
import { buscarInsightsInstagram, buscarDadosMetaAds } from '../api/meta'
import { buscarDadosLinkedIn } from '../api/linkedin'

// ─── HOOK: GERAÇÃO DE ROTEIROS ────────────────────────────────────────────────

export function useRoteiro() {
  const [loading, setLoading] = useState(false)
  const [roteiro, setRoteiro] = useState(null)
  const [erro, setErro] = useState(null)
  const [complianceCFM, setComplianceCFM] = useState(null)

  const gerar = useCallback(async (tipo, formato, briefing, dados) => {
    setLoading(true)
    setErro(null)
    setComplianceCFM(null)

    try {
      const resultado = await gerarRoteiro(tipo, formato, briefing, dados)
      setRoteiro(resultado)

      if (briefing.medico) {
        const compliance = await verificarComplianceCFM(resultado, briefing.especialidade_medica)
        setComplianceCFM(compliance)

        if (!compliance.aprovado) {
          console.warn('Conteúdo com violações CFM detectadas:', compliance.violacoes)
        }
      }

      return resultado
    } catch (e) {
      setErro(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { gerar, roteiro, loading, erro, complianceCFM }
}

// ─── HOOK: BRIEFING GUIADO ────────────────────────────────────────────────────

export function useBriefing() {
  const [loading, setLoading] = useState(false)
  const [etapa, setEtapa] = useState('instagram')
  const [perfilIG, setPerfilIG] = useState(null)
  const [briefing, setBriefing] = useState({})
  const [historicoPergRespostas, setHistoricoPergRespostas] = useState([])

  const buscarInstagram = useCallback(async (handle, nicho) => {
    setLoading(true)
    try {
      const perfil = await analisarPerfilInstagram(handle, nicho)
      setPerfilIG(perfil)
      setBriefing(prev => ({
        ...prev,
        nome: perfil.nome,
        nicho: perfil.nicho_confirmado,
        palavras_chave: perfil.palavras_chave,
        medico: perfil.is_medico,
        especialidade_medica: perfil.especialidade_medica,
        tom_voz: perfil.tom_aparente
      }))
      return perfil
    } finally {
      setLoading(false)
    }
  }, [])

  const proximaPergunta = useCallback(async (infoAtual) => {
    setLoading(true)
    try {
      const pergunta = await conduzirBriefing(null, historicoPergRespostas, infoAtual || briefing)
      return pergunta
    } finally {
      setLoading(false)
    }
  }, [briefing, historicoPergRespostas])

  const responder = useCallback((pergunta, resposta) => {
    setHistoricoPergRespostas(prev => [...prev, { pergunta, resposta }])
  }, [])

  const atualizarBriefing = useCallback((dados) => {
    setBriefing(prev => ({ ...prev, ...dados }))
  }, [])

  return {
    loading, etapa, setEtapa,
    perfilIG, briefing,
    buscarInstagram, proximaPergunta, responder, atualizarBriefing
  }
}

// ─── HOOK: PLANEJAMENTO MENSAL ────────────────────────────────────────────────

export function usePlanejamento() {
  const [loading, setLoading] = useState(false)
  const [distribuicao, setDistribuicao] = useState(null)
  const [temasAprovados, setTemasAprovados] = useState(false)

  const gerarDistribuicao = useCallback(async (cliente, quantVideos, quantCarrosseis, historico = []) => {
    setLoading(true)
    try {
      const resultado = await distribuirTemas(cliente, quantVideos, quantCarrosseis, historico)
      setDistribuicao(resultado)
      return resultado
    } finally {
      setLoading(false)
    }
  }, [])

  const aprovarTemas = useCallback((distribuicaoEditada) => {
    if (distribuicaoEditada) setDistribuicao(distribuicaoEditada)
    setTemasAprovados(true)
  }, [])

  return { loading, distribuicao, temasAprovados, gerarDistribuicao, aprovarTemas }
}

// ─── HOOK: DIAGNÓSTICO ────────────────────────────────────────────────────────

export function useDiagnostico() {
  const [loading, setLoading] = useState(false)
  const [diagnostico, setDiagnostico] = useState(null)

  const gerar = useCallback(async (briefing, handle) => {
    setLoading(true)
    try {
      const [dadosIG, trends] = await Promise.all([
        buscarInsightsInstagram(handle),
        buscarTrends(briefing.nicho)
      ])

      const resultado = await gerarDiagnostico(briefing, dadosIG, { trends })
      setDiagnostico(resultado)
      return resultado
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, diagnostico, gerar }
}

// ─── HOOK: RELATÓRIO COMPLETO ─────────────────────────────────────────────────

export function useRelatorio() {
  const [loading, setLoading] = useState(false)
  const [dados, setDados] = useState(null)
  const [analiseIA, setAnaliseIA] = useState(null)

  const buscarTodos = useCallback(async (cliente, contas) => {
    setLoading(true)
    try {
      const [googleAds, ga4, instagram, metaAds, linkedin] = await Promise.allSettled([
        buscarDadosGoogleAds(contas.googleAdsCustomerId),
        buscarDadosGA4(contas.ga4PropertyId),
        buscarInsightsInstagram(contas.igUserId),
        buscarDadosMetaAds(),
        buscarDadosLinkedIn()
      ])

      const relatorio = {
        periodo: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        google_ads: googleAds.status === 'fulfilled' ? googleAds.value : null,
        ga4: ga4.status === 'fulfilled' ? ga4.value : null,
        instagram: instagram.status === 'fulfilled' ? instagram.value : null,
        meta_ads: metaAds.status === 'fulfilled' ? metaAds.value : null,
        linkedin: linkedin.status === 'fulfilled' ? linkedin.value : null
      }

      setDados(relatorio)

      const analise = await analisarRelatorioIA(relatorio, cliente)
      setAnaliseIA(analise)

      return { relatorio, analise }
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, dados, analiseIA, buscarTodos }
}

// ─── HOOK: BANCO DO CRIADOR ───────────────────────────────────────────────────

export function useBancoCriador() {
  const [loading, setLoading] = useState(false)
  const [sugestoes, setSugestoes] = useState([])

  const sugerirEntradas = useCallback(async (bancoCriador, nicho) => {
    setLoading(true)
    try {
      const resultado = await sugerirBancoCriador(bancoCriador, nicho)
      setSugestoes(resultado)
      return resultado
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, sugestoes, sugerirEntradas }
}
