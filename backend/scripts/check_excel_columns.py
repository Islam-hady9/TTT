# -*- coding: utf-8 -*-
"""
Check Excel Column Names
"""
import pandas as pd
from pathlib import Path

DATA_FOLDER = Path(__file__).parent.parent / "DATA"

# Find the Excel file
excel_files = list(DATA_FOLDER.glob("*.xlsx"))
production_files = [f for f in excel_files if "تقرير" in f.name]

if not production_files:
    print("❌ No production report found!")
    exit()

excel_file = production_files[0]
print(f"📊 Reading: {excel_file.name}\n")

# Read all sheets
xl = pd.ExcelFile(excel_file)

for sheet_name in xl.sheet_names:
    print(f"{'='*70}")
    print(f"📋 Sheet: {sheet_name}")
    print(f"{'='*70}")
    
    df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
    
    # Find header row
    header_row = None
    for idx, row in df.iterrows():
        if "الحوض" in str(row.values):
            header_row = idx
            break
    
    if header_row is None:
        print("⚠️ Could not find header row\n")
        continue
    
    # Set headers
    df.columns = df.iloc[header_row]
    df = df.iloc[header_row + 1:].reset_index(drop=True)
    
    print(f"\n📝 Columns ({len(df.columns)}):")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. '{col}'")
    
    print(f"\n📊 Sample Data (first row):")
    if len(df) > 0:
        first_row = df.iloc[0]
        for col in df.columns:
            value = first_row[col]
            if pd.notna(value) and value != '':
                print(f"  {col}: {value}")
    
    print("\n")
