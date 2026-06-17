import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const api = {
  // IAs
  claude: {
    gerarRoteiro: (prompt, tipo) =>
      client.post('/api/claude/gerar-roteiro', { prompt, tipo }),
    gerarCarrossel: (prompt) =>
      client.post('/api/claude/gerar-carrossel', { prompt })
  },

  gemini: {
    analisarPerfil: (username) =>
      client.post('/api/gemini/analisar-perfil', { username }),
    diagnostico: (briefing) =>
      client.post('/api/gemini/diagnostico', { briefing })
  },

  // Relatórios
  googleAds: {
    obterDados: (clientId) =>
      client.get(`/api/google-ads/${clientId}`),
    relatorio: (clientId, dataInicio, dataFim) =>
      client.get(`/api/google-ads/${clientId}/relatorio`, {
        params: { dataInicio, dataFim }
      })
  },

  ga4: {
    obterDados: (propertyId) =>
      client.get(`/api/ga4/${propertyId}`),
    eventos: (propertyId) =>
      client.get(`/api/ga4/${propertyId}/eventos`)
  },

  meta: {
    instagram: (accountId) =>
      client.get(`/api/meta/instagram/${accountId}`),
    ads: (accountId) =>
      client.get(`/api/meta/ads/${accountId}`)
  },

  linkedin: {
    perfil: (orgId) =>
      client.get(`/api/linkedin/${orgId}`),
    posts: (orgId) =>
      client.get(`/api/linkedin/${orgId}/posts`)
  },

  health: () =>
    client.get('/health')
}

export default client
