import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
const MODEL = 'gemini-1.5-pro'

// ─── ANÁLISE DE PERFIL INSTAGRAM ──────────────────────────────────────────────

export async function analisarPerfilInstagram(handle, nicho) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    tools: [{ googleSearchRetrieval: {} }]
  })

  const result = await model.generateContent(`
Analise o perfil Instagram @${handle} e extraia informações para um briefing de agência.
Nicho esperado: ${nicho}.

Responda SOMENTE em JSON válido com esta estrutura:
{
  "nome": "Nome da marca/pessoa",
  "bio": "Texto da bio",
  "seguidores": "número estimado",
  "posts": "número estimado",
  "nicho_confirmado": "nicho identificado",
  "tom_aparente": "sofisticado|tecnico|caloroso|inspirador|educativo|irreverente",
  "palavras_chave": ["kw1", "kw2", "kw3", "kw4", "kw5"],
  "temas_frequentes": ["tema1", "tema2", "tema3"],
  "pontos_fortes": ["ponto1", "ponto2"],
  "gaps_identificados": ["gap1", "gap2"],
  "is_medico": true/false,
  "especialidade_medica": "se médico, qual especialidade"
}`)

  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

// ─── DIAGNÓSTICO COMPLETO DO PERFIL ───────────────────────────────────────────

export async function gerarDiagnostico(briefing, dadosInstagram, dadosRelatorio) {
  const model = genAI.getGenerativeModel({ model: MODEL })

  const result = await model.generateContent(`
Você é especialista em marketing digital. Gere um diagnóstico completo do perfil.

BRIEFING DO CLIENTE:
${JSON.stringify(briefing, null, 2)}

DADOS DO INSTAGRAM:
${JSON.stringify(dadosInstagram, null, 2)}

DADOS DE RELATÓRIO (se disponíveis):
${JSON.stringify(dadosRelatorio, null, 2)}

Gere o diagnóstico em JSON:
{
  "score_geral": 0-100,
  "titulo": "frase resumindo o diagnóstico",
  "resumo": "2-3 frases de diagnóstico geral",
  "dimensoes": {
    "posicionamento": {
      "score": 0-100,
      "achados": [
        { "tipo": "ok|warn|crit", "texto": "...", "acao": "..." }
      ]
    },
    "qualidade": { "score": 0-100, "achados": [...] },
    "frequencia": { "score": 0-100, "achados": [...] },
    "tom_voz": { "score": 0-100, "achados": [...] },
    "engajamento": { "score": 0-100, "achados": [...] },
    "metricas": { "score": 0-100, "achados": [...] }
  },
  "plano_acao": [
    { "prioridade": "alta|media|baixa", "acao": "...", "prazo": "..." }
  ]
}`)

  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

// ─── VERIFICAÇÃO DE COMPLIANCE CFM ───────────────────────────────────────────

const REGRAS_CFM = `
Resolução CFM nº 1.974/2011 — Restrições para médicos em redes sociais:
1. Proibido garantir resultados de procedimentos ou tratamentos
2. Proibido uso de imagens "antes e depois" de pacientes
3. Proibido divulgar preços, promoções ou descontos de procedimentos médicos
4. Proibido usar "o melhor médico", "especialista número 1" ou superlativos
5. Proibido mencionar nomes de pacientes sem autorização expressa documentada
6. Proibido fazer comparações depreciativas com outros profissionais
7. Proibido anunciar especialidade não reconhecida pelo CFM
8. Proibido induzir paciente a procedimentos desnecessários
9. Todo conteúdo deve ter caráter educativo, não publicitário direto
`

export async function verificarComplianceCFM(conteudo, especialidade) {
  const model = genAI.getGenerativeModel({ model: MODEL })

  const result = await model.generateContent(`
Você é advogado especialista em direito médico e ética médica. Analise o conteúdo abaixo
e identifique possíveis violações das regras do CFM.

REGRAS APLICÁVEIS:
${REGRAS_CFM}

ESPECIALIDADE DO MÉDICO: ${especialidade || 'não informada'}

CONTEÚDO A ANALISAR:
${conteudo}

Responda em JSON:
{
  "aprovado": true/false,
  "score_risco": 0-100,
  "violacoes": [
    { "regra": "número da regra", "trecho": "trecho problemático", "sugestao": "como corrigir" }
  ],
  "observacoes": "comentários gerais",
  "versao_corrigida": "versão do conteúdo corrigida para conformidade (se houver violações)"
}`)

  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

// ─── TRENDS E TENDÊNCIAS POR NICHO ───────────────────────────────────────────

export async function buscarTrends(nicho, plataforma = 'Instagram') {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    tools: [{ googleSearchRetrieval: {} }]
  })

  const result = await model.generateContent(`
Quais são as tendências, trends e comportamentos em alta no ${plataforma} para o nicho
de ${nicho} nos últimos 30 dias? Foco em Brasil.

Responda em JSON:
{
  "trends_conteudo": [
    { "trend": "nome da trend", "descricao": "como usar no nicho", "urgencia": "alta|media|baixa" }
  ],
  "comportamentos_audiencia": ["comportamento1", "comportamento2"],
  "formatos_alta": ["formato1", "formato2"],
  "temas_relevantes": ["tema1", "tema2", "tema3"],
  "referencias_criadores": ["@criador1", "@criador2"]
}`)

  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

// ─── EXTRAÇÃO DE PALAVRAS-CHAVE ───────────────────────────────────────────────

export async function extrairPalavrasChave(textos, nicho) {
  const model = genAI.getGenerativeModel({ model: MODEL })

  const result = await model.generateContent(`
Analise os textos abaixo de um perfil do nicho "${nicho}" e extraia as palavras-chave
mais relevantes para estratégia de conteúdo.

TEXTOS:
${textos.join('\n---\n')}

Responda em JSON:
{
  "primarias": ["kw1", "kw2", "kw3"],
  "secundarias": ["kw4", "kw5", "kw6"],
  "longTail": ["frase1", "frase2"],
  "hashtags_recomendadas": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
}`)

  const text = result.response.text()
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

// ─── ANÁLISE DE IMAGEM DE POST ────────────────────────────────────────────────

export async function analisarImagemPost(imageBase64, mimeType = 'image/jpeg') {
  const model = genAI.getGenerativeModel({ model: MODEL })

  const result = await model.generateContent([
    {
      inlineData: { data: imageBase64, mimeType }
    },
    `Analise esta imagem de post do Instagram e descreva:
1. Qualidade visual (composição, iluminação, cores)
2. Tom e sensação transmitida
3. Elementos textuais visíveis
4. Pontos fortes e sugestões de melhoria
Responda de forma objetiva e profissional.`
  ])

  return result.response.text()
}
