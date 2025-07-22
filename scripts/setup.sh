#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Starting FillGás project setup..."

# 1. Install pnpm if not already installed
if ! command -v pnpm &> /dev/null
then
    echo "pnpm not found, installing..."
    npm install -g pnpm
fi

# 2. Install project dependencies
echo "Installing project dependencies with pnpm..."
pnpm install

# 3. Check for Supabase CLI and start local Supabase services if not running
if ! command -v supabase &> /dev/null
then
    echo "Supabase CLI not found. Please install it: https://supabase.com/docs/guides/cli/getting-started"
    echo "Skipping local Supabase start. Ensure your DATABASE_URL points to a running Supabase instance."
else
    echo "Checking Supabase local services..."
    # Check if Supabase services are already running
    if ! supabase status &> /dev/null; then
        echo "Supabase local services not running, starting them..."
        supabase start
        echo "Supabase local services started. Please update your .env.local with the provided connection strings if you are using local Supabase."
    else
        echo "Supabase local services are already running."
    fi
fi

# 4. Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate dev --name initial_setup

# 5. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 6. (Optional) Seed initial data
echo "Do you want to seed initial data? (y/N)"
read -r seed_data
if [[ "$seed_data" =~ ^[Yy]$ ]]; then
    echo "Seeding initial data..."
    # Assuming init-data.sql is designed to be idempotent or safe to run multiple times
    # You might need to adjust this command based on your database setup (e.g., using DATABASE_URL)
    # For local Supabase, you can often use the direct psql command.
    # For remote, you might need a more robust script or Prisma seeding.
    # For simplicity, this assumes local psql access or a script that handles remote.
    # If using DATABASE_URL, you might need:
    # PGPASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:$$.*$$@.*/\1/p') psql -h $(echo $DATABASE_URL | sed -n 's/.*@$$.*$$:.*/\1/p') -p $(echo $DATABASE_URL | sed -n 's/.*:$$[0-9]*$$\/.*/\1/p') -U $(echo $DATABASE_URL | sed -n 's/postgresql:\/\/$$.*$$:.*/\1/p') -d $(echo $DATABASE_URL | sed -n 's/.*\/$$.*$$?schema=.*/\1/p') -f scripts/init-data.sql
    # For now, let's assume a simple local psql or a script that handles it.
    pnpm run init-data || echo "Failed to run init-data script. Please check your database connection and script."
else
    echo "Skipping initial data seeding."
fi

echo "FillGás project setup complete! You can now run 'pnpm run dev' to start the development server."
