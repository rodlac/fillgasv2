#!/bin/bash

echo "🚀 Configurando o sistema FillGás..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Gerar cliente Prisma
echo "🔧 Gerando cliente Prisma..."
npx prisma generate

# Aplicar schema ao banco de dados
echo "🗄️ Criando tabelas no banco de dados..."
npx prisma db push

echo "✅ Tabelas criadas com sucesso!"
echo ""
echo "🎯 Próximo passo: Execute o script init-data.sql para inserir os dados iniciais"
echo "   Você pode fazer isso através da interface do Supabase ou executando:"
echo "   npx prisma db execute --file ./scripts/init-data.sql --schema ./prisma/schema.prisma"
