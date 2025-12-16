# Verifikimi i Environment Variables

## Kontrollo që `.env` file ka këto vlera:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Hapat për të rregulluar:

1. **Verifiko lokacionin e `.env` file:**
   - Duhet të jetë në root të projektit
   - Të njëjtin nivel me `package.json`

2. **Verifiko formatin:**
   - Nuk duhet të ketë hapësira rreth `=`
   - Nuk duhet të ketë thonjëza shtesë
   - Duhet të fillojë me `VITE_`

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Nëse problemi vazhdon:**
   - Verifiko që `.env` nuk është në `.gitignore` (duhet të jetë)
   - Provo të rikrijosh `.env` file
   - Kontrollo që URL dhe KEY janë të sakta nga Supabase Dashboard

