# Deploy ke Cloudflare Pages

1. Dashboard Cloudflare → Workers & Pages → Create → Pages → Connect to Git → pilih repo `infomas86/trident`.
2. Production branch: cabang yang ingin dipublikasikan.
3. Build settings:
   - Framework preset: Vite (atau None)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Environment variable `NODE_VERSION` = `22`
4. Environment variables (Production dan Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   Hanya dua ini. Jangan pernah mengisi service role key atau password database di Pages.
5. Save and Deploy. Situs tersedia di `https://<nama-proyek>.pages.dev`.
6. Supabase → Authentication → URL Configuration: tambahkan URL situs ke Site URL / Redirect URLs.
