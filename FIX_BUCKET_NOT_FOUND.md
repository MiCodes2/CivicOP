# Fix for "Bucket not found" Error

## Problem
When creating a new issue from the website, you're getting "Bucket not found" error because:
1. The backend was configured to use AWS S3
2. AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) are not set in `.env`
3. The S3 bucket doesn't exist

## Solution
The code has been updated to use **Supabase Storage** instead of AWS S3, which:
- Uses your existing Supabase project (already configured)
- Is simpler to set up
- Doesn't require AWS credentials

## Changes Made

### 1. Updated `/backend/app/services/incident_service.py`
- Removed AWS S3 dependency (boto3)
- Changed to use Supabase Storage via `supabase_client`
- Files are now uploaded to the "incidents" bucket in Supabase Storage

### 2. Updated `/backend/app/core/supabase.py`
- Changed `upload_file` from async to sync function
- Added automatic bucket creation if it doesn't exist
- Better error handling

## Next Steps to Complete Fix

### Step 1: Create Supabase Storage Bucket
You need to create the "incidents" storage bucket in your Supabase project:

1. Go to: https://app.supabase.com/project/pzopyqzogbumlvjmtecw/storage
2. Click "Create a new bucket"
3. Name it: `incidents`
4. Check "Public bucket"
5. Set file size limit: 50MB
6. Click "Create bucket"

### Step 2: Set RLS Policy (Optional but Recommended)
In Supabase Storage → Policies:
1. Allow public read access (so images can be viewed)
2. Allow authenticated users to upload

### Step 3: Restart Backend
After making the changes:
```bash
# Stop current backend
docker-compose down

# Restart with new code
docker-compose up --build
```

## Testing
1. Go to your frontend (http://localhost:3000 or similar)
2. Try creating a new incident/issue with an image
3. Image should now upload successfully to Supabase Storage

## If you still get "Bucket not found"
Check these:
1. Confirm "incidents" bucket exists in Supabase Storage
2. Verify SUPABASE_URL and SUPABASE_SERVICE_KEY are correct in `/backend/.env`
3. Check browser console for actual error details
4. Check backend logs: `docker logs guardtech-backend` (or your container name)

## Reverting to AWS S3 (Alternative)
If you prefer AWS S3 instead, set these in `/backend/.env`:
```
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET=your-bucket-name
```

Then revert the changes in `incident_service.py` and we can restore the S3 code.
