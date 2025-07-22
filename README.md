# FillGás - Sistema de Agendamento de Cilindros

Sistema completo para gestão de agendamentos e entregas de cilindros de CO2.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem de programação
- **Prisma** - ORM para banco de dados
- **Supabase** - Backend as a Service (Auth + PostgreSQL)
- **Tailwind CSS** - Framework de CSS
- **Shadcn/ui** - Biblioteca de componentes

## 📋 Pré-requisitos

- Node.js 18+ 
- Conta no Supabase
- PostgreSQL (via Supabase)

## ⚙️ Configuração

### 1. Clone o repositório e instale dependências

\`\`\`bash
npm install
\`\`\`

### 2. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

\`\`\`env
# Database
DATABASE_URL="sua-url-do-supabase-postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-do-supabase"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico-do-supabase"

# Next.js
NEXTAUTH_SECRET="uma-string-longa-e-aleatoria-para-seguranca"
NEXTAUTH_URL="http://localhost:3000" # Para desenvolvimento local
\`\`\`

### 3. Configure o banco de dados

\`\`\`bash
# Gerar cliente Prisma
npx prisma generate

# Criar tabelas no banco (isso vai criar as tabelas com o prefixo v2_)
npx prisma db push
\`\`\`

### 4. Inserir dados iniciais

**Importante:** Você deve executar este script SQL diretamente no SQL Editor do seu painel do Supabase.

1.  Acesse seu painel do Supabase.
2.  Vá para a seção "SQL Editor".
3.  Crie um novo "Query" ou abra um existente.
4.  Copie e cole todo o conteúdo do arquivo `scripts/init-data.sql` (disponível neste projeto) no editor.
5.  Clique em "Run" para executar o script.

### 5. Configurar usuário Admin no Supabase Auth

1.  No seu painel do Supabase, vá para a seção "Authentication" > "Users".
2.  Clique em "Invite" ou "Add user".
3.  Crie um novo usuário com o email `admin@fillgas.com` e defina uma senha. Este usuário terá permissões de administrador no sistema.

### 6. Executar o projeto

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## 👤 Login Inicial

- **Email**: admin@fillgas.com
- **Senha**: A senha que você definiu no passo 5.

## 📁 Estrutura do Projeto

\`\`\`
├── app/                    # Páginas Next.js 15 (App Router)
│   ├── (dashboard)/       # Páginas protegidas
│   ├── api/               # Route Handlers (API)
│   └── login/             # Página de login
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
├── prisma/               # Schema do banco de dados
└── scripts/              # Scripts de dados iniciais
\`\`\`

## 🔐 Sistema de Permissões

O sistema utiliza RBAC (Role-Based Access Control):

- **admin**: Acesso total (`["*"]`)
- **user**: Acesso limitado a leitura

## 📊 Funcionalidades

### ✅ Implementadas
- [x] Autenticação (Supabase Auth)
- [x] Gestão de Clientes
- [x] Gestão de Serviços  
- [x] Dashboard com métricas
- [x] Sistema de Cupons
- [x] API completa com RBAC

### 🚧 Em Desenvolvimento
- [ ] Gestão de Agendamentos (UI)
- [ ] Gestão de Pagamentos (UI)
- [ ] Integração Gateway Asaas
- [ ] Upload de Comprovantes
- [ ] Relatórios e Analytics

## 🛠️ Comandos Úteis

\`\`\`bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Prisma
npm run db:generate    # Gerar cliente
npm run db:push       # Aplicar schema
npm run db:studio     # Interface visual

# Linting
npm run lint
\`\`\`

## 📝 API Endpoints

### Clientes
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/[id]` - Atualizar cliente
- `DELETE /api/clients/[id]` - Desativar cliente

### Serviços
- `GET /api/services` - Listar serviços
- `POST /api/services` - Criar serviço
- `PUT /api/services/[id]` - Atualizar serviço

### Agendamentos
- `GET /api/bookings` - Listar agendamentos
- `POST /api/bookings` - Criar agendamento
- `PATCH /api/bookings/[id]/status` - Atualizar status

### Cupons
- `GET /api/coupons` - Listar cupons
- `POST /api/coupons` - Criar cupom
- `POST /api/coupons/validate` - Validar cupom

## 🔒 Segurança

- Autenticação via Supabase Auth
- Middleware de proteção de rotas
- Validação de permissões por endpoint
- Sanitização de dados de entrada

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
