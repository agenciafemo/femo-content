import axios from 'axios'

// LinkedIn API requer proxy backend (CORS bloqueado no browser)
// Criar endpoint /api/linkedin no seu servidor com as credenciais

const ORG_ID = import.meta.env.VITE_LINKEDIN_ORGANIZATION_ID

export async function buscarDadosLinkedIn(periodo = 30) {
  try {
    const [pagina, posts, demografia] = await Promise.all([
      axios.get('/api/linkedin/page-stats', { params: { orgId: ORG_ID, dias: periodo } }),
      axios.get('/api/linkedin/posts', { params: { orgId: ORG_ID, dias: periodo } }),
      axios.get('/api/linkedin/demographics', { params: { orgId: ORG_ID } })
    ])

    return {
      pagina: pagina.data,
      melhores_posts: posts.data,
      demografia: demografia.data
    }
  } catch (error) {
    console.error('LinkedIn API error:', error)
    return mockDadosLinkedIn()
  }
}

function mockDadosLinkedIn() {
  return {
    pagina: {
      seguidores: 1840,
      visualizacoes: 4200,
      cliques_botao: 84,
      taxa_engajamento: 0.012,
      crescimento_mensal: 124
    },
    melhores_posts: [
      {
        titulo: 'O erro que impede autoridade real no Instagram',
        impressoes: 1200,
        cliques: 84,
        reacoes: 96,
        comentarios: 12,
        compartilhamentos: 8
      },
      {
        titulo: 'Estratégia de conteúdo para clínicas em 2026',
        impressoes: 840,
        cliques: 52,
        reacoes: 71,
        comentarios: 8,
        compartilhamentos: 5
      }
    ],
    demografia: {
      funcoes: [
        { funcao: 'Medicina / saúde', percentual: 44 },
        { funcao: 'Marketing / comunicação', percentual: 28 },
        { funcao: 'Administração', percentual: 18 }
      ],
      senioridade: [
        { nivel: 'Sênior / diretor', percentual: 38 },
        { nivel: 'Pleno', percentual: 34 },
        { nivel: 'C-Level', percentual: 16 }
      ],
      tamanho_empresa: [
        { tamanho: '11–50 funcionários', percentual: 52 },
        { tamanho: '1–10 funcionários', percentual: 28 },
        { tamanho: '51–200 funcionários', percentual: 14 }
      ],
      cidades: [
        { cidade: 'São Paulo', percentual: 61 },
        { cidade: 'Rio de Janeiro', percentual: 18 }
      ]
    }
  }
}
