#!/usr/bin/env python3
"""
Setup script to create required Supabase storage buckets
Run this after deploying your backend to initialize storage
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("backend/.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
    exit(1)

try:
    from supabase import create_client
    
    # Create Supabase client with service key (has elevated permissions)
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    # Create "incidents" bucket for storing incident images
    buckets_to_create = [
        {
            "name": "incidents",
            "public": True,
            "file_size_limit": 52428800  # 50MB
        }
    ]
    
    for bucket_config in buckets_to_create:
        bucket_name = bucket_config["name"]
        try:
            response = client.storage.create_bucket(
                bucket_name,
                options={
                    "public": bucket_config["public"],
                    "file_size_limit": bucket_config["file_size_limit"]
                }
            )
            print(f"✅ Created bucket: {bucket_name}")
        except Exception as e:
            error_msg = str(e)
            if "already exists" in error_msg:
                print(f"✅ Bucket already exists: {bucket_name}")
            else:
                print(f"⚠️  Error creating bucket {bucket_name}: {e}")
    
    print("\n✅ Supabase storage setup complete!")
    
except ImportError:
    print("❌ supabase-py not installed. Install with: pip install supabase")
    exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)
