import axios from 'axios'

// ─── GOOGLE ADS API ───────────────────────────────────────────────────────────
// Nota: Google Ads API requer proxy backend por segurança (não rodar no browser)
// Em produção, criar endpoint /api/google-ads no seu servidor

export async function buscarDadosGoogleAds(customerId, periodo = 'LAST_30_DAYS') {
  try {
    const response = await axios.post('/api/google-ads/query', {
      customerId,
      query: `
        SELECT
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.average_cpc,
          metrics.cost_micros,
          metrics.conversions,
          metrics.cost_per_conversion,
          metrics.conversion_rate
        FROM campaign
        WHERE segments.date DURING ${periodo}
        ORDER BY metrics.conversions DESC
        LIMIT 20
      `
    })

    return formatarDadosGoogleAds(response.data)
  } catch (error) {
    console.error('Google Ads API error:', error)
    return mockDadosGoogleAds()
  }
}

export async function buscarPalavrasChaveAds(customerId, periodo = 'LAST_30_DAYS') {
  try {
    const response = await axios.post('/api/google-ads/query', {
      customerId,
      query: `
        SELECT
          ad_group_criterion.keyword.text,
          metrics.impressions,
          metrics.clicks,
          metrics.ctr,
          metrics.conversions,
          metrics.cost_per_conversion
        FROM keyword_view
        WHERE segments.date DURING ${periodo}
          AND metrics.impressions > 100
        ORDER BY metrics.conversions DESC
        LIMIT 10
      `
    })

    return response.data
  } catch (error) {
    console.error('Keywords API error:', error)
    return mockPalavrasChave()
  }
}

function formatarDadosGoogleAds(data) {
  const totais = data.reduce((acc, row) => ({
    impressions: acc.impressions + (row.metrics?.impressions || 0),
    clicks: acc.clicks + (row.metrics?.clicks || 0),
    cost: acc.cost + (row.metrics?.cost_micros || 0) / 1_000_000,
    conversions: acc.conversions + (row.metrics?.conversions || 0)
  }), { impressions: 0, clicks: 0, cost: 0, conversions: 0 })

  return {
    impressoes: totais.impressions,
    cliques: totais.clicks,
    ctr: totais.clicks / totais.impressions,
    cpc_medio: totais.cost / totais.clicks,
    investimento: totais.cost,
    conversoes: totais.conversions,
    custo_conversao: totais.cost / totais.conversions,
    campanhas: data
  }
}

// ─── GOOGLE ANALYTICS 4 API ───────────────────────────────────────────────────
// Também requer proxy backend em produção

export async function buscarDadosGA4(propertyId, periodo = { startDate: '30daysAgo', endDate: 'today' }) {
  try {
    const response = await axios.post('/api/ga4/report', {
      propertyId,
      dateRanges: [periodo],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'engagementRate' },
        { name: 'eventCount' }
      ],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' }
      ]
    })

    return formatarDadosGA4(response.data)
  } catch (error) {
    console.error('GA4 API error:', error)
    return mockDadosGA4()
  }
}

export async function buscarEventosGA4(propertyId, periodo) {
  try {
    const response = await axios.post('/api/ga4/report', {
      propertyId,
      dateRanges: [periodo],
      metrics: [{ name: 'eventCount' }, { name: 'eventValue' }],
      dimensions: [{ name: 'eventName' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['whatsapp_click', 'form_submit', 'schedule_click', 'purchase']
          }
        }
      }
    })

    return response.data
  } catch (error) {
    console.error('GA4 Events error:', error)
    return mockEventosGA4()
  }
}

function formatarDadosGA4(data) {
  const origens = {}
  data.rows?.forEach(row => {
    const canal = row.dimensionValues?.[0]?.value
    origens[canal] = {
      sessoes: parseInt(row.metricValues?.[0]?.value || 0),
      usuarios: parseInt(row.metricValues?.[1]?.value || 0)
    }
  })

  const totais = data.totals?.[0]
  return {
    sessoes: parseInt(totais?.metricValues?.[0]?.value || 0),
    usuarios_ativos: parseInt(totais?.metricValues?.[1]?.value || 0),
    tempo_medio: parseFloat(totais?.metricValues?.[2]?.value || 0),
    taxa_engajamento: parseFloat(totais?.metricValues?.[3]?.value || 0),
    origens
  }
}

// ─── MOCK DATA (usado enquanto APIs não estão conectadas) ─────────────────────

function mockDadosGoogleAds() {
  return {
    impressoes: 48200,
    cliques: 1840,
    ctr: 0.0382,
    cpc_medio: 1.54,
    investimento: 2840,
    conversoes: 187,
    custo_conversao: 15.19,
    campanhas: []
  }
}

function mockPalavrasChave() {
  return [
    { keyword: 'harmonização facial preço', conversoes: 62, ctr: 0.052 },
    { keyword: 'clínica estética', conversoes: 48, ctr: 0.041 },
    { keyword: 'bioestimulação facial', conversoes: 31, ctr: 0.038 }
  ]
}

function mockDadosGA4() {
  return {
    sessoes: 3240,
    usuarios_ativos: 2180,
    tempo_medio: 134,
    taxa_engajamento: 0.41,
    origens: {
      'Paid Search': { sessoes: 1814, usuarios: 1221 },
      'Organic Social': { sessoes: 713, usuarios: 480 },
      'Organic Search': { sessoes: 389, usuarios: 262 }
    }
  }
}

function mockEventosGA4() {
  return [
    { evento: 'whatsapp_click', count: 284 },
    { evento: 'form_submit', count: 97 },
    { evento: 'schedule_click', count: 43 }
  ]
}
