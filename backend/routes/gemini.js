import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'

const router = Router()

// Criar cliente lazy (apenas quando necessário)
let genAI = null

function getGenAI() {
  if (!genAI) {
    console.log('💎 Inicializando Gemini com chave:', process.env.GEMINI_API_KEY ? '✅' : '❌')
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

const SYSTEM_PROMPT = `Você é um especialista em análise de conteúdo e estratégia de redes sociais.
Forneça análises profundas, dados acionáveis e recomendações específicas.
Use uma estrutura clara com seções bem definidas.
Sempre cite métricas e tendências atuais.`

router.post('/analisar-perfil', async (req, res) => {
  try {
    const { username } = req.body

    if (!username) {
      return res.status(400).json({ erro: 'Username é obrigatório' })
    }

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `Analise o perfil Instagram @${username} e forneça:
1. Tom de voz e estilo
2. Público-alvo provável
3. Temas principais de conteúdo
4. Oportunidades de crescimento
5. Recomendações de estratégia

Estruture a resposta de forma clara e profissional.`

    const result = await model.generateContent(prompt)
    const analise = result.response.text()

    res.json({
      sucesso: true,
      username,
      analise,
      timestamp: new Date(),
      modelo: 'Gemini 1.5 Flash'
    })
  } catch (error) {
    console.error('Erro Gemini:', error.message)
    res.status(500).json({
      erro: error.message,
      detalhes: 'Erro ao analisar perfil'
    })
  }
})

router.post('/diagnostico', async (req, res) => {
  try {
    const { briefing } = req.body

    if (!briefing) {
      return res.status(400).json({ erro: 'Briefing é obrigatório' })
    }

    const model = getGenAI().getGenerativeModel({ model: 'gemini-1.5-pro' })

    const prompt = `Com base neste briefing de cliente:
${JSON.stringify(briefing, null, 2)}

Forneça um diagnóstico completo incluindo:
1. Pontos fortes atuais
2. Oportunidades não aproveitadas
3. Riscos e desafios
4. Plano de ação de 90 dias
5. KPIs a acompanhar

Seja específico e acionável.`

    const result = await model.generateContent(prompt)
    const diagnostico = result.response.text()

    res.json({
      sucesso: true,
      diagnostico,
      timestamp: new Date()
    })
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

export default router
