import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente
const envPath = path.join(__dirname, '.env')
console.log('📂 Procurando .env em:', envPath)

// Tentar com dotenv primeiro
dotenv.config({ path: envPath })

// Debug: mostrar resultado do dotenv
console.log('🔍 Após dotenv.config():')
console.log('   - ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY)
console.log('   - GEMINI_API_KEY:', !!process.env.GEMINI_API_KEY)
console.log('   - Arquivo existe:', fs.existsSync(envPath))

// Se não carregou, tentar ler manualmente
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('⚠️ dotenv não carregou, tentando ler manualmente...')
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    console.log('📄 Conteúdo lido:', envContent.substring(0, 100) + '...')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').trim()
        if (key && value) {
          process.env[key.trim()] = value
          console.log(`  ✅ ${key.trim()} = ${value.substring(0, 20)}...`)
        }
      }
    })
    console.log('✅ Variáveis carregadas manualmente!')
  } catch (err) {
    console.error('❌ Erro ao ler .env:', err.message)
  }
}

import claudeRouter from './routes/claude.js'
import geminiRouter from './routes/gemini.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'https://femohotel.site',
  'https://femo-content.netlify.app',
  process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error('CORS não permitido'))
    }
  }
}))
app.use(express.json())

// Rotas de IA
app.use('/api/claude', claudeRouter)
app.use('/api/gemini', geminiRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Backend FEMO rodando', porta: process.env.PORT || 3001 })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`✅ FEMO Backend rodando em http://localhost:${PORT}`)
  console.log(`📡 Frontend conectado em ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
})
