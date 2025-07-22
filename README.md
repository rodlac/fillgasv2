# FillGás - Sistema de Agendamento e Gestão de Entregas de Cilindros

Este é o repositório do projeto FillGás, um sistema completo para agendamento e gestão de entregas de cilindros de gás.

## Tecnologias Utilizadas

*   **Next.js 15 (App Router):** Framework React para aplicações web de alto desempenho.
*   **Shadcn/ui:** Componentes de UI reutilizáveis e acessíveis, construídos com Tailwind CSS e Radix UI.
*   **Prisma:** ORM moderno para Node.js e TypeScript, facilitando a interação com o banco de dados.
*   **Tailwind CSS:** Framework CSS utilitário para estilização rápida e responsiva.
*   **TypeScript:** Linguagem de programação que adiciona tipagem estática ao JavaScript.
*   **Supabase:** Plataforma de código aberto que oferece funcionalidades de banco de dados (PostgreSQL), autenticação, armazenamento e APIs em tempo real.

## Funcionalidades Principais

*   **Autenticação de Usuários:** Login e gerenciamento de sessões via Supabase Auth.
*   **Gestão de Clientes:** Cadastro, edição e visualização de informações de clientes.
*   **Gestão de Serviços:** Definição e gerenciamento de tipos de serviços/produtos (cilindros).
*   **Agendamento de Entregas:** Criação e acompanhamento de agendamentos de entrega.
*   **Gestão de Cupons:** Criação e validação de cupons de desconto.
*   **Gestão de Pagamentos:** Registro e verificação de pagamentos.
*   **Dashboard:** Visão geral e métricas do sistema.

## Configuração do Ambiente de Desenvolvimento

Para configurar o projeto localmente, siga os passos abaixo:

### 1. Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   Node.js (versão 18 ou superior)
*   pnpm (gerenciador de pacotes, instale com `npm install -g pnpm`)
*   Git
*   Docker (opcional, para rodar o Supabase localmente)

### 2. Clonar o Repositório

\`\`\`bash
git clone https://github.com/rodlac/fillgasv2.git
cd fillgasv2
\`\`\`

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="SUA_URL_SUPABASE"
NEXT_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_SUPABASE"
SUPABASE_SERVICE_ROLE_KEY="SUA_CHAVE_SERVICE_ROLE_SUPABASE"
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"

# NextAuth (para autenticação, se estiver usando)
NEXTAUTH_SECRET="UMA_STRING_LONGA_E_ALEATORIA"
NEXTAUTH_URL="http://localhost:3000"

# Asaas (opcional, para gateway de pagamento)
ASAAS_API_KEY="SUA_CHAVE_API_ASAAS"
ASAAS_ENVIRONMENT="sandbox" # ou "production"
\`\`\`

*   **Supabase:** Você pode encontrar suas chaves e URL no painel do Supabase, em "Project Settings" -> "API". A `DATABASE_URL` é a URL de conexão direta com o PostgreSQL.
*   **NEXTAUTH_SECRET:** Gere uma string aleatória complexa (ex: `openssl rand -base64 32`).
*   **ASAAS:** Se for integrar com Asaas, obtenha suas chaves no painel do Asaas.

### 4. Instalar Dependências

\`\`\`bash
pnpm install
\`\`\`

### 5. Configurar o Banco de Dados (Prisma e Supabase)

#### Opção A: Usando Supabase Remoto (Recomendado para desenvolvimento rápido)

1.  Certifique-se de que suas variáveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `DATABASE_URL` no `.env.local` apontam para seu projeto Supabase remoto.
2.  Execute as migrações do Prisma para criar as tabelas no seu banco de dados Supabase:
    \`\`\`bash
    npx prisma migrate dev --name initial_setup
    \`\`\`
    *   Este comando criará os arquivos de migração e os aplicará ao seu banco de dados.
    *   Se você já tem tabelas e quer sincronizar o Prisma com elas, pode precisar de `npx prisma db pull` antes de `migrate dev`.

3.  (Opcional) Se você tiver dados iniciais para popular o banco de dados, execute o script:
    \`\`\`bash
    pnpm run init-data
    \`\`\`
    *   Este comando executa o script `scripts/init-data.sql` no seu banco de dados.

#### Opção B: Usando Supabase Local com Docker (Para um ambiente mais isolado)

1.  Certifique-se de ter o Docker Desktop rodando.
2.  Inicie o Supabase localmente:
    \`\`\`bash
    supabase start
    \`\`\`
    *   Isso iniciará os serviços do Supabase (PostgreSQL, Auth, etc.) em contêineres Docker.
    *   As URLs e chaves para o ambiente local serão exibidas no terminal. Atualize seu `.env.local` com elas.
3.  Execute as migrações do Prisma:
    \`\`\`bash
    npx prisma migrate dev --name initial_setup
    \`\`\`
4.  (Opcional) Popule com dados iniciais:
    \`\`\`bash
    pnpm run init-data
    \`\`\`

### 6. Gerar o Prisma Client

Este passo é geralmente executado automaticamente após `pnpm install` ou `prisma migrate dev`, mas se precisar rodar manualmente:

\`\`\`bash
npx prisma generate
\`\`\`

### 7. Rodar a Aplicação

\`\`\`bash
pnpm run dev
\`\`\`

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

*   `app/`: Contém as rotas e páginas do Next.js (App Router).
    *   `app/(dashboard)/`: Rotas protegidas que usam o layout do dashboard.
    *   `app/api/`: Rotas de API.
    *   `app/login/`: Página de login.
*   `components/`: Componentes React reutilizáveis, incluindo os componentes Shadcn/ui.
*   `lib/`: Funções utilitárias e configurações (Supabase, Prisma, Auth).
*   `prisma/`: Schema do Prisma e migrações.
*   `public/`: Arquivos estáticos.
*   `scripts/`: Scripts para inicialização do banco de dados e outras tarefas.
*   `styles/`: Arquivos CSS globais e de Tailwind.

## Deploy na Vercel

1.  **Conecte seu Repositório Git:** Conecte seu repositório GitHub/GitLab/Bitbucket à Vercel.
2.  **Variáveis de Ambiente:** Configure todas as variáveis de ambiente necessárias no painel da Vercel (as mesmas do `.env.local`).
3.  **Build Command:** A Vercel detectará automaticamente o Next.js. Certifique-se de que o script `prebuild` no `package.json` (`npx prisma migrate deploy`) está configurado para aplicar as migrações.
4.  **Deploy:** A Vercel fará o build e deploy da sua aplicação.

---

## Contribuição

Sinta-se à vontade para contribuir com o projeto. Abra issues para bugs ou sugestões e envie pull requests com melhorias.
\`\`\`
