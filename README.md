# PDF Sim Editor 📄✨

Editor de PDF profissional com inteligência artificial, suporte a assinaturas, desenhos e integração de pagamentos com Stripe.

## 🚀 Funcionalidades

- **Edição de Texto:** Altere qualquer texto no PDF.
- **Desenho e Formas:** Adicione linhas, formas e desenhos à mão livre.
- **Assinaturas:** Processe e adicione assinaturas digitais.
- **Inteligência Artificial:** Gere conteúdo e otimize seu documento usando AI.
- **Exportação Premium:** Exportação de alta fidelidade com integração Stripe Checkout.
- **Conversão Word:** Converta PDF para Word e Word para PDF.

## 🛠️ Tecnologias

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, pdf-lib.
- **Backend:** Python, Flask, PyMuPDF, Stripe.

## 📦 Como rodar

### Frontend
1. Instale as dependências: `npm install`
2. Rode em desenvolvimento: `npm run dev`

### Backend
1. Instale as dependências: `pip install -r scripts/requirements.txt`
2. Rode o servidor: `python backend/app.py`

## 🔐 Configuração

Renomeie o arquivo `.env` e adicione suas chaves:
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `GEMINI_API_KEY`

---
Desenvolvido com PDF Sim Editor.
