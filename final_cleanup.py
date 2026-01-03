import os
import pathlib

# Change to workspace
os.chdir('/workspaces/GuardTech')

# List of files to remove
to_remove = [
    'DEV_SETUP.md', 'FEATURES_IMPLEMENTED.md', 'INDEX.md', 'MIGRATION.md',
    'MIGRATION_GUIDE.md', 'MIGRATION_OVERVIEW.md', 'MIGRATION_QUICKSTART.md',
    'MIGRATION_SUMMARY.md', 'NEXT_STEPS.md', 'QUICK_REFERENCE.md',
    'README.md', 'README_new.md', 'README_NEW.md', 'README_FINAL.md',
    'SETUP_CHECKLIST.md', 'SETUP_COMPLETE.md', 'SETUP_STATUS.md'
]

# Get content from README_NEW.md
with open('README_NEW.md', 'r') as f:
    content = f.read()

# Remove files
for fname in to_remove:
    p = pathlib.Path(fname)
    if p.exists():
        p.unlink()
        print(f"Deleted {fname}")

# Create new README.md
with open('README.md', 'w') as f:
    f.write(content)
print("Created README.md")

# Show what's left
remaining = list(pathlib.Path('.').glob('*.md'))
print(f"Remaining markdown files: {[f.name for f in remaining]}")
