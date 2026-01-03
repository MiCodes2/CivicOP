#!/usr/bin/env python3
import os
import shutil

os.chdir('/workspaces/GuardTech')

# Files to delete - all .md files except we'll recreate README.md
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

# Read the clean README content from README_NEW.md first
with open('README_NEW.md', 'r') as f:
    readme_content = f.read()

# Delete all the files
for file in files_to_delete:
    if os.path.exists(file):
        os.remove(file)
        print(f"Deleted: {file}")

# Create clean README.md with the content
with open('README.md', 'w') as f:
    f.write(readme_content)
print("Created clean README.md")

# List remaining .md files
import glob
remaining = glob.glob('*.md')
print(f"\nRemaining .md files: {remaining}")
print("\nCleanup complete!")
