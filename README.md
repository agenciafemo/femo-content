# FEMO CONTENT — Setup Completo

## Pré-requisitos
- Node.js 18+
- npm ou yarn

## 1. Instalar dependências

```bash
npm install
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` com suas chaves. Veja onde obter cada uma abaixo.

---

## Onde obter cada chave de API

### Claude (Anthropic)
1. Acesse **console.anthropic.com**
2. Clique em **API Keys** → **Create Key**
3. Cole em `VITE_ANTHROPIC_API_KEY`

### Gemini (Google AI)
1. Acesse **aistudio.google.com**
2. Clique em **Get API Key** → **Create API Key**
3. Cole em `VITE_GEMINI_API_KEY`

### Google Ads
1. Acesse **developers.google.com/google-ads/api/docs/get-started/oauth-cloud-project**
2. Crie projeto no Google Cloud Console
3. Ative a Google Ads API
4. Crie credenciais OAuth 2.0
5. Solicite um Developer Token em **ads.google.com** → Ferramentas → Central de API
6. ⚠️ Aprovação pode levar 1–3 dias úteis

### Google Analytics 4 (GA4)
1. Acesse **console.cloud.google.com**
2. Ative a **Google Analytics Data API**
3. Crie uma **Service Account**
4. Baixe o JSON de credenciais
5. No GA4, em Propriedade → Administrador → Acesso à propriedade, adicione o email da Service Account
6. Cole `client_email` e `private_key` do JSON no `.env`

### Meta (Instagram + Facebook Ads)
1. Acesse **developers.facebook.com**
2. Crie um App do tipo **Business**
3. Adicione o produto **Instagram Graph API** e **Marketing API**
4. Gere um **Access Token** com as permissões:
   - `instagram_basic`, `instagram_manage_insights`
   - `ads_read`, `ads_management`
5. ⚠️ Passar pela revisão de app do Meta para produção (5–10 dias)

### LinkedIn Marketing
1. Acesse **developer.linkedin.com**
2. Crie um App
3. Solicite acesso ao **Marketing Developer Platform**
4. Permissões necessárias: `r_organization_social`, `r_ads_reporting`
5. ⚠️ Aprovação como parceiro pode levar alguns dias

---

## 3. Rodar em desenvolvimento

```bash
npm run dev
```

O app abre em `http://localhost:5173`

## 4. Backend proxy (necessário para Google Ads e LinkedIn)

Para Google Ads e LinkedIn, as APIs não permitem chamadas diretas do browser por CORS.
Você precisará de um servidor proxy simples.

```bash
# Instalar Express para o proxy
npm install express cors @google/ads google-auth-library
```

Crie `server.js` na raiz e rode em paralelo com `node server.js` na porta 3001.

---

## Estrutura do projeto

```
src/
  api/
    claude.js      # Todos os 12 prompts treinados + geração de roteiros
    gemini.js      # Análise de perfil, diagnóstico, compliance CFM, trends
    google.js      # Google Ads API + GA4 API
    meta.js        # Meta Graph API (Instagram + Facebook Ads)
    linkedin.js    # LinkedIn Marketing API
  hooks/
    index.js       # useRoteiro, useBriefing, usePlanejamento, useDiagnostico, useRelatorio
  App.jsx          # Ponto de entrada com roteamento entre painéis
```

---

## Custo estimado por cliente/mês

| API | Uso estimado | Custo |
|-----|-------------|-------|
| Claude Sonnet 4.5 | ~80 roteiros × 2k tokens | ~R$12–18 |
| Gemini 1.5 Pro | Diagnóstico + análises + trends | ~R$4–8 |
| Google Ads API | Gratuito | R$0 |
| GA4 API | Gratuito | R$0 |
| Meta Graph API | Gratuito (app aprovado) | R$0 |
| LinkedIn Marketing | Gratuito (parceiro aprovado) | R$0 |
| **Total por cliente** | | **~R$16–26/mês** |
