import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
})

const MODEL = 'claude-sonnet-4-5'

// ─── PROMPTS TREINADOS ────────────────────────────────────────────────────────

const PROMPTS = {
  video: {
    quebra_padrao: (briefing, dados) => `
Atue como um Copywriter de Elite e Diretor de Arte especializado em posicionamento premium,
branding editorial e comunicação H2H (Human to Human). Crie um roteiro de vídeo curto
(Reels/TikTok) com duração entre 45 e 60 segundos com foco na QUEBRA DE PADRÃO intelectual.

DIRETRIZES: Proibido clichês de marketing digital. Ritmo espaçado com frases curtas.
Tom calmo, seguro, maduro e magnético.

DADOS DO CLIENTE:
- Nicho/Profissão: ${briefing.nicho}
- Erro comum do mercado: ${dados.erro_mercado}
- Desejo secreto do cliente ideal: ${briefing.desejo_secreto}
- Palavra-chave para CTA: ${briefing.cta_keyword}
- Tom de voz: ${briefing.tom_voz}
- Nunca usar: ${briefing.nunca_usar}
${briefing.medico ? '- ATENÇÃO: Cliente médico — aplicar todas as restrições do CFM' : ''}

ESTRUTURA (responda EXATAMENTE nestes blocos):
## BLOCO 1 — GANCHO (0–3s)
[ÁUDIO]: ...
[VISUAL]: ...

## BLOCO 2 — DESCONSTRUÇÃO (3–15s)
[ÁUDIO]: ...
[VISUAL]: ...

## BLOCO 3 — TESE (15–45s)
[ÁUDIO]: ...
[VISUAL]: ...

## BLOCO 4 — CTA (45–60s)
[ÁUDIO]: ...
[VISUAL]: ...

## NOTAS DE EDIÇÃO
Legenda: ...
Trilha: ...`,

    educativo: (briefing, dados) => `
Atue como um Copywriter Especialista e Diretor Criativo sênior, combinando precisão de
pesquisador acadêmico com a fluidez narrativa de Joseph Sugarman e princípios de
simplicidade de "Made to Stick". Crie um roteiro de vídeo informativo.

DADOS DO CLIENTE:
- Tema Central: ${dados.tema}
- Público-Alvo: ${briefing.publico}
- Foco da informação: ${dados.foco}
- Nicho: ${briefing.nicho}
- Tom: ${briefing.tom_voz}
${briefing.medico ? '- CLIENTE MÉDICO: Não garantir resultados, não usar antes/depois, não divulgar preços' : ''}

ESTRUTURA:
## GANCHO COMPROVADO (0–5s)
[ÁUDIO]: ...
[VISUAL]: ...

## DESCONSTRUÇÃO DO PROBLEMA
[ÁUDIO]: ...
[VISUAL]: ...

## EXPLICAÇÃO FACILITADA
[ÁUDIO]: ...
[VISUAL]: ...

## INSIGHT DE FECHAMENTO
[ÁUDIO]: ...
[VISUAL]: ...`,

    storytelling: (briefing, dados) => `
Atue como um Copywriter Sênior especializado em Narrativas de Alto Impacto e Branding
Consciente (H2H). Crie um roteiro de vídeo curto (até 1 minuto e meio) focado em
storytelling magnético. Tom sóbrio, maduro, 130–160 palavras faladas.
Proibido: "desvende", "essencial", "revolucionário", "jornada", "mergulhe".

DADOS:
- Problema Central / O Caso: ${dados.problema}
- Público-alvo: ${briefing.publico}
- Tom: ${briefing.tom_voz}
${briefing.medico ? '- RESTRIÇÕES CFM: Sem garantias, sem antes/depois, sem preços' : ''}

ESTRUTURA (tabela com VISUAL e ÁUDIO):
## GANCHO DE CONEXÃO DIRETA (0–10s)
VISUAL: ... | ÁUDIO: ...

## NEGLIGÊNCIA SILENCIOSA (10–35s)
VISUAL: ... | ÁUDIO: ...

## ANALOGIA DIDÁTICA (35s–1min)
VISUAL: ... | ÁUDIO: ...

## DIAGNÓSTICO E DESFECHO (1min–1min30)
VISUAL: ... | ÁUDIO: ...`,

    reflexao: (briefing, dados) => `
Você é estrategista de conteúdo de elite com habilidade de "visão de helicóptero" sobre
o mercado. Crie um roteiro com vocabulário fluido, acessível, analogias visuais e conexão
com trends atuais. Tom firme, maduro, elegante.
Proibido: "arquétipos", "funil", "gatilhos", "posicionamento" — usar linguagem humana.

DADOS:
- Tema / Comportamento a desconstruir: ${dados.tema}
- Nicho do cliente: ${briefing.nicho}
- Público: ${briefing.publico}
- Tom: ${briefing.tom_voz}

ESTRUTURA:
## GANCHO CONTRADITÓRIO (0–5s)
## VISÃO DE HELICÓPTERO
## ANALOGIA + TREND EM ALTA
## DESCONSTRUÇÃO DO VAZIO
## VIRADA + CTA SUTIL`,

    vendas: (briefing, dados) => `
Você é estrategista de vendas de elite fundindo SPIN Selling (Rackham) com psicologia
de Cialdini, Kahneman e Sinek. Tom elegante, sofisticado, H2H. Sem "líder de mercado",
"revolucionário" ou vendedor desesperado.

CONTEXTO:
- Produto/Serviço: ${briefing.produto}
- Público-Alvo: ${briefing.publico}
- Grande Diferencial: ${briefing.diferencial}
- Desejo secreto do cliente: ${briefing.desejo_secreto}
${briefing.medico ? '- MÉDICO: Proposta de valor focada em qualidade, não em resultados garantidos' : ''}

ESTRUTURA:
## ETAPA 1 — GANCHO DE CONEXÃO EMOCIONAL (Sinek)
## ETAPA 2 — SITUAÇÃO (SPIN)
## ETAPA 3 — PROBLEMA (SPIN + Kahneman)
## ETAPA 4 — IMPLICAÇÃO
## ETAPA 5 — NECESSIDADE DE SOLUÇÃO
## ETAPA 6 — PROPOSTA DE VALOR
## ETAPA 7 — FECHAMENTO CONSCIENTE (Cialdini)`,

    profundidade: (briefing, dados) => `
Você é pensador contemporâneo fundindo Robert Greene (profundidade psicológica),
Nassim Taleb (aforístico, direto), Rick Rubin (minimalismo absoluto) e David Perell
(ritmo, paradoxos, ganchos). Tom sóbrio, cirúrgico, visceral. 150–230 palavras.
Proibido: "revolucionário", "incrível", "segredo", "mindset", "mudar de vida".

DADOS:
- Tema Central: ${dados.tema}
- Insight Provocador: ${dados.insight}
- Público: ${briefing.publico}
- Tom: ${briefing.tom_voz}

ESTRUTURA:
## GANCHO VISCERAL (0–10s)
## DESCONSTRUÇÃO DA ILUSÃO (10–45s)
## AFORISMO CENTRAL (45–70s)
## SÍNTESE PRÁTICA (70–100s)
## DESFECHO ENIGMÁTICO (100–110s)`
  },

  carrossel: {
    quebra_padrao: (briefing, dados) => `
Crie um roteiro de carrossel Instagram (6 slides) no formato QUEBRA DE PADRÃO.
Cada slide deve terminar com uma micro-tensão que force o próximo swipe.
Tom editorial, sofisticado, proibido clichês de marketing.

CLIENTE: ${briefing.nome} | Nicho: ${briefing.nicho} | Tom: ${briefing.tom_voz}
Tema: ${dados.tema}
${briefing.medico ? 'CLIENTE MÉDICO — aplicar restrições CFM em todos os slides' : ''}

Slide 1 — HOOK: Frase confrontadora. Sem contexto. Para o scroll.
→ Tensão: ...

Slide 2 — SINTOMA OCULTO: Dor que o leitor vive mas não nomeia.
→ Tensão: "e o pior é que você paga o preço disso."

Slide 3 — ESPELHO: Identificação profunda.
→ Tensão: "mas o problema não está onde você está olhando."

Slide 4 — TESE: Virada intelectual — o porquê estratégico.
→ Tensão: "e quando você entende isso, tudo muda."

Slide 5 — APLICAÇÃO: [Você informa o ângulo prático]
→ Termina com pergunta reflexiva.

Slide 6 — CTA: Convite elegante. Nunca ordem.

Para cada slide, responda:
TEXTO DO SLIDE: ...
TENSÃO DE SWIPE: ...`,

    educativo: (briefing, dados) => buildCarrosselPrompt('EDUCATIVO', 7, briefing, dados, [
      'Slide 1 — FATO IMPACTANTE: Dado mais surpreendente. Cria o "como assim?"',
      'Slide 2 — CENÁRIO REAL: Como o fato se aplica ao público.',
      'Slide 3 — PONTO 1: Primeiro bloco informativo com analogia.',
      'Slide 4 — PONTO 2: Aprofunda com metáfora do cotidiano.',
      'Slide 5 — PONTO 3: O mais denso e revelador.',
      'Slide 6 — INSIGHT: Reflexão profunda, sem CTA agressivo.',
      'Slide 7 — CTA: Convite para aprofundar. Tom H2H.'
    ]),

    storytelling: (briefing, dados) => buildCarrosselPrompt('STORYTELLING', 7, briefing, dados, [
      'Slide 1 — PERSONAGEM: Alguém real em uma frase.',
      'Slide 2 — SITUAÇÃO: Cotidiano com detalhes precisos.',
      'Slide 3 — NEGLIGÊNCIA: O comportamento de desculpa.',
      'Slide 4 — ANALOGIA: Metáfora visual para o problema.',
      'Slide 5 — VIRADA: O que mudou quando entendeu.',
      'Slide 6 — LIÇÃO: Postura correta, tom de diagnóstico.',
      'Slide 7 — CTA: Focado em prevenção ou contato privado.'
    ]),

    reflexao: (briefing, dados) => buildCarrosselPrompt('REFLEXÃO', 6, briefing, dados, [
      'Slide 1 — CONTRADITÓRIO: Ataca comportamento que o público acha correto.',
      'Slide 2 — HELICÓPTERO: Bastidores da mente do consumidor.',
      'Slide 3 — ANALOGIA + TREND: Conecta à situação em alta.',
      'Slide 4 — VAZIO: Essência vs casca bonita.',
      'Slide 5 — VIRADA: Afirmação forte ou pergunta reflexiva.',
      'Slide 6 — CTA: Estimula conversa nos comentários.'
    ]),

    vendas: (briefing, dados) => buildCarrosselPrompt('VENDAS', 8, briefing, dados, [
      'Slide 1 — CONEXÃO: Valida o momento. Não fala do produto.',
      'Slide 2 — SITUAÇÃO: Contextualiza a realidade atual.',
      'Slide 3 — PROBLEMA: Dor oculta + aversão à perda.',
      'Slide 4 — IMPLICAÇÃO: Consequências de não resolver agora.',
      'Slide 5 — SOLUÇÃO: O cenário ideal do cliente.',
      'Slide 6 — PROPOSTA: Produto como ponte natural.',
      'Slide 7 — PROVA: Resultado real, tom sóbrio.',
      'Slide 8 — FECHAMENTO: Compromisso mútuo, próximo passo suave.'
    ]),

    profundidade: (briefing, dados) => buildCarrosselPrompt('PROFUNDIDADE', 6, briefing, dados, [
      'Slide 1 — GANCHO VISCERAL: Paradoxo ou verdade fria. Para o feed.',
      'Slide 2 — ILUSÃO: Erro que o público comete sem perceber.',
      'Slide 3 — AFORISMO: A frase que as pessoas salvam.',
      'Slide 4 — SÍNTESE: Mudança de perspectiva, não passo a passo.',
      'Slide 5 — CAMADA FUNDA: Segunda verdade incômoda.',
      'Slide 6 — DESFECHO ENIGMÁTICO: Pergunta reflexiva que ecoa.'
    ])
  }
}

function buildCarrosselPrompt(tipo, slides, briefing, dados, estrutura) {
  return `Crie um roteiro de carrossel Instagram (${slides} slides) no formato ${tipo}.
Cada slide deve terminar com tensão que force o próximo swipe.

CLIENTE: ${briefing.nome} | Nicho: ${briefing.nicho} | Tom: ${briefing.tom_voz}
Tema: ${dados.tema}
${briefing.medico ? 'CLIENTE MÉDICO — aplicar restrições CFM em todos os slides' : ''}

${estrutura.join('\n')}

Para cada slide, responda:
TEXTO DO SLIDE: ...
TENSÃO DE SWIPE: ...`
}

// ─── FUNÇÕES DE GERAÇÃO ───────────────────────────────────────────────────────

export async function gerarRoteiro(tipo, formato, briefing, dados) {
  const promptFn = PROMPTS[tipo]?.[formato]
  if (!promptFn) throw new Error(`Formato não encontrado: ${tipo}/${formato}`)

  const prompt = promptFn(briefing, dados)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  })

  return response.content[0].text
}

export async function conduzirBriefing(perguntaAtual, respostasAnteriores, infoCliente) {
  const historico = respostasAnteriores.map(r => [
    { role: 'assistant', content: r.pergunta },
    { role: 'user', content: r.resposta }
  ]).flat()

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: `Você é um especialista em marketing digital conduzindo o briefing de um cliente de agência.
Faça uma pergunta por vez. Seja direto e específico. Quando tiver informações suficientes,
retorne um JSON com todos os dados coletados. Foco em: nicho, público, tom de voz,
produto, diferencial, desejo secreto, CTA, restrições.`,
    messages: [
      ...historico,
      {
        role: 'user',
        content: `Informações já coletadas: ${JSON.stringify(infoCliente)}
Próxima pergunta para completar o briefing:`
      }
    ]
  })

  return response.content[0].text
}

export async function distribuirTemas(clientes, quantVideos, quantCarrosseis, historico) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `Você é estrategista editorial de agência. Distribua conteúdos entre os 6 formatos
de forma estratégica. NUNCA repita temas já usados no histórico.
Responda SOMENTE em JSON válido.`,
    messages: [{
      role: 'user',
      content: `
CLIENTE: ${clientes.nome}
NICHO: ${clientes.nicho}
OBJETIVO DO MÊS: ${clientes.objetivo_mes || 'autoridade e engajamento'}
VÍDEOS: ${quantVideos} | CARROSSÉIS: ${quantCarrosseis}
HISTÓRICO (temas já usados): ${JSON.stringify(historico)}

Distribua entre os formatos: quebra_padrao, educativo, storytelling, reflexao, vendas, profundidade.
Sugira tema específico para cada conteúdo.

Formato da resposta:
{
  "videos": [
    { "formato": "quebra_padrao", "tema": "...", "angulo": "..." },
    ...
  ],
  "carrosseis": [
    { "formato": "educativo", "tema": "...", "angulo": "..." },
    ...
  ]
}`
    }]
  })

  const text = response.content[0].text
  const json = text.match(/\{[\s\S]*\}/)?.[0]
  return JSON.parse(json)
}

export async function analisarRelatorioIA(dadosRelatorio, cliente) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `Você é estrategista de marketing digital sênior. Analise os dados e escreva
uma análise executiva clara, objetiva e com recomendações acionáveis. Tom profissional
mas humano. Sem clichês corporativos.`,
    messages: [{
      role: 'user',
      content: `
CLIENTE: ${cliente.nome} | NICHO: ${cliente.nicho}
PERÍODO: ${dadosRelatorio.periodo}

DADOS:
${JSON.stringify(dadosRelatorio, null, 2)}

Escreva a análise do gestor em 4 blocos:
1. RESUMO EXECUTIVO (2–3 frases)
2. O QUE FUNCIONOU (bullet points)
3. O QUE AJUSTAR (bullet points com ação específica)
4. RECOMENDAÇÕES PARA O PRÓXIMO MÊS (2–3 prioridades)`
    }]
  })

  return response.content[0].text
}

export async function sugerirBancoCriador(bancoCriador, nicho) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `Você é diretor criativo especialista em conteúdo premium para Instagram.
Sugira novas entradas para o banco do criador baseadas no estilo já cadastrado.
Responda em JSON.`,
    messages: [{
      role: 'user',
      content: `
NICHO DA AGÊNCIA: ${nicho}
ENTRADAS EXISTENTES: ${JSON.stringify(bancoCriador)}

Sugira 6 novas entradas (2 ganchos, 2 ideias, 1 referência, 1 estrutura).
Formato:
[
  { "categoria": "gancho", "texto": "...", "tags": ["..."] },
  ...
]`
    }]
  })

  const text = response.content[0].text
  const json = text.match(/\[[\s\S]*\]/)?.[0]
  return JSON.parse(json)
}
