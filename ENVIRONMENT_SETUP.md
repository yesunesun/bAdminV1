# Environment Configuration Guide

## Clean .env Structure

We now have a simplified environment setup with only 2 files:

### Files Created:
- `.env.development` - For local development (btService on localhost:3001)
- `.env.production` - For production/Lambda (btService on AWS Lambda)

### Removed Files:
- `.env` (old main file)
- `.env.comparison` 
- `.env.example` 
- `.env.test`

## Usage

### Development with Local btService:
```bash
npm run dev:local
# or 
npm run dev --mode development
```
This uses `.env.development` with `VITE_BTSERVICE_URL=http://localhost:3001`

### Development with Lambda btService:
```bash
npm run dev:lambda
# or
npm run dev --mode production  
```
This uses `.env.production` with `VITE_BTSERVICE_URL=https://8myn8r7l07.execute-api.us-east-1.amazonaws.com/Prod`

### Default Behavior:
```bash
npm run dev
```
Uses `.env.development` by default (local btService)

## Environment Variables

Both files contain the same variables except for `VITE_BTSERVICE_URL`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_MAPS_KEY`
- `VITE_GOOGLE_MAPS_KEY`
- `VITE_BTSERVICE_URL` (different in each file)

## Security

All environment files are now properly ignored in `.gitignore`:
- `.env`
- `.env.development`
- `.env.production`
- `.env.local`
- `.env.*.local`

## Quick Switch Commands

To switch between environments during development:

```bash
# Start with local btService
npm run dev:local

# Stop and restart with Lambda btService  
npm run dev:lambda
```

No need to manually edit files anymore!