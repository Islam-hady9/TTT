import json

# Read the file
with open('src/i18n/locales/ar.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Try to parse it (will fail due to duplicates, but let's see the structure)
print("Checking for duplicate keys...")
lines = content.split('\n')
keys_seen = {}
duplicates = []

for i, line in enumerate(lines):
    if '":' in line:
        key = line.split('":')[0].strip().strip('"')
        if key and not key.startswith('//'):
            if key in keys_seen:
                duplicates.append((key, keys_seen[key], i+1))
            keys_seen[key] = i+1

print(f"\nFound {len(duplicates)} duplicate keys:")
for key, first_line, second_line in duplicates:
    print(f"  '{key}' at lines {first_line} and {second_line}")
