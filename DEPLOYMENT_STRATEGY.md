# Estratégia de Deploy FEMO CONTENT

## Status Atual
- Frontend (Vite + React): raiz do projeto
- Backend (Express): `/backend`
- Problemas: Vercel não detecta corretamente a estrutura monorepo

## Estratégia Recomendada: 2 Repositórios Separados

Embora tenhamos 1 repo git atualmente, o deploy será em 2 plataformas diferentes com configurações otimizadas para cada uma.

```
GitHub:
├── femo-content/       ← ATUAL (ambos frontend + backend)
│
Após refatoração:
├── femo-frontend/      → Deploy: Vercel
├── femo-backend/       → Deploy: Render
```

## Por que separar?

1. **Vercel** espera uma aplicação Vite/React pura na raiz
   - Seu `vercel.json` fica muito simples
   - Auto-detecção funciona perfeitamente
   - Sem conflitos com backend

2. **Render** espera uma aplicação Node.js pura na raiz
   - Seu `server.js` fica no root
   - Auto-detecção funciona perfeitamente
   - Sem conflitos com frontend

3. **Independência de deploy**
   - Frontend pode fazer deploy sem backend
   - Backend pode fazer deploy sem frontend
   - Versionamento independente

## Problemas Resolvidos

### ✓ Problema 1: "npm error Missing script: build"
**Antes:** Vercel procurava `build` na raiz, achava o package.json do backend
**Depois:** Vercel procura em repo frontend-only, encontra `build` corretamente

### ✓ Problema 2: "Permission denied (exit code 126)"
**Antes:** npm install duplicado, conflito com npm ci do Vercel
**Depois:** Vercel roda npm install uma única vez, sem duplicação

### ✓ Problema 3: vercel.json complexo e redundante
**Antes:** buildCommand redundante, múltiplos routes
**Depois:** Minimal config, deixar Vercel auto-detectar

### ✓ Problema 4: node_modules no git
**Adicionado:** .gitignore correto (removendo node_modules do versionamento)

### ✓ Problema 5: .env com chaves no git
**Antes:** Chaves de API expostas no repositório
**Depois:** .env no .gitignore, variáveis definidas no painel Vercel/Render

## Configuração Mínima Para Sucesso

### vercel.json (Frontend)
```json
{
  "framework": "vite",
  "outputDirectory": "dist"
}
```
Nada mais. Vercel auto-detecta tudo.

### package.json (Backend)
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```
Render procura por `start` script automaticamente.

### Variáveis de Ambiente

**Frontend (.env na Vercel):**
```
VITE_API_URL=https://femo-backend.onrender.com
```

**Backend (.env no Render):**
```
PORT=3001
FRONTEND_URL=https://seu-frontend.vercel.app
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=AIzaSy...
```

## Passo a Passo de Implementação

### FASE 1: Preparação Local (hoje)

1. **Criar .gitignore** → remove node_modules, dist, .env
   ```bash
   git add .gitignore
   git commit -m "chore: add .gitignore"
   ```

2. **Limpar git** → remove arquivos grandes do histórico
   ```bash
   git rm -r --cached node_modules/ backend/node_modules/ dist/ 2>/dev/null || true
   git rm --cached .env backend/.env 2>/dev/null || true
   git commit -m "chore: remove tracked node_modules/dist/.env"
   ```

3. **Atualizar vercel.json** → remover buildCommand redundante
   (✓ já feito)

### FASE 2: Frontend (Vercel)

1. **Criar novo repo** `femo-frontend` no GitHub
   - Apenas arquivos: `src/`, `package.json`, `vite.config.js`, `index.html`

2. **Deploy no Vercel**
   ```bash
   vercel --prod
   ```
   - Conectar repo GitHub
   - Vercel auto-detecta Vite
   - Pronto em ~2 minutos

3. **Definir variável de ambiente**
   ```
   Vercel Dashboard → Settings → Environment Variables
   VITE_API_URL = https://femo-backend.onrender.com
   ```

### FASE 3: Backend (Render)

1. **Criar novo repo** `femo-backend` no GitHub
   - Apenas arquivos: `server.js`, `routes/`, `package.json`

2. **Deploy no Render**
   ```
   render.com → New Web Service → Connect GitHub
   ```
   - Render auto-detecta Node.js
   - Build Command: (deixar vazio)
   - Start Command: `npm start`

3. **Definir variáveis de ambiente**
   ```
   Render Dashboard → Environment
   PORT=3001
   FRONTEND_URL=https://seu-frontend.vercel.app
   ANTHROPIC_API_KEY=...
   GEMINI_API_KEY=...
   ```

### FASE 4: Testar Integração

1. **Frontend testa backend:**
   ```
   curl https://seu-frontend.vercel.app
   → deve conectar com femo-backend.onrender.com
   ```

2. **Verificar logs:**
   - Vercel: Dashboard → Deployments → Logs
   - Render: Dashboard → Logs

## Troubleshooting

### Se Vercel não detecta Vite
**Causa:** `buildCommand` em vercel.json
**Solução:** Remover buildCommand, deixar apenas framework e outputDirectory

### Se Render não detecta Node.js
**Causa:** package.json faltando ou corrompido
**Solução:** Verificar se `start` script existe e `node --version` roda

### Se API URL está incorreta
**Causa:** VITE_API_URL não definida no Vercel
**Solução:** Adicionar em Vercel Dashboard → Environment Variables

### Se permissão negada no vite
**Causa:** npm install duplicado em vercel.json
**Solução:** Remover `npm install &&` do buildCommand (já feito)

## Links Úteis

- [Vercel Vite Guide](https://vercel.com/docs/frameworks/vite)
- [Render Node.js Guide](https://render.com/docs/deploy-node-express-app)
- [GitHub Monorepo Best Practices](https://github.com/features/actions)

## Custos Mensais (Estimado)

| Serviço | Plano | Custo |
|---------|-------|-------|
| Vercel | Hobby (gratuito) | R$0 |
| Render | Free (até 750h/mês) | R$0 |
| Domínio | .app/com | ~R$80/ano |
| Claude + Gemini | Pay-per-use | ~R$20–50/mês |
| **Total** | | **~R$50–100/mês** |

Com 3–5 clientes, o projeto se paga com folga.

---

**Status:** Pronto para implementação
**Tempo estimado:** 2–3 horas
**Risco:** Baixo (deploy em sandbox, sem perder repo atual)
