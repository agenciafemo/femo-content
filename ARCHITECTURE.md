# Arquitetura — FEMO CONTENT

## Status Atual (PROBLEMÁTICO)

```
GitHub (1 repo)
    └─ femo-content/
       ├─ frontend/
       │  ├─ src/
       │  ├─ package.json
       │  └─ vite.config.js
       │
       └─ backend/
          ├─ server.js
          └─ package.json

          ↓
          
Vercel tentando fazer:
├─ Detectar Vite → CONFUSO (tem backend/ também)
├─ Rodar npm run build → OK
├─ Roda npm install → OK, mas...
├─ npm install roda de novo → ERRO (duplicado em buildCommand)
└─ Permissão negada → FALHA

Render (não está sendo usado)
```

---

## Arquitetura Proposta (ÓTIMO)

```
GitHub
├─ femo-frontend/          →  VERCEL
│  ├─ src/
│  ├─ index.html
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ vercel.json (MINIMAL)
│  └─ .gitignore
│
└─ femo-backend/           →  RENDER
   ├─ server.js
   ├─ routes/
   ├─ package.json
   └─ .gitignore
```

### Fluxo de Requisições

```
┌─────────────────────────────────────────────────────────┐
│                    NAVEGADOR DO USUÁRIO                 │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ├──── GET /               ─────┐
                       │     (HTML + JS)              │
                       │                              │
                       ▼                              │
         ┌──────────────────────────────┐             │
         │  FRONTEND                    │             │
         │  https://femo-frontend...    │◄────────────┘
         │  (Vercel)                    │
         │                              │
         │  • React Components          │
         │  • UI / Formulários          │
         │  • Vite + HMR (dev)          │
         └──────────────┬───────────────┘
                        │
                        ├─ GET /api/claude ─────────────┐
                        ├─ GET /api/gemini ─────────────│
                        ├─ GET /api/google-ads ────────┐│
                        └─ POST /api/* ────────────────┘│
                                                        │
                        ┌───────────────────────────────┘
                        │
                        ▼
         ┌──────────────────────────────┐
         │  BACKEND                     │
         │  https://femo-backend...     │
         │  (Render)                    │
         │                              │
         │  • Express Routes            │
         │  • CORS Proxy                │
         │  • API Keys Management       │
         │  • Database Queries          │
         └──────────────┬───────────────┘
                        │
         ┌──────────────┼──────────────┬────────────────┐
         │              │              │                │
         ▼              ▼              ▼                ▼
    ┌────────┐    ┌────────┐    ┌────────────┐  ┌──────────┐
    │ Claude │    │ Gemini │    │  Google    │  │   Meta   │
    │ API    │    │ API    │    │  Ads API   │  │ API      │
    │        │    │        │    │  GA4 API   │  │  LinkedIn│
    └────────┘    └────────┘    └────────────┘  └──────────┘
```

---

## Configuração por Ambiente

### LOCAL (seu computador)

```
npm run dev
├─ Frontend: http://localhost:5173 (Vite)
└─ Backend: http://localhost:3001 (Express)

vite.config.js proxy:
  /api/* → http://localhost:3001/api/*
```

**Variáveis de ambiente:**
```
VITE_API_URL=http://localhost:3001
```

---

### PRODUCTION (Vercel + Render)

#### Frontend (Vercel)

```
URL: https://femo-frontend.vercel.app

package.json:
├─ npm run dev   → Vite dev server (não usado em prod)
├─ npm run build → vite build → dist/
└─ npm run preview → Prever production build

vercel.json:
{
  "framework": "vite",
  "outputDirectory": "dist"
}

Vercel automático:
1. git push → GitHub webhook
2. Vercel clona repo
3. npm install (automático)
4. npm run build (automático, porque framework=vite)
5. Upload dist/ → CDN
6. Deploy em ~2 minutos
```

**Variáveis de ambiente:**
```
VITE_API_URL=https://femo-backend.onrender.com
```

#### Backend (Render)

```
URL: https://femo-backend.onrender.com

package.json:
├─ npm start → node server.js (PROD)
└─ npm run dev → node server.js (DEV, mesmo comando)

Render automático:
1. git push → GitHub webhook
2. Render clona repo
3. npm install (automático)
4. npm start (automático, detecta Node.js)
5. Aguarda health check
6. Deploy em ~5 minutos
```

**Variáveis de ambiente:**
```
PORT=3001
FRONTEND_URL=https://femo-frontend.vercel.app
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

---

## Ciclo de Deploy

### Cenário 1: Atualizar Frontend

```
1. Editar arquivo em src/
2. git add .
3. git commit -m "feat: add new component"
4. git push origin main
5. GitHub notifica Vercel
6. Vercel roda npm run build
7. Novo dist/ enviado para CDN
8. Usuários recebem novo código em ~2 min
```

### Cenário 2: Atualizar Backend

```
1. Editar routes/claude.js
2. git add .
3. git commit -m "fix: improve Claude prompt"
4. git push origin main
5. GitHub notifica Render
6. Render roda npm install && npm start
7. Novo server rodando
8. Usuários recebem novo backend em ~5 min
```

### Cenário 3: Atualizar ambos

```
1. Fazer commits em ambos os repos
2. Frontend: push em femo-frontend
3. Backend: push em femo-backend
4. Ambos deployam em paralelo
5. Zero downtime
```

---

## Comparação: Antes vs Depois

| Aspecto | ANTES (Monorepo no Vercel) | DEPOIS (2 Repos Separados) |
|---------|---------------------------|--------------------------|
| **Detecção automática** | ❌ Vercel confuso | ✓ Vercel detecta Vite |
| **npm install** | ❌ Duplicado (erro) | ✓ Executado 1x |
| **Permissões** | ❌ Exit code 126 | ✓ Sem erros |
| **Tempo de build** | ❌ 5–10 min | ✓ 2–3 min |
| **Complexidade** | ❌ vercel.json complexo | ✓ vercel.json minimal |
| **Deploy independente** | ❌ Tudo junto | ✓ Frontend OU Backend |
| **Versionamento** | ❌ Ambos sincronizados | ✓ Versões independentes |
| **Repos Git** | ❌ 1 monorepo | ✓ 2 repos especializados |
| **Suporte** | ❌ Monorepo é advanced | ✓ Standard setup |

---

## Tecnologias por Camada

```
┌─────────────────────────────────────────────────────┐
│  CAMADA 1: APRESENTAÇÃO                             │
│  ────────────────────────────────────────────────   │
│  • React 18.3.1 → Componentes interativos          │
│  • Vite 5.4.8 → Build rápido + HMR                 │
│  • @vitejs/plugin-react → JSX support              │
│  • Axios → Requisições HTTP                         │
└────────────┬────────────────────────────────────────┘
             │ VITE_API_URL=https://femo-backend...
             │
┌────────────▼────────────────────────────────────────┐
│  CAMADA 2: API GATEWAY (Backend)                    │
│  ────────────────────────────────────────────────   │
│  • Express 5.2.1 → Server HTTP                      │
│  • CORS → Compartilhamento de origem                │
│  • dotenv → Variáveis de ambiente                   │
│  • Axios → Requisições para APIs externas           │
│  • Routes:                                          │
│    • /api/claude   → Anthropic API                 │
│    • /api/gemini   → Google Gemini API             │
│    • /api/google-ads → Google Ads API              │
│    • /api/ga4 → Google Analytics 4 API             │
│    • /api/meta → Meta Graph API                    │
│    • /api/linkedin → LinkedIn Marketing API         │
└────────────┬────────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│  CAMADA 3: APIs EXTERNAS                            │
│  ────────────────────────────────────────────────   │
│  Anthropic   → Claude Sonnet 4.5 (roteiros)         │
│  Google AI   → Gemini 1.5 Pro (análises)            │
│  Google Ads  → Google Ads API (campanha)            │
│  Google Analytics → GA4 API (métricas)              │
│  Meta Graph  → Instagram + Facebook Ads             │
│  LinkedIn    → Ads + Posts                          │
└─────────────────────────────────────────────────────┘
```

---

## Segurança

### Chaves de API

```
❌ NÃO fazer:
├─ Expor ANTHROPIC_API_KEY no frontend
├─ Commitar .env no git
└─ Hardcodes no código

✓ FAZER:
├─ Backend faz proxy das requisições
├─ Frontend envia dados para backend
├─ Backend usa chaves de ambiente do Render
├─ Chaves nunca deixam Render
└─ CORS configurado para apenas frontend
```

### CORS

```
Backend:
app.use(cors({
  origin: process.env.FRONTEND_URL
  // ✓ Só permite requisições de femo-frontend.vercel.app
  // ❌ Bloqueia origem desconhecida
}))

Se habilitar: app.use(cors())
→ QUALQUER um pode usar suas chaves de API
→ Risco: atacante faz 1000 requests em seu nome
→ Custo: R$100+ em minutos
```

### Autenticação

Futura:
```
Frontend → Login → Backend retorna token JWT
Frontend → API call + token no header Authorization
Backend → Valida token → Executa ação ou rejeita
```

---

## Monitoramento

### Vercel

```
https://vercel.com/dashboard/femo-frontend
├─ Deployments → Histórico + status
├─ Logs → Console output
├─ Analytics → Visitantes, performance
└─ Settings → Variáveis de ambiente
```

### Render

```
https://dashboard.render.com/femo-backend
├─ Logs → Console output
├─ Metrics → CPU, memória, requests
├─ Environment → Variáveis
└─ Manual Deploy → Redeploy em um clique
```

---

## Escalabilidade Futura

Se tiver 100+ clientes:

```
ATUAL (OK para 10–50 clientes):
Render Free
├─ 750h/mês (suficiente para app com <1000 RPS)
└─ Spin down após 15min inatividade (cold start)

UPGRADE 1 (50–500 clientes):
Render Starter
├─ R$50–100/mês
├─ Dedicated container
└─ Sem spin down

UPGRADE 2 (500+ clientes):
Infraestrutura própria
├─ AWS EC2 + RDS
├─ Kubernetes
└─ Auto-scaling
```

---

## Diagrama de Decisão

```
Precisa deployar novo código?

    │
    ├─ Apenas Frontend
    │  └─ git push femo-frontend → Vercel auto-deploy
    │     (2–3 min)
    │
    ├─ Apenas Backend
    │  └─ git push femo-backend → Render auto-deploy
    │     (3–5 min)
    │
    └─ Frontend + Backend
       └─ git push ambos repos → Ambos auto-deploy em paralelo
          (máx 5 min total)
```

---

## Checklist de Conformidade

```
✓ Vite configurado corretamente
✓ React rodando em SPA
✓ API proxy no backend
✓ CORS protegido
✓ .env do git (segurança)
✓ node_modules removido (tamanho)
✓ Deploy automático em ambas plataformas
✓ Variáveis de ambiente em Vercel e Render
✓ Logs acessíveis
✓ Zero downtime entre deployments
```
