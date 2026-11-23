-- Keamanan (OWASP A02/A05 - permukaan serang tak perlu): aplikasi ini tidak memakai GraphQL
-- (hanya REST lewat supabase-js). Cabut akses endpoint /graphql/v1 untuk anon & authenticated
-- dan hentikan ekstensinya, tanpa mengubah fungsi REST/RLS yang sudah ada.
revoke usage on schema graphql_public from anon, authenticated;
revoke all on all functions in schema graphql_public from anon, authenticated;
drop extension if exists pg_graphql cascade;
