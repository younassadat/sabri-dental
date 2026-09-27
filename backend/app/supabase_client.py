from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_SERVICE_KEY

# Service-role client: bypasses row level security.
# Safe to use here because every route already checks the caller's
# JWT and role before touching the database (see app/auth.py).
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
