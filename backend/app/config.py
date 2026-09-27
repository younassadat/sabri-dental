import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
# This is the "Secret key" (starts with sb_secret_...) from
# Project Settings -> API Keys -> Secret keys. NOT the publishable key.
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
