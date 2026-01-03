#!/usr/bin/env python3
import os

os.chdir('/workspaces/GuardTech')

# Files to delete
files_to_delete = [
    'DEV_SETUP.md',
    'FEATURES_IMPLEMENTED.md',
    'INDEX.md',
    'MIGRATION.md',
    'MIGRATION_GUIDE.md',
    'MIGRATION_OVERVIEW.md',
    'MIGRATION_QUICKSTART.md',
    'MIGRATION_SUMMARY.md',
    'NEXT_STEPS.md',
    'QUICK_REFERENCE.md',
    'README.md',
    'README_new.md',
    'README_NEW.md',
    'README_FINAL.md',
    'SETUP_CHECKLIST.md',
    'SETUP_COMPLETE.md',
    'SETUP_STATUS.md',
]

# Read README_NEW.md
try:
    with open('README_NEW.md', 'r') as f:
        readme_content = f.read()
except:
    print("Could not read README_NEW.md")
    exit(1)

# Delete files
deleted = []
for file in files_to_delete:
    try:
        if os.path.exists(file):
            os.remove(file)
            deleted.append(file)
    except Exception as e:
        print(f"Error deleting {file}: {e}")

# Create final README.md
try:
    with open('README.md', 'w') as f:
        f.write(readme_content)
    deleted.append('README.md (CREATED)')
except Exception as e:
    print(f"Error creating README.md: {e}")

print("Files deleted/created:")
for f in deleted:
    print(f"  - {f}")

import glob
remaining = glob.glob('*.md')
print(f"\nRemaining .md files: {remaining}")
