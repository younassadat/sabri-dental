import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException, Depends

from app.config import SUPABASE_URL
from app.supabase_client import supabase

# Supabase (projects created from Oct 2025 onward) signs user session tokens
# with an asymmetric key by default, and publishes the public half here.
# Verifying against this endpoint works whether the project uses the new
# asymmetric keys or the older shared-secret ones, since Supabase includes
# both in the JWKS response.
_JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_jwk_client = PyJWKClient(_JWKS_URL, cache_keys=True, lifespan=600)


def _decode_token(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256", "HS256"],
            audience="authenticated",
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


def get_current_staff(authorization: str | None = Header(default=None)) -> dict:
    """Verifies the Supabase access token and returns the matching staff row."""
    payload = _decode_token(authorization)
    auth_user_id = payload.get("sub")
    if not auth_user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    result = (
        supabase.table("staff")
        .select("id, name, role, auth_user_id")
        .eq("auth_user_id", auth_user_id)
        .single()
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=403, detail="No staff record for this account")
    return result.data


def require_role(*allowed_roles: str):
    """Dependency factory: restrict an endpoint to specific staff roles."""

    def _checker(staff: dict = Depends(get_current_staff)) -> dict:
        if staff["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Not allowed for your role")
        return staff

    return _checker
