# Compatibility shim — imports from the canonical config location
from app.config import settings, Settings, get_settings

__all__ = ["settings", "Settings", "get_settings"]
