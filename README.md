# 🧠 Terapee

**Plataforma SaaS para gestão de clínicas de psicologia**

Aplicação web completa com React + Supabase para gerenciamento de clínicas de psicologia. Inclui agenda, prontuários, financeiro, gestão de equipe, mensagens WhatsApp e relatórios.

---

## ✨ Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| 🔐 **Auth** | Login, cadastro, recuperação de senha, modo demonstração |
| 📊 **Dashboard** | KPIs, gráficos de receita, consultas do dia, alertas |
| 📅 **Agenda** | Calendário semanal, agendamento, confirmação, status |
| 👥 **Pacientes** | CRUD completo, filtros, busca, detalhes |
| 📋 **Prontuários** | Registros clínicos, humor, técnicas, tarefas, assinatura |
| 💰 **Financeiro** | Cobranças, despesas, categorias, gráficos, status de pagamento |
| 👨‍⚕️ **Profissionais** | Gestão de equipe, especialidades, horários, cores na agenda |
| 💬 **Mensagens** | WhatsApp dual-channel (UAZAPI + Meta API), templates |
| 📈 **Relatórios** | Métricas, taxa de presença, receita, gráficos |
| ⚙️ **Configurações** | Dados da clínica, horários, configuração WhatsApp |

## 🏗️ Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Zustand, Recharts, Lucide Icons
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, RLS)
- **Extras:** react-hot-toast, date-fns

---

## 🚀 Setup Rápido

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/terapee.git
cd terapee
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o schema SQL:
   - Vá em **SQL Editor** no dashboard do Supabase
   - Cole e execute `supabase/migrations/001_initial_schema.sql`
   - Depois execute `supabase/migrations/002_seed_data.sql` (dados de demonstração)
3. Copie suas credenciais do Supabase (Settings → API)

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Rodar

```bash
npm run dev
```

Acesse http://localhost:3000

---

## 🎮 Modo Demonstração

O app funciona **sem Supabase configurado** usando dados de demonstração em memória. Basta iniciar sem `.env` ou clicar em "Modo demonstração" na tela de login.

---

## 📁 Estrutura do Projeto

```
terapee/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes reutilizáveis (Button, Modal, Card...)
│   │   ├── layout/          # Sidebar, Header, GlobalSearch
│   │   └── modules/         # Módulos da aplicação
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── agenda/
│   │       ├── pacientes/
│   │       ├── prontuarios/
│   │       ├── financeiro/
│   │       ├── profissionais/
│   │       ├── mensagens/
│   │       ├── relatorios/
│   │       └── configuracoes/
│   ├── contexts/
│   │   └── AuthContext.jsx   # Auth + Supabase integration
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   ├── store.js         # Zustand global state
│   │   └── hooks/           # Data hooks (CRUD genérico + por módulo)
│   ├── utils/
│   │   └── theme.js         # Design tokens
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Schema completo
│       └── 002_seed_data.sql        # Dados de exemplo
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

---

## 🗄️ Schema do Banco

14 tabelas com Row Level Security (multi-tenant):

| Tabela | Descrição |
|--------|-----------|
| `clinics` | Clínicas (tenant principal) |
| `profiles` | Perfis de usuário (extends auth.users) |
| `professionals` | Profissionais da clínica |
| `patients` | Pacientes |
| `appointments` | Agendamentos |
| `medical_records` | Prontuários/registros clínicos |
| `charges` | Cobranças financeiras |
| `expense_categories` | Categorias de despesas |
| `expenses` | Despesas |
| `conversations` | Conversas WhatsApp |
| `messages` | Mensagens |
| `message_templates` | Templates de mensagem |
| `notifications` | Notificações |
| `audit_log` | Log de auditoria |

### Triggers automáticos:
- `updated_at` auto-update em todas as tabelas
- Criação de perfil no signup
- Atualização de conversa em nova mensagem
- Criação de cobrança ao concluir consulta

---

## 🚢 Deploy

### Vercel
```bash
npm run build
# Upload da pasta dist/ para Vercel
# Configurar variáveis de ambiente no painel
```

### Docker
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Netlify / Railway / Render
Basta configurar:
- Build command: `npm run build`
- Output directory: `dist`
- Variáveis de ambiente do Supabase

---

## 📄 Licença

MIT — use livremente para projetos pessoais e comerciais.
