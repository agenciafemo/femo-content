import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const router = Router()

// Criar cliente lazy (apenas quando necessário)
let client = null

function getClient() {
  if (!client) {
    console.log('🔑 Inicializando Anthropic com chave:', process.env.ANTHROPIC_API_KEY ? '✅' : '❌')
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }
  return client
}

const SYSTEM_PROMPT = `Você é um especialista em criação de conteúdo para redes sociais.
Crie roteiros profissionais, estruturados e prontos para produção.
Use uma linguagem clara, direta e engajante.
Sempre organize o roteiro em seções bem definidas.`

router.post('/gerar-roteiro', async (req, res) => {
  try {
    const { prompt, tipo = 'video' } = req.body

    if (!prompt) {
      return res.status(400).json({ erro: 'Prompt é obrigatório' })
    }

    const userPrompt = tipo === 'carrossel'
      ? `Crie um roteiro de CARROSSEL Instagram com 3 camadas (Hook/Problema/Solução):\n\n${prompt}`
      : `Crie um ROTEIRO DE VÍDEO estruturado:\n\n${prompt}`

    const message = await getClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    const roteiro = message.content[0].type === 'text' ? message.content[0].text : ''

    res.json({
      sucesso: true,
      tipo,
      roteiro,
      timestamp: new Date(),
      modelo: 'Claude 3.5 Sonnet'
    })
  } catch (error) {
    console.error('Erro Claude:', error.message)
    res.status(500).json({
      erro: error.message,
      detalhes: error.status ? `Erro ${error.status}` : 'Erro desconhecido'
    })
  }
})

router.post('/gerar-carrossel', async (req, res) => {
  try {
    const { prompt } = req.body

    const message = await getClient().messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1500,
      system: SYSTEM_PROMPT + '\nEstruture como: SLIDE 1 (Hook) → SLIDE 2 (Desenvolvimento) → SLIDE 3 (CTA)',
      messages: [
        {
          role: 'user',
          content: `Crie um carrossel de 3 slides: ${prompt}`
        }
      ]
    })

    const carrossel = message.content[0].type === 'text' ? message.content[0].text : ''

    res.json({
      sucesso: true,
      carrossel,
      slides: 3,
      timestamp: new Date()
    })
  } catch (error) {
    res.status(500).json({ erro: error.message })
  }
})

export default router
