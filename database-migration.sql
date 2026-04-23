-- Migration to add OAuth support to the database
-- Run this SQL in your Supabase SQL Editor

-- Update users table to support OAuth
ALTER TABLE users 
  ALTER COLUMN password DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'credentials';

-- Create accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  CONSTRAINT accounts_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT accounts_provider_providerAccountId_key UNIQUE (provider, "providerAccountId")
);

-- Create sessions table for NextAuth
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  CONSTRAINT sessions_userId_fkey FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Create verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  CONSTRAINT verification_tokens_identifier_token_key UNIQUE (identifier, token)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS accounts_userId_idx ON accounts("userId");
CREATE INDEX IF NOT EXISTS sessions_userId_idx ON sessions("userId");
CREATE INDEX IF NOT EXISTS sessions_sessionToken_idx ON sessions("sessionToken");
