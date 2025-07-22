-- This script is for initializing a PostgreSQL database for the FillGás project.
-- It includes creating the database and setting up the necessary extensions.
-- This script should be run with a superuser role (e.g., 'postgres').

-- Drop database if it exists (for development/reset purposes)
-- WARNING: This will delete all data in the 'fillgas_db' database.
-- Uncomment the line below if you want to drop the database before creating it.
-- DROP DATABASE IF EXISTS fillgas_db;

-- Create the database
CREATE DATABASE fillgas_db;

-- Connect to the newly created database
\c fillgas_db;

-- Enable the "uuid-ossp" extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- You can now run your 'create-tables.sql' and 'init-data.sql' scripts.
-- Example:
-- \i /path/to/your/create-tables.sql
-- \i /path/to/your/init-data.sql
