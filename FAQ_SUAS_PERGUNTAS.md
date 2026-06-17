# FAQ — Respostas às Suas 5 Perguntas

## Pergunta 1: Qual é a melhor estratégia para deployar esse projeto?

### Resposta Completa

A **melhor estratégia é 2 repositórios Git separados, cada um deployado em sua plataforma ideal:**

```
GitHub:
├─ femo-frontend/  →  Vercel (frontend)
└─ femo-backend/   →  Render (backend)
```

### Por Quê?

#### Opção A: Monorepo Único (Seu problema atual)
```
Vantagens:
✓ 1 repo para clonar
✓ Commits sincronizados

Desvantagens:
❌ Vercel confuso (detecta frontend + backend)
❌ Permissão negada (npm install duplicado)
❌ vercel.json complexo
❌ Suporte limitado (não é standard)
❌ Deploy mais lento (tudo junto)
❌ Não pode deployar só frontend OU só backend
❌ Versionamento acoplado
```

#### Opção B: 2 Repositórios (RECOMENDADO)
```
Vantagens:
✓ Vercel auto-detecta Vite perfeitamente
✓ Render auto-detecta Node.js perfeitamente
✓ Zero permissão negada
✓ vercel.json minimal
✓ Setup standard (documentado)
✓ Deploy rápido (2–3 min frontend, 3–5 min backend)
✓ Deploy independente
✓ Versiones independentes
✓ Máximo suporte

Desvantagens:
- 2 repos ao invés de 1 (trivial com git clone)
- Sincronização manual (mas é melhor ter versões independentes)
```

### Exemplos de Estratégias por Escala

**Pequeno (10–50 clientes):**
```
GitHub
├─ femo-frontend (Vercel)
└─ femo-backend (Render free tier)

Custo: Gratuito
Tempo setup: 2 horas
Suporte: Excelente (setup standard)
```

**Médio (50–500 clientes):**
```
GitHub
├─ femo-frontend (Vercel Pro, R$100/mês)
└─ femo-backend (Render Starter, R$50/mês)

Custo: ~R$150/mês
Tempo setup: Mesmo (upgrade no painel)
Suporte: Excelente
```

**Grande (500+ clientes):**
```
GitHub (monorepo com turborepo)
├─ apps/frontend → AWS Amplify + CloudFront
├─ apps/backend → AWS ECS + RDS
└─ packages/shared → SDK compartilhado

Custo: ~R$500–1000/mês
Tempo setup: Semanas (arquiteto DevOps)
Suporte: Excelente (infraestrutura own)
```

### Conclusão
**Use 2 repositórios.** É a melhor combinação de simplicidade, suporte e escalabilidade para sua atual escala.

---

## Pergunta 2: O vercel.json está configurado corretamente?

### Resposta

**NÃO.** Seu vercel.json está causando o problema de "permission denied".

### O Que Está Errado

```json
{
  "buildCommand": "npm install && npm run build",  ← ❌ PROBLEMA
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [...]
}
```

**Problema:**
1. `buildCommand` força npm install novamente
2. Vercel JÁ roda npm install automaticamente
3. Resultado: npm install executa 2x
4. Conflito de cache → permissão negada

### Solução Correta

```json
{
  "framework": "vite",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/.*",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

**Por que funciona:**
1. `framework: "vite"` → Vercel sabe que é Vite
2. Vercel executa automaticamente:
   - `npm install`
   - `npm run build` (porque `build` é o script padrão do Vite)
   - Upload de `dist/`
3. `outputDirectory: "dist"` → Onde está o resultado do build
4. `routes` → Configuração de SPA (tudo que não for `/assets/*` vai para `/index.html`)

### Comparação: 3 Versões do vercel.json

```javascript
// ❌ ERRADO (sua versão atual)
{
  "buildCommand": "npm install && npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
// Problema: npm install duplicado

// ⚠️  PARCIALMENTE CERTO
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
// Problema: buildCommand redundante (Vercel já roda automaticamente)
// Funciona, mas é uma linha desnecessária

// ✓ CORRETO (minimal, recomendado)
{
  "framework": "vite",
  "outputDirectory": "dist"
}
// Solução: Deixar Vercel auto-detectar tudo
// npm install: automático
// npm run build: automático
// SPA routing: adicionar depois se necessário
```

### Você Atual vs Corrigido

**Seu fluxo atual (ERRADO):**
```
Vercel recebe git push
→ npm install (1ª vez) ← Vercel padrão
→ npm install (2ª vez) ← seu buildCommand
→ Conflito de cache/permissão
→ ERROR exit code 126
```

**Fluxo corrigido (CERTO):**
```
Vercel recebe git push
→ npm install (1ª vez) ← Vercel padrão
→ npm run build ← Automático porque framework=vite
→ Upload dist/
→ Deploy bem-sucedido em 2–3 min
```

### O que você fez vs o que Vercel faz

```javascript
// Seu vercel.json
"buildCommand": "npm install && npm run build"

// Traduzindo:
npm install  // você fazendo isso
npm run build

// Mas Vercel já faz:
npm install  // ← Vercel padrão (automático)
npm run build // ← automático porque framework=vite

// Resultado: npm install roda 2x
```

### Conclusão
**Remova `buildCommand`.** Deixe Vercel auto-detectar. Você já fez essa mudança? Verifique seu vercel.json.

---

## Pergunta 3: Por que há problemas de permissão com vite?

### Resposta

Não é problema do Vite, é problema da configuração do Vercel.

### Análise do Erro

```
"sh: line 1: /vercel/path0/node_modules/.bin/vite: Permission denied"
Exit code: 126
```

**Tradução:**
- Vercel tentou executar o arquivo `vite` em `/node_modules/.bin/vite`
- Arquivo existe, mas não tem permissão de execução (`x`)
- Código 126 = "command not found" ou "permission denied"

### Causa Raiz

#### Cenário 1: npm install duplicado (SEU CASO)

```javascript
{
  "buildCommand": "npm install && npm run build"
}

// Fluxo:
Vercel inicia
├─ npm install (1ª) → Instala node_modules/
│  ├─ .bin/vite tem permissão de execução ✓
│  └─ ...mais 500 pacotes
│
├─ npm install (2ª) → Executa NOVAMENTE
│  ├─ Conflito de cache
│  ├─ Alguns arquivos não sobrescrevem
│  ├─ .bin/vite perde permissão ✗
│  └─ npm install não consegue restaurar
│
└─ npm run build
   └─ vite: permission denied ✗✗✗
```

#### Cenário 2: Arquivo corrompido durante download

```
Se download de npm package foi interrompido:
├─ npm install não completou
├─ Alguns arquivos incompletos
└─ .bin/vite não é arquivo executável
```

#### Cenário 3: Arquivo em repositório de verdade (anti-pattern)

```
❌ NUNCA fazer:
git add node_modules/
git commit

❌ Resultado:
├─ Arquivo .bin/vite commitado como é
├─ Vercel clone do git
├─ Arquivo.bin/vite pode não ser executável
└─ Permission denied

✓ SEMPRE fazer:
git add .gitignore (com node_modules/)
npm install roda em Vercel
└─ npm restaura permissões automaticamente
```

### Por Que npm install Duplicado é Péssimo

```javascript
// ❌ Seu buildCommand
"npm install && npm run build"

// Vercel ALÉM DISSO faz:
npm ci --production

// Fluxo completo:
1. npm ci --production (Vercel padrão, com lock file)
   └─ Instala apenas produção
2. npm install (seu buildCommand)
   └─ Instala dev + produção
   └─ Tenta atualizar node_modules
3. Conflito: npm ci vs npm install
   └─ npm ci: "não mude package-lock.json"
   └─ npm install: "ok, vou atualizar"
4. Arquivo estão em estado inconsistente
5. vite: permission denied ✗
```

### Solução Definitiva

#### Passo 1: Remover buildCommand

```json
{
  "framework": "vite",
  "outputDirectory": "dist"
}
```

#### Passo 2: Garantir .gitignore

```
node_modules/
dist/
.env
```

#### Passo 3: Verificar package-lock.json

```bash
# Não commitar node_modules, mas SEMPRE commitar package-lock.json
git add package-lock.json
git commit -m "chore: ensure consistent dependencies"
```

#### Passo 4: Force rebuild no Vercel

```
Vercel Dashboard → Deployments
→ Latest deploy → Redeploy
→ Vercel vai limpar cache e rodar tudo denovo
→ npm install rodará 1x (correto)
→ npm run build rodará 1x (correto)
→ Sucesso!
```

### Comparação: Comando Errado vs Certo

```bash
# ❌ SEU COMANDO
npm install && npm run build

# Problemas:
├─ npm install roda
├─ npm run build roda
└─ MAS Vercel JÁ FAZ npm install
   → Resultado: npm install roda 2x

# ✓ COMANDO CERTO
npm run build

# Correto:
├─ Vercel já fez npm install
├─ Você só roda npm run build
└─ Pronto!

# ✓ MELHOR (deixar Vercel auto-detectar)
(nada! não colocar buildCommand)

# Correto:
├─ framework: "vite"
├─ Vercel detecta e roda npm install
├─ Vercel detecta e roda npm run build
└─ Pronto!
```

### Conclusão
Não é problema do Vite. É configuração redundante do vercel.json. **Remova buildCommand e deixe Vercel fazer seu trabalho.**

---

## Pergunta 4: Há alguma alternativa ao Vercel que possa ser mais simples?

### Resposta

Não, Vercel é a mais simples para frontend Vite/React.

### Comparação de Plataformas de Frontend

| Plataforma | Facilidade | Custo | Setup | Vite Support |
|------------|-----------|-------|-------|--------------|
| **Vercel** | ⭐⭐⭐⭐⭐ | Grátis | 5 min | ✓ Excelente |
| **Netlify** | ⭐⭐⭐⭐ | Grátis | 5 min | ✓ Bom |
| **Render** | ⭐⭐⭐ | Grátis | 10 min | ✓ Funciona |
| **AWS Amplify** | ⭐⭐ | Grátis* | 30 min | ✓ Funciona |
| **Heroku** | ⭐⭐⭐ | Pago | 10 min | ✓ Funciona |

### Análise de Cada Uma

#### Vercel (RECOMENDADO)
```
Vantages:
✓ Criadores do Next.js e Vite
✓ Auto-detecta Vite perfeitamente
✓ Deploy em 2–3 min
✓ Preview automático em cada PR
✓ Analytics incluído
✓ Domínio grátis (*.vercel.app)
✓ Free tier robusto
✓ UI/Dashboard excelente
✓ Suporte 24/7

Desvantages:
- Pago se quiser domínio próprio
- Cold start (não aplicável, static)
```

#### Netlify
```
Vantages:
✓ Similar ao Vercel
✓ Suporte a serverless functions
✓ Bom free tier

Desvantages:
- Um pouco mais lento
- UI menos intuitiva
- Deploy mais demorado (4–5 min)
```

#### Render
```
Vantages:
✓ Simples
✓ Suporta static sites
✓ Gratuito

Desvantages:
- Pode dormir após 15 min inatividade
- Build mais lento
- Não é otimizado para frontend
```

#### AWS Amplify
```
Vantages:
✓ Poderoso
✓ Integração com AWS

Desvantages:
- Complexo
- Setup 30 min
- Custo oculto
- Dashboard confuso
```

#### Heroku (DESCONTINUADO)
```
Desvantages:
❌ Removeu free tier
❌ Plano mínimo $7/mês
❌ Não é recomendado mais
```

### Qual Usar?

**Escala pequena (seu caso):**
→ Vercel Free (100% recomendado)

**Escala grande:**
→ Vercel Pro + Netlify + AWS (redundância)

**Se quer evitar Vercel:**
→ Netlify (alternativa viável, +5 min de setup)

### Netlify vs Vercel

Se escolher Netlify, setup é quase idêntico:

```bash
# Vercel
vercel --prod

# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# vercel.json
{
  "framework": "vite",
  "outputDirectory": "dist"
}

# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

### Conclusão
**Vercel é a mais simples.** Se tiver problemas com Vercel, mude para Netlify (praticamente idêntico). Outras plataformas são mais complexas.

---

## Pergunta 5: O que está faltando na configuração?

### Resposta

5 coisas principais faltando:

#### 1. .gitignore

```
❌ ATUAL: Sem .gitignore
Resultado: node_modules/ e .env no git

✓ APÓS: .gitignore adicionado
Resultado: node_modules/ e .env FORA do git
```

#### 2. vercel.json Simplificado

```json
❌ ATUAL
{
  "buildCommand": "npm install && npm run build",  ← redundante
  "outputDirectory": "dist",
  "framework": "vite",
  "routes": [...]
}

✓ APÓS
{
  "framework": "vite",
  "outputDirectory": "dist",
  "routes": [...]
}
```

#### 3. 2 Repositórios Git Separados

```
❌ ATUAL
GitHub:
└─ femo-content/ (frontend + backend)
   ├─ src/
   └─ backend/

Problema:
├─ Vercel confuso
├─ Render não deployado
└─ Deploy acoplado

✓ APÓS
GitHub:
├─ femo-frontend/ (frontend APENAS)
└─ femo-backend/ (backend APENAS)

Resultado:
├─ Vercel detecta Vite perfeitamente
├─ Render detecta Node.js perfeitamente
└─ Deploy independente
```

#### 4. Variáveis de Ambiente Seguras

```
❌ ATUAL
.env no git com chaves reais:
VITE_GEMINI_API_KEY=AQ.Ab8RN6JkRG8PiFqjB2pNQe7wVqRTmZ_qDspbuf2cfoGiPnou-Q

Problema:
├─ Chave exposta no GitHub
├─ Risco de segurança
└─ Qualquer um pode usar sua chave

✓ APÓS
.env no .gitignore
Variáveis definidas em:
├─ Vercel Dashboard → Environment Variables
├─ Render Dashboard → Environment Variables
└─ Chaves seguras, não no git
```

#### 5. Configuração CORS do Backend

```javascript
❌ ATUAL (server.js)
app.use(cors()) // Permite QUALQUER origem

Problema:
├─ Segurança ruim
├─ Qualquer um pode usar suas chaves de API
└─ Custo pode explodir

✓ APÓS
app.use(cors({
  origin: process.env.FRONTEND_URL
}))

// Em Render:
FRONTEND_URL=https://femo-frontend.vercel.app

Resultado:
├─ Apenas frontend pode chamar API
├─ Backend protegido
└─ Segurança alta
```

### Checklist de Configuração

```
[ ] .gitignore criado
    └─ node_modules, dist, .env adicionados

[ ] vercel.json removido de buildCommand
    └─ Apenas framework e outputDirectory

[ ] .env removido do git
    └─ Variáveis em Vercel Dashboard

[ ] backend/.env removido do git
    └─ Variáveis em Render Dashboard

[ ] CORS configurado com origin específico
    └─ origin: process.env.FRONTEND_URL

[ ] 2 repositórios Git criados
    └─ femo-frontend e femo-backend

[ ] Frontend deployado em Vercel
    └─ Com VITE_API_URL

[ ] Backend deployado em Render
    └─ Com FRONTEND_URL e chaves de API

[ ] Deploy automático funcionando
    └─ git push → auto-deploy
```

### Conclusão
Faltam 5 coisas. Todas fáceis de adicionar (~30 min de trabalho).

---

## Resumo Executivo

| Pergunta | Resposta Curta |
|----------|----------------|
| 1. Melhor estratégia? | 2 repos separados (Vercel + Render) |
| 2. vercel.json correto? | Não. Remova `buildCommand` |
| 3. Por que permissão negada? | npm install duplicado no buildCommand |
| 4. Alternativa ao Vercel? | Netlify (praticamente idêntico) |
| 5. O que está faltando? | .gitignore, 2 repos, CORS seguro, vars de env seguras |

**Tempo para resolver:** 2–3 horas
**Risco:** Baixo
**Payoff:** Setup robusto, production-ready
