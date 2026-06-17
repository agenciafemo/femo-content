import axios from 'axios'

const BASE = 'https://graph.facebook.com/v20.0'
const TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN
const AD_ACCOUNT = import.meta.env.VITE_META_AD_ACCOUNT_ID

// ─── INSTAGRAM INSIGHTS ───────────────────────────────────────────────────────

export async function buscarInsightsInstagram(igUserId, periodo = 30) {
  try {
    const [perfil, media, insights] = await Promise.all([
      axios.get(`${BASE}/${igUserId}`, {
        params: {
          fields: 'username,name,biography,followers_count,media_count,profile_picture_url',
          access_token: TOKEN
        }
      }),
      buscarMelhoresPosts(igUserId),
      buscarInsightsConta(igUserId, periodo)
    ])

    return {
      perfil: perfil.data,
      melhores_posts: media,
      insights: insights
    }
  } catch (error) {
    console.error('Instagram API error:', error)
    return mockDadosInstagram()
  }
}

async function buscarMelhoresPosts(igUserId) {
  const response = await axios.get(`${BASE}/${igUserId}/media`, {
    params: {
      fields: 'id,caption,media_type,timestamp,like_count,comments_count,reach,saved,shares',
      limit: 20,
      access_token: TOKEN
    }
  })

  return response.data.data
    ?.sort((a, b) => (b.reach || 0) - (a.reach || 0))
    ?.slice(0, 5)
}

async function buscarInsightsConta(igUserId, dias) {
  const response = await axios.get(`${BASE}/${igUserId}/insights`, {
    params: {
      metric: 'follower_count,reach,impressions,profile_views',
      period: 'day',
      since: Math.floor(Date.now() / 1000) - (dias * 86400),
      until: Math.floor(Date.now() / 1000),
      access_token: TOKEN
    }
  })

  return response.data.data
}

export async function buscarDemografiaInstagram(igUserId) {
  try {
    const response = await axios.get(`${BASE}/${igUserId}/insights`, {
      params: {
        metric: 'audience_gender_age,audience_city,audience_country',
        period: 'lifetime',
        access_token: TOKEN
      }
    })
    return response.data.data
  } catch (error) {
    console.error('Demographics error:', error)
    return mockDemografia()
  }
}

// ─── META ADS ─────────────────────────────────────────────────────────────────

export async function buscarDadosMetaAds(periodo = 'last_30d') {
  try {
    const response = await axios.get(`${BASE}/${AD_ACCOUNT}/insights`, {
      params: {
        fields: [
          'spend', 'reach', 'frequency', 'impressions',
          'clicks', 'ctr', 'cpm', 'cpp',
          'actions', 'cost_per_action_type'
        ].join(','),
        date_preset: periodo,
        level: 'account',
        access_token: TOKEN
      }
    })

    return formatarDadosMeta(response.data.data?.[0])
  } catch (error) {
    console.error('Meta Ads error:', error)
    return mockDadosMeta()
  }
}

export async function buscarCampanhasMetaAds(periodo = 'last_30d') {
  try {
    const response = await axios.get(`${BASE}/${AD_ACCOUNT}/campaigns`, {
      params: {
        fields: 'name,status,objective,insights{spend,reach,clicks,ctr,actions}',
        date_preset: periodo,
        access_token: TOKEN
      }
    })

    return response.data.data
  } catch (error) {
    console.error('Campaigns error:', error)
    return []
  }
}

function formatarDadosMeta(data) {
  if (!data) return mockDadosMeta()

  const leads = data.actions?.find(a => a.action_type === 'lead')?.value || 0
  const mensagens = data.actions?.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d')?.value || 0

  return {
    investimento: parseFloat(data.spend || 0),
    alcance: parseInt(data.reach || 0),
    frequencia: parseFloat(data.frequency || 0),
    impressoes: parseInt(data.impressions || 0),
    cliques: parseInt(data.clicks || 0),
    ctr: parseFloat(data.ctr || 0),
    cpm: parseFloat(data.cpm || 0),
    leads: parseInt(leads),
    mensagens: parseInt(mensagens),
    custo_por_lead: data.cost_per_action_type?.find(a => a.action_type === 'lead')?.value || 0
  }
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

function mockDadosInstagram() {
  return {
    perfil: {
      username: 'clinicabellavita',
      followers_count: 12400,
      media_count: 284
    },
    melhores_posts: [
      { id: '1', caption: 'Reel — Quebra de padrão...', reach: 8400, like_count: 420 },
      { id: '2', caption: 'Carrossel — 3 mitos...', reach: 6100, like_count: 310 },
      { id: '3', caption: 'Reel — Storytelling...', reach: 5800, like_count: 290 }
    ],
    insights: {
      seguidores: 12400,
      alcance: 48600,
      impressoes: 124000,
      taxa_engajamento: 0.048
    }
  }
}

function mockDemografia() {
  return {
    genero: { F: 78, M: 22 },
    faixa_etaria: { '25-34': 42, '35-44': 31, '18-24': 15, '45+': 12 },
    cidades: [{ cidade: 'São Paulo', percentual: 58 }, { cidade: 'Rio de Janeiro', percentual: 18 }]
  }
}

function mockDadosMeta() {
  return {
    investimento: 1980,
    alcance: 84200,
    frequencia: 2.4,
    impressoes: 202080,
    cliques: 1240,
    ctr: 0.0147,
    cpm: 23.50,
    leads: 125,
    mensagens: 43,
    custo_por_lead: 15.84
  }
}
