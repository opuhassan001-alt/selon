import urllib.request
import urllib.parse
import json
import re
import os
import time
import csv
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

RAW_DIR = os.path.join(os.getcwd(), "dhaka_salons_raw")
CSV_PATH = os.path.join(os.getcwd(), "dhaka_salons.csv")
os.makedirs(RAW_DIR, exist_ok=True)

# Area queries across major hubs in Dhaka
QUERIES = [
    ("salons in Gulshan Dhaka", 23.7925, 90.4078),
    ("beauty parlor in Banani Dhaka", 23.7940, 90.4043),
    ("gents salon in Dhanmondi Dhaka", 23.7461, 90.3742),
    ("barber shop in Uttara Dhaka", 23.8759, 90.3795),
    ("hair salon in Mirpur Dhaka", 23.8069, 90.3687),
    ("salons in Mohammadpur Dhaka", 23.7658, 90.3584),
    ("beauty parlour in Bashundhara Dhaka", 23.8164, 90.4312)
]

def fetch_maps_places(query, lat, lon):
    encoded_q = urllib.parse.quote(query)
    # Standard Google Maps search endpoint pb string with lat/lon
    pb = f"!4m12!1m3!1d3826.9!2d{lon}!3d{lat}!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f15.0!7i20!8i0!10b1!12m22!1m3!18b1!30b1!34e1!2m3!5m1!6e2!20e3!4b0!10b1!12b1!13b1!16b1!17m1!3e1!20m3!5e2!6b1!14b1!46m1!1b0!96b1!19m4!2m3!1i360!2i120!4i8"
    url = f"https://maps.google.com/search?tbm=map&authuser=0&hl=en&gl=bd&q={encoded_q}&pb={pb}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
    }
    
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        raw_text = resp.read().decode('utf-8', errors='ignore')
    
    return raw_text

def parse_places(raw_text):
    text = raw_text
    if text.startswith(")]}'\n"):
        text = text[5:]
    elif text.startswith("/*\"\"*/"):
        text = text[6:]
    
    try:
        data = json.loads(text)
    except Exception as e:
        print(f"JSON parse error: {e}")
        return []
    
    if not data or not isinstance(data, list) or len(data) == 0:
        return []
    
    # Results are in data[0][1]
    if len(data[0]) < 2 or not isinstance(data[0][1], list):
        return []
    
    places = []
    for entry in data[0][1]:
        if not entry or len(entry) < 15 or not entry[14]:
            continue
        details = entry[14]
        name = details[11] if len(details) > 11 else None
        if not name or not isinstance(name, str) or not name.strip():
            continue
        
        name = name.strip()
        
        # Coordinates: details[9] is often [None, None, lat, lon]
        lat, lon = None, None
        if len(details) > 9 and isinstance(details[9], list) and len(details[9]) >= 4:
            lat = details[9][2]
            lon = details[9][3]
        
        # Reviews: details[4] -> [rating, count, ...]
        review_count = 0
        if len(details) > 4 and isinstance(details[4], list) and len(details[4]) > 8:
            if details[4][8] and isinstance(details[4][8], (int, float)):
                review_count = int(details[4][8])
        has_review = "Yes" if review_count > 0 else "No"
        
        # Public phone number
        entry_str = json.dumps(entry)
        # Search for Bangladeshi format: +8801..., 01..., 02...
        phone_match = re.search(r'\"(\+?880[0-9\-\s]{8,15}|01[0-9\-\s]{8,12})\"', entry_str)
        phone = phone_match.group(1).strip() if phone_match else ""
        
        # Photo URLs
        raw_photos = re.findall(r'https://lh\d\.googleusercontent\.com/[^\s"\'\\]+', entry_str)
        cleaned_photos = []
        for p in raw_photos:
            # Upgrade thumbnail resolution from s44 to s800
            p_up = re.sub(r'/s\d+-[^/]+/', '/s800/', p)
            cleaned_photos.append(p_up)
        # deduplicate maintaining order
        cleaned_photos = list(dict.fromkeys(cleaned_photos))
        has_photo = "Yes" if len(cleaned_photos) > 0 else "No"
        photo_urls_str = ", ".join(cleaned_photos) if cleaned_photos else ""
        
        location_str = f"{lat},{lon}" if lat is not None and lon is not None else ""
        
        places.append({
            "name": name,
            "has_review": has_review,
            "has_photo": has_photo,
            "photo_urls": photo_urls_str,
            "phone": phone,
            "location": location_str,
            "raw_entry": entry
        })
        
    return places

def sanitize_filename(name):
    clean = re.sub(r'[^a-zA-Z0-9_\- ]', '', name)
    clean = clean.replace(' ', '_')
    return clean[:40]

def main():
    print("=== Scraping Dhaka Salons & Barber Shops from Google Maps ===")
    all_salons = []
    seen_keys = set()
    
    target_count = 52  # roughly 50 records
    
    for q_idx, (query, lat, lon) in enumerate(QUERIES):
        if len(all_salons) >= target_count:
            break
            
        print(f"\n[Query {q_idx+1}/{len(QUERIES)}] '{query}' (geo: {lat}, {lon})")
        try:
            raw_response = fetch_maps_places(query, lat, lon)
            places = parse_places(raw_response)
            print(f"  -> Found {len(places)} listings")
            
            # Save query batch raw response
            query_raw_file = os.path.join(RAW_DIR, f"query_{q_idx+1}_{sanitize_filename(query)}.json")
            with open(query_raw_file, 'w', encoding='utf-8') as f:
                f.write(raw_response)
                
            for place in places:
                # Deduplication key based on normalized name and approx location
                norm_name = re.sub(r'\s+', ' ', place['name'].lower()).strip()
                loc_key = place['location'][:10] if place['location'] else norm_name
                dedupe_key = (norm_name, loc_key)
                
                if dedupe_key in seen_keys:
                    continue
                seen_keys.add(dedupe_key)
                
                item_idx = len(all_salons) + 1
                place['id'] = item_idx
                all_salons.append(place)
                
                # Save individual listing raw data
                item_filename = f"salon_{item_idx:02d}_{sanitize_filename(place['name'])}.json"
                item_path = os.path.join(RAW_DIR, item_filename)
                with open(item_path, 'w', encoding='utf-8') as f:
                    json.dump(place['raw_entry'], f, ensure_ascii=False, indent=2)
                
                if len(all_salons) >= target_count:
                    break
                    
        except Exception as e:
            print(f"  Error fetching query '{query}': {e}")
            
        # Respect rate limits and pause at least 2.5 seconds between requests
        print("  Pausing 2.5s to respect rate limits...")
        time.sleep(2.5)

    print(f"\nSuccessfully collected {len(all_salons)} unique salon/barber shop records.")

    # Write to CSV
    # Required columns in exact order:
    # 1. Salon/Barber-Shop Name
    # 2. Has Review (Yes/No)
    # 3. Has Photo (Yes/No)
    # 4. Photo URLs (comma-separated; leave blank if none)
    # 5. Phone Number (as listed on Google Maps; leave blank if not available)
    # 6. Google Maps Location (latitude, longitude)
    headers = [
        "Salon/Barber-Shop Name",
        "Has Review",
        "Has Photo",
        "Photo URLs",
        "Phone Number",
        "Google Maps Location"
    ]
    
    with open(CSV_PATH, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(headers)
        for s in all_salons:
            writer.writerow([
                s['name'],
                s['has_review'],
                s['has_photo'],
                s['photo_urls'],
                s['phone'],
                s['location']
            ])

    print(f"Generated CSV file: {CSV_PATH}")
    print(f"Raw data directory: {RAW_DIR}")

if __name__ == "__main__":
    main()

