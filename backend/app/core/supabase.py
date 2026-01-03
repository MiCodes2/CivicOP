"""
Supabase client configuration for backend services
"""
from typing import Optional
from .config import settings

# Note: For Python backend, we primarily use the DATABASE_URL for direct database access
# The Supabase client is optional and mainly used for storage/auth features

class SupabaseClient:
    """
    Wrapper for Supabase client functionality.
    Primarily uses direct database connection via SQLAlchemy.
    """
    
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.key = settings.SUPABASE_KEY
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self._client = None
    
    @property
    def client(self):
        """
        Lazy initialization of Supabase client (if needed for storage/auth)
        Install: pip install supabase
        """
        if self._client is None and self.url and self.key:
            try:
                from supabase import create_client
                self._client = create_client(self.url, self.key)
            except ImportError:
                print("Warning: supabase-py not installed. Install with: pip install supabase")
        return self._client
    
    def get_storage_url(self, bucket: str, path: str) -> Optional[str]:
        """Get public URL for a file in Supabase Storage"""
        if self.url:
            return f"{self.url}/storage/v1/object/public/{bucket}/{path}"
        return None
    
    async def upload_file(self, bucket: str, path: str, file_data: bytes) -> Optional[str]:
        """Upload a file to Supabase Storage"""
        if not self.client:
            return None
        
        try:
            result = self.client.storage.from_(bucket).upload(path, file_data)
            return self.get_storage_url(bucket, path)
        except Exception as e:
            print(f"Error uploading file to Supabase: {e}")
            return None

# Global instance
supabase_client = SupabaseClient()
