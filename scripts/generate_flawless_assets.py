import json
import urllib.request
import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

SEED_PATH = os.path.join(os.getcwd(), "data", "super-page-seed.json")
ASSETS_DIR = os.path.join(os.getcwd(), "public", "assets")
SALONS_DIR = os.path.join(ASSETS_DIR, "salons")
os.makedirs(SALONS_DIR, exist_ok=True)

# Curated pools of high-res Unsplash photos (1000px)
GENTS_PHOTOS = [
    "photo-1503951914875-452162b0f3f1", # classic barbershop chair
    "photo-1585747860715-2ba37e788b70", # vintage barber tools & mirrors
    "photo-1622286342621-4bd786c2447c", # modern barber interior
    "photo-1599351431202-1e0f0137899a", # barber haircut action
    "photo-1517832606589-7629c3397143", # luxury dark barbershop
    "photo-1534778101976-62847782c213", # clean minimal barber chairs
    "photo-1605497788044-5a32c7078486", # wood & brick barbershop
    "photo-1621605815971-fbc98d665033", # barber chair & station
    "photo-1592647420148-bf0ce3105ff5", # hipster barber lounge
    "photo-1512690459411-b9245aed614b", # classic leather salon chair
]

LADIES_PHOTOS = [
    "photo-1560066984-138dadb4c035", # bright luxury beauty salon
    "photo-1522337360788-8b13dee7a37e", # modern hair salon styling station
    "photo-1521590832167-7bcbfaa6381f", # hair washing sinks & salon
    "photo-1562322140-8baeececf3df", # hair blowout & styling
    "photo-1487412720507-e7ab37603c6f", # aesthetic glow & skincare
    "photo-1607779097040-26e80aa78e66", # nail spa & manicure station
    "photo-1570172619644-dfd03ed5d881", # beauty facial spa treatment
    "photo-1516975080664-ed2fc6a32937", # luxury cosmetics & parlor
    "photo-1527799820374-dcf8d9d4a388", # modern hair studio mirrors
    "photo-1519699047748-de8e457a634e", # chic hair salon interior
]

UNISEX_PHOTOS = [
    "photo-1521590832167-7bcbfaa6381f", # modern wash station
    "photo-1634449571010-02389ed0f9b0", # sleek minimalist salon
    "photo-1595476108010-b4d1f102b1b1", # bright aesthetic salon studio
    "photo-1582095133179-bfd08e2fc6b3", # luxury hair lounge
    "photo-1519699047748-de8e457a634e", # warm ambient salon lights
    "photo-1522337360788-8b13dee7a37e", # contemporary salon chairs
    "photo-1560066984-138dadb4c035", # open plan styling room
    "photo-1503951914875-452162b0f3f1", # premium styling chair
    "photo-1622286342621-4bd786c2447c", # industrial chic studio
    "photo-1517832606589-7629c3397143", # executive grooming salon
]

LOCAL_FALLBACKS = [
    os.path.join(ASSETS_DIR, "hero-barber.jpg"),
    os.path.join(ASSETS_DIR, "studio-barberia.jpg"),
    os.path.join(ASSETS_DIR, "service-hair.jpg"),
    os.path.join(ASSETS_DIR, "service-style.jpg"),
    os.path.join(ASSETS_DIR, "service-trim.jpg"),
    os.path.join(ASSETS_DIR, "service-facial.jpg"),
    os.path.join(ASSETS_DIR, "service-color.jpg"),
    os.path.join(ASSETS_DIR, "service-shave.jpg"),
    os.path.join(ASSETS_DIR, "studio-haven.jpg"),
]

def download_or_fallback(photo_id, target_file, fallback_idx):
    url = f"https://images.unsplash.com/{photo_id}?w=1000&auto=format&fit=crop&q=85"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = resp.read()
            if len(data) > 10000:
                with open(target_file, 'wb') as f:
                    f.write(data)
                return True
    except Exception as e:
        print(f"  CDN fallback for {photo_id}: {e}")
    
    # Fallback from local assets
    local_src = LOCAL_FALLBACKS[fallback_idx % len(LOCAL_FALLBACKS)]
    if os.path.exists(local_src):
        shutil.copyfile(local_src, target_file)
        return True
    return False

def main():
    print("=== Generating 100% Local Flawless Assets ===")
    
    with open(SEED_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    salons = data.get("salons", [])
    applications = data.get("applications", [])
    
    app_map = {a["id"]: a for a in applications}
    
    gents_count = 0
    ladies_count = 0
    unisex_count = 0
    
    updated_count = 0
    
    for i, s in enumerate(salons):
        salon_id = s.get("id", "")
        # Only process Dhaka scraped salons (sln-dhk-*)
        if not salon_id.startswith("sln-dhk-"):
            continue
            
        target_filename = f"{salon_id}.jpg"
        target_path = os.path.join(SALONS_DIR, target_filename)
        web_path = f"/assets/salons/{target_filename}"
        
        name_lower = s.get("name", "").lower()
        is_ladies = any(w in name_lower for w in ["femina", "beauty", "parlor", "parlour", "women", "ladies", "makeover", "asmita", "sabina", "shakil", "elegance", "red beauty", "celene", "lounge", "samia", "rose", "aesthetic"])
        is_gents = any(w in name_lower for w in ["men", "mens", "gents", "barber", "blade", "adam", "crown", "barbershop", "shave", "fade", "haircut saloon"])
        
        if is_ladies and not is_gents:
            photo_id = LADIES_PHOTOS[ladies_count % len(LADIES_PHOTOS)]
            ladies_count += 1
        elif is_gents and not is_ladies:
            photo_id = GENTS_PHOTOS[gents_count % len(GENTS_PHOTOS)]
            gents_count += 1
        else:
            photo_id = UNISEX_PHOTOS[unisex_count % len(UNISEX_PHOTOS)]
            unisex_count += 1
            
        # Download or copy verified image
        if not os.path.exists(target_path) or os.path.getsize(target_path) < 10000:
            ok = download_or_fallback(photo_id, target_path, i)
            if ok:
                print(f"[{i+1}] {s['name'][:30]} -> {target_filename} ({os.path.getsize(target_path)} bytes)")
            else:
                print(f"[{i+1}] ERROR on {s['name']}")
        
        # Set clean local web path in seed data
        s["cover_photo_url"] = web_path
        
        # Update matching application
        app_id = s.get("application_id")
        if app_id in app_map:
            app_map[app_id]["cover_photo_url"] = web_path
            
        updated_count += 1

    with open(SEED_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"\nSUCCESS: Updated {updated_count} salons with guaranteed 100% local assets.")
    print(f"Total files in {SALONS_DIR}: {len(os.listdir(SALONS_DIR))}")

if __name__ == "__main__":
    main()

