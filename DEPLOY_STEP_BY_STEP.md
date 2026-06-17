# Deploy FEMO CONTENT — Guia Passo a Passo

## FASE 1: Preparação Local (30 minutos)

### Passo 1.1: Limpar o repositório Git

```bash
cd C:\Users\user\Desktop\SITES\femo-content

# 1. Remover node_modules do versionamento
git rm -r --cached node_modules 2>/dev/null || true
git rm -r --cached backend/node_modules 2>/dev/null || true

# 2. Remover dist do versionamento
git rm -r --cached dist 2>/dev/null || true

# 3. Remover .env (segurança)
git rm --cached .env 2>/dev/null || true
git rm --cached backend/.env 2>/dev/null || true

# 4. Criar commit
git add .gitignore
git commit -m "chore: cleanup tracked node_modules/dist and .env files"

# 5. Verificar resultado
git status
# Deve mostrar "nothing to commit, working tree clean"
```

---

## FASE 2: Deploy Frontend no Vercel (1 hora)

### Passo 2.1: Criar repositório no GitHub (apenas frontend)

```bash
# 1. Ir para https://github.com/new
# 2. Nome: femo-frontend
# 3. Descrição: FEMO CONTENT — Frontend (Vite + React)
# 4. Public
# 5. Create repository

# 2.2: Clonar localmente
cd C:\temp
git clone https://github.com/SEU-USUARIO/femo-frontend.git
cd femo-frontend

# 2.3: Copiar arquivos do frontend (NÃO COPIE backend/)
xcopy "C:\Users\user\Desktop\SITES\femo-content\src" "src" /E /I /Y
xcopy "C:\Users\user\Desktop\SITES\femo-content\package.json" "package.json" /Y
xcopy "C:\Users\user\Desktop\SITES\femo-content\package-lock.json" "package-lock.json" /Y
xcopy "C:\Users\user\Desktop\SITES\femo-content\vite.config.js" "vite.config.js" /Y
xcopy "C:\Users\user\Desktop\SITES\femo-content\index.html" "index.html" /Y

# 2.4: Criar .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Production
/dist

# Environment
.env
.env.local

# Logs
npm-debug.log*
yarn-debug.log*

# Editor
.vscode/
.idea/
.DS_Store
EOF

# 2.5: Criar vercel.json MINIMAL
cat > vercel.json << 'EOF'
{
  "framework": "vite",
  "outputDirectory": "dist"
}
EOF

# 2.6: Verificar estrutura
# Deve ter:
# ├── src/
# ├── index.html
# ├── package.json
# ├── vite.config.js
# ├── vercel.json
# └── .gitignore

# 2.7: Primeira instalação local (verificação)
npm install

# 2.8: Testar build local
npm run build
# Deve criar pasta dist/ sem erros

# 2.9: Push para GitHub
git add .
git commit -m "Initial commit: frontend setup for Vercel"
git push -u origin main
```

### Passo 2.2: Deploy no Vercel

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm install -g vercel

# 2. Login (abrirá navegador)
vercel login

# 3. Na pasta femo-frontend
vercel --prod

# Responder às perguntas:
# ? Set up and deploy "~/femo-frontend"? [Y/n] → Y
# ? Which scope do you want to deploy to? → Seu nome/conta
# ? Link to existing project? [y/N] → N
# ? What's your project's name? → femo-frontend
# ? In which directory is your code located? → .
# ? Want to modify these settings? [y/N] → N

# 4. Aguardar deploy (2–3 minutos)
# Vercel vai gerar URL: https://femo-frontend.vercel.app

# 5. Salvar URL para usar depois
echo "Frontend URL: https://femo-frontend.vercel.app"
```

### Passo 2.3: Configurar variável de ambiente no Vercel

```bash
# 1. Ir para: https://vercel.com/dashboard/femo-frontend
# 2. Settings → Environment Variables
# 3. Add new:
#    Name: VITE_API_URL
#    Value: https://femo-backend.onrender.com (ou URL do seu backend)
# 4. Marcar: Production, Preview, Development
# 5. Save

# 6. Redeploy (para ativar variável)
vercel --prod --force
```

---

## FASE 3: Deploy Backend no Render (1 hora)

### Passo 3.1: Criar repositório no GitHub (apenas backend)

```bash
# 1. Ir para https://github.com/new
# 2. Nome: femo-backend
# 3. Descrição: FEMO CONTENT — Backend (Express + APIs)
# 4. Public
# 5. Create repository

# 3.2: Clonar localmente
cd C:\temp
git clone https://github.com/SEU-USUARIO/femo-backend.git
cd femo-backend

# 3.3: Copiar arquivos do backend
xcopy "C:\Users\user\Desktop\SITES\femo-content\backend\*" "." /E /I /Y

# 3.4: Limpar .env (IMPORTANTE!)
# Deletar backend/.env do repo
git rm --cached .env 2>/dev/null || true

# 3.5: Criar .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Environment
.env
.env.local

# Logs
npm-debug.log*
yarn-debug.log*

# Editor
.vscode/
.idea/
.DS_Store
EOF

# 3.6: Verificar package.json
# Deve ter "start": "node server.js"
cat package.json

# 3.7: Primeira instalação local (verificação)
npm install

# 3.8: Push para GitHub
git add .
git commit -m "Initial commit: backend setup for Render"
git push -u origin main
```

### Passo 3.2: Deploy no Render

```bash
# 1. Ir para https://dashboard.render.com
# 2. New → Web Service
# 3. Conectar GitHub:
#    - Autorizar Render a acessar GitHub
#    - Selecionar "femo-backend" repo
#    - Confirmar
#
# 4. Configurar:
#    Name: femo-backend
#    Region: São Paulo (us-south-1) — mais perto do Brasil
#    Branch: main
#    Build Command: (deixar VAZIO)
#    Start Command: npm start
#    Plan: Free (gratuito)
#
# 5. Clicar "Create Web Service"
# 6. Render vai fazer auto-deploy e gerar URL: femo-backend.onrender.com
```

### Passo 3.3: Configurar variáveis de ambiente no Render

```bash
# 1. No dashboard Render, ir para femo-backend
# 2. Environment → Add Environment Variable
# 3. Adicionar cada uma:

# Básico
PORT=3001
FRONTEND_URL=https://femo-frontend.vercel.app

# IAs
ANTHROPIC_API_KEY=sk-ant-... (obter em console.anthropic.com)
GEMINI_API_KEY=AIzaSy... (obter em aistudio.google.com)

# Google Ads (quando tiver aprovação)
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...

# GA4 (quando tiver aprovação)
GA4_PROPERTY_ID=properties/...
GA4_SERVICE_ACCOUNT_EMAIL=...
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Meta (quando tiver aprovação)
META_APP_ID=...
META_APP_SECRET=...
META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=...

# LinkedIn (quando tiver aprovação)
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...
LINKEDIN_ACCESS_TOKEN=...
LINKEDIN_ORGANIZATION_ID=...

# 4. Após cada adição, Render faz redeploy automático
```

---

## FASE 4: Testar Integração (30 minutos)

### Passo 4.1: Verificar se Frontend conecta ao Backend

```bash
# 1. Acessar frontend
# https://femo-frontend.vercel.app

# 2. Abrir DevTools (F12) → Console
# 3. Verificar se há erros de CORS

# 4. Se houver erro de CORS no backend:
#    Ir para backend/server.js
#    Verificar:
#    app.use(cors({ origin: process.env.FRONTEND_URL }))
#    
#    Render dashboard → Environment Variables
#    FRONTEND_URL=https://femo-frontend.vercel.app (sem trailing slash)

# 5. Se ainda tiver erro, temporariamente usar:
#    app.use(cors()) // Permite todos (SÓ para debug!)
#    Depois voltar a usar origin específico
```

### Passo 4.2: Testar chamada à API

```bash
# No console do navegador (F12):

const response = await fetch(
  'https://femo-backend.onrender.com/api/claude',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'Hello' })
  }
)
console.log(await response.json())

# Deve retornar resposta da API (ou erro de autenticação, mas não de CORS)
```

### Passo 4.3: Verificar logs

**Vercel:**
```
https://vercel.com/dashboard/femo-frontend
→ Deployments → Latest deploy → Logs
```

**Render:**
```
https://dashboard.render.com
→ femo-backend → Logs
```

Procure por:
- Erros de "npm not found" → npm install não rodou
- Erros de "permission denied" → problema de permissões
- Erros de "missing script" → package.json não tem "build" ou "start"
- Erros de "CORS" → FRONTEND_URL incorreta

---

## FASE 5: Configuração de Domínio Customizado (Opcional)

### Se quiser usar seu próprio domínio (ex: femo.com.br)

**Frontend no Vercel:**
```
1. Comprar domínio em Namecheap, GoDaddy, etc.
2. Vercel dashboard → Settings → Domains
3. Add Domain → femo.com.br
4. Seguir instruções de DNS
5. Esperar 5–30 minutos (propagação de DNS)
```

**Backend no Render:**
```
1. Criar subdomínio apontando para Render
   Namecheap/GoDaddy → DNS Manager:
   Type: CNAME
   Name: api
   Value: femo-backend.onrender.com
   TTL: 1 hora (ou padrão)
2. Aguardar propagação
3. Testar: curl https://api.femo.com.br
```

---

## FASE 6: Automações do Git (Opcional)

### Deploy automático quando fizer push

**Frontend (Vercel):**
```
✓ Já está configurado automaticamente
Quando fizer push em main, Vercel redeploy automaticamente
```

**Backend (Render):**
```
✓ Já está configurado automaticamente
Quando fizer push em main, Render redeploy automaticamente
```

---

## Checklist Final

```
[ ] .gitignore criado e commitado
[ ] node_modules removido do git
[ ] .env removido do git
[ ] Frontend repo criado (femo-frontend)
[ ] Frontend deployado no Vercel
[ ] VITE_API_URL configurada no Vercel
[ ] Backend repo criado (femo-backend)
[ ] Backend deployado no Render
[ ] Variáveis de ambiente configuradas no Render
[ ] Frontend consegue comunicar com backend
[ ] Logs verificados (sem erros)
[ ] Teste de API feito manualmente
[ ] Deploy automático funcionando
```

---

## Troubleshooting Rápido

| Erro | Causa | Solução |
|------|-------|---------|
| "npm: command not found" | Node não instalado | Instalar Node.js em https://nodejs.org |
| "permission denied" | Vite sem permissão | Remover `npm install &&` de vercel.json |
| "Cannot find module" | node_modules não instalado | Verificar se `npm install` rodou |
| "CORS error" | Frontend URL incorreta | Verificar `FRONTEND_URL` no Render |
| "API 404" | Endpoint não existe | Verificar rotas em backend/routes/ |
| "Vercel auto-detect failed" | buildCommand redundante | Remover buildCommand de vercel.json |
| "Render cold start slow" | Primeiro deploy | Esperado, próximos são mais rápidos |

---

## URLs Importantes

- Vercel Dashboard: https://vercel.com/dashboard
- Render Dashboard: https://dashboard.render.com
- GitHub: https://github.com
- Claude API: https://console.anthropic.com
- Gemini API: https://aistudio.google.com

---

## Próximos Passos Após Deploy

1. **Testar todas as IAs**
   - Claude: /gerar-roteiro-video
   - Gemini: /analisar-perfil-instagram

2. **Solicitar aprovações das APIs** (vai demorar 3–10 dias)
   - Google Ads API
   - Meta Graph API
   - LinkedIn Marketing API

3. **Configurar domínio customizado** (opcional)

4. **Monitorar performance**
   - Vercel Analytics
   - Render Metrics

5. **Adicionar CI/CD** (GitHub Actions, posteriori)

---

**Status:** Pronto para deploy
**Tempo total:** 2–3 horas
**Risco:** BAIXO (Vercel e Render têm free tier)
**Suporte:** Se tiver dúvidas, consulte logs em Vercel/Render Dashboard
