# FEMO CONTENT — Guia Completo de Publicação e APIs

## Visão geral do processo

```
Fase 1 → Preparar o código (1 hora)
Fase 2 → Publicar o backend (2 horas)
Fase 3 → Publicar o frontend (1 hora)
Fase 4 → Configurar as IAs — Claude + Gemini (30 min)
Fase 5 → Configurar APIs de relatórios (2–7 dias de aprovação)
Fase 6 → Configurar automações Instagram (3–10 dias de aprovação)
Fase 7 → Testes finais (1 dia)
```

---

## FASE 1 — Preparar o código

### 1.1 Estrutura final do projeto

```
femo-content/
├── frontend/          ← React (Vite) — interface
│   ├── src/
│   └── .env
├── backend/           ← Node.js (Express) — proxy das APIs
│   ├── routes/
│   └── .env
└── README.md
```

### 1.2 Criar o backend (proxy obrigatório para Google Ads e LinkedIn)

```bash
mkdir backend && cd backend
npm init -y
npm install express cors dotenv axios
npm install google-ads-api @google-analytics/data
npm install @anthropic-ai/sdk @google/generative-ai
```

Criar `backend/server.js`:

```javascript
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL }))
app.use(express.json())

// Importar rotas
import { routerClaude }    from './routes/claude.js'
import { routerGemini }    from './routes/gemini.js'
import { routerGoogleAds } from './routes/googleAds.js'
import { routerGA4 }       from './routes/ga4.js'
import { routerMeta }      from './routes/meta.js'
import { routerLinkedIn }  from './routes/linkedin.js'

app.use('/api/claude',     routerClaude)
app.use('/api/gemini',     routerGemini)
app.use('/api/google-ads', routerGoogleAds)
app.use('/api/ga4',        routerGA4)
app.use('/api/meta',       routerMeta)
app.use('/api/linkedin',   routerLinkedIn)

app.listen(process.env.PORT || 3001, () => {
  console.log('FEMO Backend rodando na porta 3001')
})
```

### 1.3 Variáveis de ambiente

`backend/.env`:
```env
PORT=3001
FRONTEND_URL=https://femocontent.app

# IAs
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...

# Google
GOOGLE_ADS_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-...
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...
GA4_PROPERTY_ID=properties/123456789
GA4_SERVICE_ACCOUNT_EMAIL=femo@projeto.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Meta
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=act_...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_ORGANIZATION_ID=...
```

`frontend/.env`:
```env
VITE_API_URL=https://api.femocontent.app
```

---

## FASE 2 — Publicar o backend

### Opção A — Railway (recomendado, mais simples)

```bash
# Instalar CLI do Railway
npm install -g @railway/cli

# Login
railway login

# Criar projeto
cd backend
railway init

# Configurar variáveis de ambiente
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set GEMINI_API_KEY=AIzaSy...
# (repetir para todas as variáveis)

# Publicar
railway up
```

O Railway gera uma URL automática: `https://femo-backend.railway.app`
Custo estimado: ~R$25–50/mês dependendo do uso.

### Opção B — Render (gratuito nos primeiros meses)

1. Acesse **render.com** → New → Web Service
2. Conecte o repositório GitHub
3. Configure:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Adicione todas as variáveis de ambiente no painel
5. Clique em Deploy

### Opção C — VPS (maior controle)

```bash
# Em um servidor Ubuntu 22.04 (DigitalOcean, Hostinger, etc.)
sudo apt update && sudo apt install nodejs npm nginx certbot

# Clonar o projeto
git clone https://github.com/seu-usuario/femo-content.git
cd femo-content/backend
npm install

# Instalar PM2 para manter o processo rodando
npm install -g pm2
pm2 start server.js --name femo-backend
pm2 save
pm2 startup

# Configurar Nginx como proxy reverso
sudo nano /etc/nginx/sites-available/femo-api
```

```nginx
server {
    server_name api.femocontent.app;
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/femo-api /etc/nginx/sites-enabled/
sudo certbot --nginx -d api.femocontent.app
sudo systemctl reload nginx
```

---

## FASE 3 — Publicar o frontend

### Opção A — Vercel (recomendado)

```bash
# Instalar CLI
npm install -g vercel

# Na pasta frontend
cd frontend
vercel

# Seguir o assistente:
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist

# Configurar variável de ambiente no painel da Vercel:
# VITE_API_URL = https://api.femocontent.app
```

Resultado: `https://femocontent.vercel.app` ou domínio próprio.

### Opção B — Netlify

```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Configurar domínio próprio (ex: femocontent.app)

1. Compre o domínio na Registro.br, Namecheap ou GoDaddy
2. Na Vercel: Settings → Domains → Add Domain
3. Aponte o DNS do domínio para a Vercel
4. Crie subdomínio `api.femocontent.app` apontando para o backend

---

## FASE 4 — Configurar as IAs (30 minutos)

### Claude — Anthropic

1. Acesse **console.anthropic.com**
2. Clique em **API Keys** → **Create Key**
3. Nomeie: `femo-production`
4. Copie a chave → cole em `ANTHROPIC_API_KEY`
5. Configure limites de uso em **Usage Limits** para evitar surpresas

**Custo estimado:** ~R$0,15 por roteiro gerado (modelo Sonnet 4.5)

### Gemini — Google AI Studio

1. Acesse **aistudio.google.com**
2. Clique em **Get API Key** → **Create API Key in new project**
3. Copie → cole em `GEMINI_API_KEY`

**Custo estimado:** gratuito até 60 req/min; Gemini 1.5 Pro ~R$0,05 por análise

---

## FASE 5 — APIs de relatórios

### 5.1 Google Ads API

**Tempo de aprovação: 1–3 dias úteis**

```
1. Acesse: developers.google.com/google-ads/api/docs/get-started
2. Crie projeto no Google Cloud Console
3. Ative a "Google Ads API"
4. Crie credenciais OAuth 2.0 (Web application)
5. Adicione URI de redirecionamento:
   https://api.femocontent.app/auth/google/callback
6. Solicite Developer Token:
   → Google Ads → Ferramentas → API Center → Apply for access
7. Aguarde aprovação (e-mail em 1–3 dias)
8. Gere Refresh Token usando o OAuth Playground:
   developers.google.com/oauthplayground
   → scope: https://www.googleapis.com/auth/adwords
```

### 5.2 Google Analytics 4

**Tempo de aprovação: imediato**

```
1. Console: console.cloud.google.com
2. APIs e Serviços → Ativar → "Google Analytics Data API"
3. Credenciais → Criar credenciais → Conta de serviço
4. Nomeie: femo-ga4-reader
5. Papel: Leitor
6. Baixe o JSON de credenciais
7. No GA4: Admin → Propriedade → Acesso à propriedade
   → Adicionar: email da conta de serviço (papel: Leitor)
8. Copie client_email e private_key do JSON para o .env
```

### 5.3 Meta Graph API (Instagram + Facebook Ads)

**Tempo de aprovação: 5–10 dias úteis**

```
Etapa 1 — Criar App no Meta:
1. developers.facebook.com → My Apps → Create App
2. Tipo: Business
3. Nome: FEMO Content Agency
4. Email: seu@email.com

Etapa 2 — Adicionar produtos:
→ Instagram Graph API (para dados orgânicos)
→ Marketing API (para Facebook/Instagram Ads)
→ Instagram Basic Display (opcional, para perfis)

Etapa 3 — Configurar permissões necessárias:
Para dados orgânicos (Instagram Insights):
  - instagram_basic
  - instagram_manage_insights
  - pages_show_list
  - pages_read_engagement

Para automações (comentários + DM):
  - instagram_manage_comments
  - pages_messaging
  - instagram_manage_messages

Para Meta Ads:
  - ads_read
  - ads_management
  - business_management

Etapa 4 — Solicitar revisão:
→ App Review → Request Advanced Access
→ Preencher justificativa de uso para cada permissão
→ Gravar vídeo demonstrando o uso (obrigatório)
→ Enviar para revisão

Etapa 5 — Gerar token de produção:
→ Após aprovação: Graph API Explorer
→ Gerar token com todas as permissões aprovadas
→ Converter para Long-lived Token (60 dias):
   GET /oauth/access_token?grant_type=fb_exchange_token
   &client_id={APP_ID}&client_secret={SECRET}
   &fb_exchange_token={TOKEN}

IMPORTANTE: Configure renovação automática do token
antes de expirar (use o endpoint de refresh).
```

### 5.4 LinkedIn Marketing API

**Tempo de aprovação: 3–7 dias úteis**

```
1. developer.linkedin.com → Create App
2. Nome: FEMO Content
3. LinkedIn Page: página da sua empresa
4. Logo: fazer upload

5. Products → Solicitar acesso:
   → "Marketing Developer Platform"
   → "Share on LinkedIn" (para posts)
   → "Sign In with LinkedIn" (para OAuth)

6. Permissões necessárias:
   - r_organization_social
   - r_ads_reporting
   - r_ads
   - w_organization_social (para postar)

7. Auth → OAuth 2.0 settings:
   Redirect URL: https://api.femocontent.app/auth/linkedin/callback

8. Após aprovação: gerar Access Token via OAuth 2.0
   (token expira em 60 dias — configurar refresh automático)
```

---

## FASE 6 — Automações Instagram (ManyChat style)

**Tempo de aprovação: parte das permissões Meta (Fase 5)**

As automações dependem das permissões:
- `instagram_manage_comments` → resposta automática a comentários
- `pages_messaging` → envio de DM automático
- `instagram_manage_messages` → leitura e envio de DMs

```javascript
// backend/routes/automacoes.js

// Webhook para receber comentários em tempo real
app.post('/webhook/instagram', (req, res) => {
  const { entry } = req.body
  entry.forEach(async (e) => {
    const changes = e.changes || []
    changes.forEach(async (change) => {
      if (change.field === 'comments') {
        const comment = change.value
        const texto = comment.text?.toLowerCase()
        
        // Verificar se contém palavra-chave
        const automacoes = await buscarAutomacoes(comment.media_id)
        for (const auto of automacoes) {
          if (texto.includes(auto.keyword.toLowerCase())) {
            // Responder comentário
            await responderComentario(comment.id, auto.resposta_comentario)
            // Enviar DM
            await enviarDM(comment.from.id, auto.mensagem_dm)
          }
        }
      }
    })
  })
  res.sendStatus(200)
})

// Registrar webhook no Meta
// GET /webhook → verificação
// POST /webhook → receber eventos
```

```bash
# Registrar webhook no Meta (via Graph API)
curl -X POST \
  "https://graph.facebook.com/v20.0/{app-id}/subscriptions" \
  -d "object=instagram" \
  -d "callback_url=https://api.femocontent.app/webhook/instagram" \
  -d "fields=comments,messages" \
  -d "verify_token=SEU_TOKEN_SECRETO" \
  -d "access_token={APP_ACCESS_TOKEN}"
```

---

## FASE 7 — Checklist de testes finais

### Testar as IAs
```
[ ] Gerar roteiro de vídeo (Claude) — verificar tom e formato
[ ] Gerar roteiro de carrossel (Claude) — verificar 3 camadas impu
[ ] Analisar perfil Instagram via @ (Gemini)
[ ] Gerar diagnóstico de cliente (Gemini)
[ ] Verificar compliance CFM em roteiro médico (Gemini)
[ ] Sugerir entradas para banco do criador (Claude)
```

### Testar relatórios
```
[ ] Google Ads — impressões, cliques, conversões
[ ] GA4 — sessões, origem do tráfego, eventos
[ ] Instagram — seguidores, alcance, top posts
[ ] Meta Ads — investimento, leads, CPM
[ ] LinkedIn — seguidores, engajamento, demografia
[ ] Exportação de PDF com análise do gestor
```

### Testar automações
```
[ ] Comentar palavra-chave no post de teste → verificar resposta
[ ] Verificar DM recebido após comentário
[ ] Novo seguidor → verificar boas-vindas no DM
[ ] DM direto → verificar resposta automática
[ ] Toggle ativar/desativar fluxo
[ ] Analytics de conversão por fluxo
```

### Testar aprovação do cliente
```
[ ] Gerar link público de aprovação
[ ] Abrir no modo anônimo (simular cliente)
[ ] Aprovar item por item
[ ] Aprovar bloco inteiro
[ ] Aprovar mês inteiro
[ ] Verificar status atualizado no painel da agência
```

---

## Custos mensais estimados (produção)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel (frontend) | Pro | R$100/mês |
| Railway (backend) | Starter | R$50/mês |
| Claude Sonnet 4.5 | Pay per use | R$15–30/cliente/mês |
| Gemini 1.5 Pro | Pay per use | R$5–10/cliente/mês |
| Google Ads API | Gratuito | R$0 |
| GA4 API | Gratuito | R$0 |
| Meta Graph API | Gratuito | R$0 |
| LinkedIn Marketing | Gratuito | R$0 |
| Domínio (femocontent.app) | Anual | ~R$80/ano |
| **Total fixo** | | **~R$150–200/mês** |
| **Total por cliente** | | **~R$20–40/mês** |

Com 10 clientes, o app se paga com folga.

---

## Sequência recomendada para começar

```
Semana 1:
  Dia 1 → Fase 1: preparar código + criar contas
  Dia 2 → Fase 2 + 3: publicar backend + frontend
  Dia 3 → Fase 4: Claude + Gemini funcionando
  Dia 4 → Iniciar solicitações Meta, Google Ads, LinkedIn
  Dia 5 → Testes com Claude + Gemini + mock data

Semana 2:
  Dia 1–3 → Aguardar aprovações (trabalhe nos ajustes de prompts)
  Dia 4–5 → Conectar APIs aprovadas + testes finais

Semana 3:
  → App em produção com 1 cliente real
  → Ajustes de tom + calibração dos prompts
  → Ativar automações após aprovação Meta
```
