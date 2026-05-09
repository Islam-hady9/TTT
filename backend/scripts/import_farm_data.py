# -*- coding: utf-8 -*-
"""
Import Farm Data from Excel Files - مزرعة الإنتاج الوطني
"""
import pandas as pd
import sys
from pathlib import Path
from datetime import datetime
import re

# Add app to path
sys.path.append(str(Path(__file__).parent))

from app.db.database import SessionLocal
from app.models.pond import Pond, Batch
from app.models.water_quality import WaterQuality
from app.models.feeding import Feeding
from app.models.mortality import Mortality

# Data folder path
DATA_FOLDER = Path(__file__).parent.parent / "DATA"

def clean_numeric(value):
    """Clean and convert numeric values"""
    if pd.isna(value) or value == '' or value == 'NaN':
        return None
    try:
        return float(value)
    except:
        return None

def parse_date(date_str):
    """Parse various date formats"""
    if pd.isna(date_str):
        return None
    
    if isinstance(date_str, datetime):
        return date_str
    
    # Try different date formats
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y",
        "%Y-%m-%d",
        "%m/%d/%Y"
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(str(date_str), fmt)
        except:
            continue
    
    return None

def import_production_report():
    """Import data from production report Excel file"""
    
    excel_files = list(DATA_FOLDER.glob("*.xlsx"))
    production_files = [f for f in excel_files if "تقرير" in f.name]
    
    if not production_files:
        print("❌ No production report found!")
        return
    
    excel_file = production_files[0]
    print(f"📊 Reading: {excel_file.name}")
    
    try:
        db = SessionLocal()
        
        # Read all sheets
        xl = pd.ExcelFile(excel_file)
        print(f"📄 Sheets: {xl.sheet_names}")
        
        # Process each sheet (Nursery, Pregrow, Grow out)
        for sheet_name in xl.sheet_names:
            print(f"\n📋 Processing: {sheet_name}")
            df = pd.read_excel(excel_file, sheet_name=sheet_name, header=None)
            
            # Determine unit type from sheet name
            if "التحضين" in sheet_name:
                unit_type = "nursery"
                stage = "nursery"  # التحضين (إصبعيات)
            elif "التربية" in sheet_name:
                unit_type = "pregrow"
                stage = "juveniles"  # التربية
            elif "التسمين" in sheet_name:
                unit_type = "growout"
                stage = "fattening"  # التسمين
            else:
                continue
            
            # Find header row (contains "الحوض")
            header_row = None
            for idx, row in df.iterrows():
                if "الحوض" in str(row.values):
                    header_row = idx
                    break
            
            if header_row is None:
                print(f"   ⚠️ Could not find header row")
                continue
            
            # Set proper headers
            df.columns = df.iloc[header_row]
            df = df.iloc[header_row + 1:].reset_index(drop=True)
            
            print(f"   Columns: {list(df.columns)}")
            print(f"   Data rows: {len(df)}")
            
            # Process each pond/tank
            for idx, row in df.iterrows():
                pond_code = str(row.get("الحوض", "")).strip()
                
                if not pond_code or pond_code == "nan" or pond_code == "":
                    continue
                
                print(f"   Processing: {pond_code}")
                
                # Check if pond exists
                pond = db.query(Pond).filter(Pond.pond_code == pond_code).first()
                if not pond:
                    # Create new pond
                    capacity = clean_numeric(row.get("الحجم", 0)) or 100.0
                    pond = Pond(
                        pond_code=pond_code,
                        unit_type=unit_type,
                        capacity=capacity,
                        status="active"
                    )
                    db.add(pond)
                    db.flush()
                    print(f"      ✅ Created pond: {pond_code}")
                
                # Extract batch data
                current_count = clean_numeric(row.get("عدد الأسماك فى الحوض", 0))
                avg_weight = clean_numeric(row.get("متوسط وزن السمكة الحالى", 0))
                fcr = clean_numeric(row.get("معدل التحويل الغذائى FCR ", 0))
                
                if current_count and current_count > 0:
                    # Check if batch already exists for this pond
                    existing_batch = db.query(Batch).filter(
                        Batch.pond_id == pond.id,
                        Batch.status == "active"
                    ).first()
                    
                    if not existing_batch:
                        # Create batch
                        batch_code = f"BATCH-{pond_code}-2026"
                        stocking_date = datetime(2026, 3, 30)  # From notes: بداية التسكين يوم 30/3/2026
                        
                        biomass = (current_count * (avg_weight or 1.0)) if current_count else 0
                        
                        batch = Batch(
                            batch_code=batch_code,
                            pond_id=pond.id,
                            stocking_date=stocking_date,
                            initial_count=int(current_count),
                            current_count=int(current_count),
                            avg_weight=avg_weight or 1.0,
                            stage=stage,
                            source="external",
                            status="active",
                            created_by="system",
                            biomass=biomass,
                            fcr=fcr if fcr and fcr > 0 else None
                        )
                        db.add(batch)
                        print(f"      ✅ Created batch: {batch_code} ({current_count} fish, {avg_weight}g, FCR={fcr})")
                    else:
                        # Update existing batch
                        existing_batch.current_count = int(current_count)
                        existing_batch.avg_weight = avg_weight or 1.0
                        existing_batch.biomass = (current_count * (avg_weight or 1.0))
                        existing_batch.fcr = fcr if fcr and fcr > 0 else None
                        print(f"      ✅ Updated batch: {existing_batch.batch_code}")
        
        db.commit()
        print("\n✅ Production data imported!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def import_water_quality():
    """Import water quality data"""
    
    excel_files = list(DATA_FOLDER.glob("*.xlsx"))
    wq_files = [f for f in excel_files if "المتابعة" in f.name]
    
    if not wq_files:
        print("❌ No water quality file found!")
        return
    
    excel_file = wq_files[0]
    print(f"💧 Reading: {excel_file.name}")
    
    try:
        db = SessionLocal()
        df = pd.read_excel(excel_file)
        
        print(f"   Rows: {len(df)}")
        
        # Get first active pond for demo
        pond = db.query(Pond).filter(Pond.status == "active").first()
        if not pond:
            print("   ⚠️ No active pond found")
            return
        
        # Import water quality records
        count = 0
        for idx, row in df.iterrows():
            date = parse_date(row.get("date"))
            if not date:
                continue
            
            do_val = clean_numeric(row.get("do(mg/l)"))
            ph_val = clean_numeric(row.get("ph"))
            temp_val = clean_numeric(row.get("temp(℃)"))
            
            if do_val and ph_val and temp_val:
                wq = WaterQuality(
                    pond_id=pond.id,
                    do=do_val,
                    ph=ph_val,
                    temperature=temp_val,
                    tan=clean_numeric(row.get("nh3-n(mg/l)")),
                    alkalinity=clean_numeric(row.get("alkalinty(mg/l)")),
                    floc=clean_numeric(row.get("floc (mg/l)")),
                    measured_by="system",
                    measured_at=date
                )
                db.add(wq)
                count += 1
        
        db.commit()
        print(f"   ✅ Imported {count} water quality records")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def import_feeding():
    """Import feeding data"""
    
    excel_files = list(DATA_FOLDER.glob("*.xlsx"))
    feeding_files = [f for f in excel_files if "اجمالى" in f.name or "التغذية" in f.name]
    
    if not feeding_files:
        print("❌ No feeding file found!")
        return
    
    excel_file = feeding_files[0]
    print(f"🍽️ Reading: {excel_file.name}")
    
    try:
        db = SessionLocal()
        df = pd.read_excel(excel_file)
        
        print(f"   Rows: {len(df)}")
        
        # Get first active pond for demo
        pond = db.query(Pond).filter(Pond.status == "active").first()
        if not pond:
            print("   ⚠️ No active pond found")
            return
        
        # Import feeding records
        count = 0
        for idx, row in df.iterrows():
            if row.get("month") == "Total":
                continue
            
            month = parse_date(row.get("month"))
            feed_amount = clean_numeric(row.get("feed(kg)"))
            
            if month and feed_amount and feed_amount > 0:
                feeding = Feeding(
                    pond_id=pond.id,
                    feed_amount=feed_amount,
                    feed_type="grower",
                    feeding_time="08:00",
                    fed_by="system",
                    fed_at=month
                )
                db.add(feeding)
                count += 1
        
        db.commit()
        print(f"   ✅ Imported {count} feeding records")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

def import_mortality():
    """Import mortality data"""
    
    excel_files = list(DATA_FOLDER.glob("*.xlsx"))
    mortality_files = [f for f in excel_files if "معدلات" in f.name or "النافق" in f.name]
    
    if not mortality_files:
        print("❌ No mortality file found!")
        return
    
    excel_file = mortality_files[0]
    print(f"☠️ Reading: {excel_file.name}")
    
    try:
        db = SessionLocal()
        df = pd.read_excel(excel_file)
        
        print(f"   Rows: {len(df)}")
        
        # Get first active pond for demo
        pond = db.query(Pond).filter(Pond.status == "active").first()
        if not pond:
            print("   ⚠️ No active pond found")
            return
        
        # Import mortality records
        count = 0
        for idx, row in df.iterrows():
            month = parse_date(row.get("month"))
            dead_count = clean_numeric(row.get("dead_fish_number"))
            loss_ratio = clean_numeric(row.get("loss_ratio"))
            
            if month and dead_count and dead_count > 0:
                mortality = Mortality(
                    pond_id=pond.id,
                    mortality_count=int(dead_count),
                    mortality_rate=loss_ratio * 100 if loss_ratio else 0,
                    cause="natural",
                    recorded_by="system",
                    recorded_at=month
                )
                db.add(mortality)
                count += 1
        
        db.commit()
        print(f"   ✅ Imported {count} mortality records")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 70)
    print("🐟 مزرعة الإنتاج الوطني - Farm Data Import")
    print("=" * 70)
    
    print("\n1️⃣ Importing Production Report (Ponds & Batches)...")
    import_production_report()
    
    print("\n2️⃣ Importing Water Quality Data...")
    import_water_quality()
    
    print("\n3️⃣ Importing Feeding Data...")
    import_feeding()
    
    print("\n4️⃣ Importing Mortality Data...")
    import_mortality()
    
    print("\n" + "=" * 70)
    print("✅ Import process completed!")
    print("=" * 70)
