import urllib.request
import json
import os
from collections import defaultdict

# Configuration
API_URL = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645&offset=0&limit=all&format=json"
# Correcting the path to be absolute or relative to the script's location
# The script is in backend/scripts/update_crop_prices.py
# The target is in frontend/src/data/state_crop_averages.json
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(SCRIPT_DIR))
TARGET_FILE = os.path.join(PROJECT_ROOT, "frontend", "src", "data", "state_crop_averages.json")

def fetch_data(url, max_retries=3):
    import time
    for attempt in range(max_retries):
        print(f"Fetching data from {url} (Attempt {attempt + 1}/{max_retries})...")
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    return json.loads(response.read().decode())
                else:
                    print(f"Error: API returned status code {response.status}")
        except Exception as e:
            print(f"Error fetching data: {e}")
        
        if attempt < max_retries - 1:
            sleep_time = 5 * (attempt + 1)
            print(f"Retrying in {sleep_time} seconds...")
            time.sleep(sleep_time)
            
    return None

def process_data(data):
    if not data or 'records' not in data:
        print("No records found in API response.")
        return []

    # Group by state and commodity
    # Structure: groups[(state, commodity)] = [prices]
    groups = defaultdict(list)
    
    for record in data['records']:
        state = record.get('state')
        commodity = record.get('commodity')
        price_str = record.get('modal_price')
        
        if state and commodity and price_str:
            try:
                price = float(price_str)
                groups[(state, commodity)].append(price)
            except ValueError:
                # Skip records with non-numeric prices
                continue

    # Calculate averages
    averages = []
    for (state, commodity), prices in groups.items():
        avg_price = sum(prices) / len(prices)
        averages.append({
            "state": state,
            "commodity": commodity,
            "average_price": round(avg_price, 2)
        })
    
    # Sort for consistency
    averages.sort(key=lambda x: (x['state'], x['commodity']))
    return averages

def main():
    data = fetch_data(API_URL)
    if data:
        processed_data = process_data(data)
        if processed_data:
            print(f"Processed {len(processed_data)} state-crop combinations.")
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(TARGET_FILE), exist_ok=True)
            
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                json.dump(processed_data, f, indent=4)
            print(f"Successfully updated {TARGET_FILE}")
        else:
            print("No data processed. File not updated.")
    else:
        print("Failed to fetch data.")

if __name__ == "__main__":
    main()
