import re
import json
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../.env')

class PriceDataParser:
    def __init__(self, mongodb_uri: str = None, db_name: str = "Agrilink"):
        self.mongodb_uri = mongodb_uri or os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
        self.db_name = db_name or os.getenv('DB_NAME', 'agrilink')
        self.client = None
        self.db = None
        
        print(f"🔗 Connecting to MongoDB...")
        print(f"URI: {self.mongodb_uri[:50]}...")  # Show first 50 chars for security
        print(f"Database: {self.db_name}")
        
        self.setup_database()
    
    def setup_database(self):
        """Connect to MongoDB and setup collections with indexes"""
        try:
            self.client = MongoClient(self.mongodb_uri)
            # Test connection
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            
            # Create collections and indexes
            self.setup_collections()
            print("✅ Connected to MongoDB successfully")
            
        except ConnectionFailure as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    def setup_collections(self):
        """Setup MongoDB collections with appropriate indexes"""
        # Commodities collection
        self.db.commodities.create_index("name", unique=True)
        self.db.commodities.create_index("category")
        
        # Markets collection
        self.db.markets.create_index("name", unique=True)
        self.db.markets.create_index("type")
        
        # Price records collection
        self.db.price_records.create_index([
            ("commodity_name", 1),
            ("market_name", 1),
            ("date", 1),
            ("price_type", 1)
        ], unique=True)
        self.db.price_records.create_index("date")
        self.db.price_records.create_index("commodity_name")
        self.db.price_records.create_index("market_name")
        
        # Price changes collection
        self.db.price_changes.create_index([
            ("commodity_name", 1),
            ("market_name", 1),
            ("date", 1)
        ], unique=True)
        self.db.price_changes.create_index("date")
        self.db.price_changes.create_index("significant_change")
        self.db.price_changes.create_index("change_percentage")
    
    def parse_price_text(self, text_content: str, report_date: str = None) -> Dict[str, Any]:
        """Parse the price report text and extract structured data"""
        
        if not report_date:
            # Extract date from the first line
            date_match = re.search(r'(\d{2}\s+\w+\s+\d{4})', text_content)
            if date_match:
                report_date = datetime.strptime(date_match.group(1), '%d %B %Y').date()
            else:
                report_date = date.today()
        
        lines = text_content.strip().split('\n')
        
        # Find the header line with market names
        header_line = None
        for i, line in enumerate(lines):
            if 'Pettah' in line and 'Dambulla' in line:
                header_line = i
                break
        
        if header_line is None:
            raise ValueError("Could not find market header line")
        
        # Extract market information
        markets = self._extract_markets(lines[header_line])
        
        # Parse commodity data
        commodities = []
        current_category = "OTHER"  # Default category
        
        print(f"DEBUG: Starting to parse commodities from line {header_line + 2}")
        
        for i, line in enumerate(lines[header_line + 2:], start=header_line + 2):  # Skip header and subheader
            line = line.strip()
            
            if not line:
                continue
                
            # Skip lines with "n.a." or summary text
            if line.startswith('n.a.') or 'Price increased' in line or 'Price decreased' in line:
                continue
            
            print(f"DEBUG: Processing line {i}: {line[:50]}...")
            
            # Check if this is a category line (all caps with spaces between letters)
            category_patterns = [
                r'^V\s+E\s+G\s+E\s+T\s+A\s+B\s+L\s+E\s+S$',
                r'^O\s+T\s+H\s+E\s+R$',
                r'^F\s+R\s+U\s+I\s+T\s+S$',
                r'^R\s+I\s+C\s+E$',
                r'^F\s+I\s+S\s+H$'
            ]
            
            is_category = False
            for pattern in category_patterns:
                if re.match(pattern, line):
                    if 'V E G E T A B L E S' in line:
                        current_category = "VEGETABLES"
                    elif 'O T H E R' in line:
                        current_category = "OTHER"
                    elif 'F R U I T S' in line:
                        current_category = "FRUITS"
                    elif 'R I C E' in line:
                        current_category = "RICE"
                    elif 'F I S H' in line:
                        current_category = "FISH"
                    
                    print(f"DEBUG: Found category: {current_category}")
                    is_category = True
                    break
            
            if is_category:
                continue
            
            # Parse commodity line
            commodity_data = self._parse_commodity_line(line, markets, current_category)
            if commodity_data:
                print(f"DEBUG: Successfully parsed: {commodity_data['name']} in {commodity_data['category']}")
                commodities.append(commodity_data)
            else:
                print(f"DEBUG: Failed to parse line: {line}")
        
        print(f"DEBUG: Total commodities parsed: {len(commodities)}")
        
        return {
            'date': report_date,
            'markets': markets,
            'commodities': commodities
        }
    
    def _extract_markets(self, header_line: str) -> List[Dict[str, str]]:
        """Extract market information from header line"""
        markets = []
        
        # Define the market structure based on the header
        wholesale_markets = ['Pettah', 'Dambulla']
        retail_markets = ['Pettah', 'Dambulla', 'Narahenpita']
        
        for market in wholesale_markets:
            markets.append({
                'name': market,
                'type': 'wholesale',
                'location': market
            })
        
        for market in retail_markets:
            markets.append({
                'name': f"{market}_retail",
                'type': 'retail',
                'location': market
            })
        
        return markets
    
    def _parse_commodity_line(self, line: str, markets: List[Dict], category: str) -> Optional[Dict]:
        """Parse a single commodity line"""
        print(f"DEBUG: Parsing line: {line}")
        
        # First, extract the commodity name and unit by finding the first part before the prices
        # Look for pattern: Name + Unit (Rs./kg, Rs./Nut, etc.) + prices
        
        # Match commodity name and unit
        match = re.match(r'^(.+?)\s+(Rs\./\w+)', line)
        if not match:
            print(f"DEBUG: Could not extract commodity name and unit")
            return None
        
        commodity_name = match.group(1).strip()
        unit = match.group(2).strip()
        
        # Extract the remaining text after the unit
        remaining_text = line[match.end():].strip()
        
        print(f"DEBUG: Commodity: {commodity_name}, Unit: {unit}")
        print(f"DEBUG: Remaining text: {remaining_text}")
        
        # Extract prices from the remaining text
        # Handle numbers with spaces like "5 00.00" and commas like "1 ,600.00"
        price_data = []
        
        # Replace "n.a." with placeholder to avoid confusion
        remaining_text = re.sub(r'\bn\.a\.\b', 'N/A', remaining_text)
        
        # Extract prices using regex that handles spaced numbers
        # Pattern matches: digits with optional space, more digits, optional decimal
        price_pattern = r'(\d{1,2}\s+\d{2,3}(?:\.\d{2})?|\d{1,2}\s*,\s*\d{3}(?:\.\d{2})?|\d+\.\d{2})'
        matches = re.findall(price_pattern, remaining_text)
        
        print(f"DEBUG: Found price matches: {matches}")
        
        for match in matches:
            try:
                # Clean the match: remove spaces and commas
                cleaned = re.sub(r'\s+', '', match)  # Remove all spaces
                cleaned = cleaned.replace(',', '')    # Remove commas
                
                if cleaned and cleaned != 'N/A':
                    price = float(cleaned)
                    if price > 0:  # Only add valid positive prices
                        price_data.append(price)
                        print(f"DEBUG: Extracted price: {price}")
            except ValueError:
                continue
        
        print(f"DEBUG: Final price data: {price_data}")
        
        if len(price_data) < 4:  # Need at least 4 prices (2 wholesale markets x 2 days)
            print(f"DEBUG: Not enough prices: {len(price_data)}")
            return None
        
        # Map prices to markets (yesterday/today for each market)
        commodity_prices = []
        price_index = 0
        
        # Wholesale markets (Pettah, Dambulla) - 2 prices each (yesterday, today)
        for market in ['Pettah', 'Dambulla']:
            if price_index + 1 < len(price_data):
                yesterday_price = price_data[price_index]
                today_price = price_data[price_index + 1]
                
                commodity_prices.append({
                    'market': market,
                    'market_type': 'wholesale',
                    'yesterday_price': yesterday_price,
                    'today_price': today_price
                })
                print(f"DEBUG: {market} wholesale: {yesterday_price} -> {today_price}")
                price_index += 2
        
        # Retail markets (Pettah, Dambulla, Narahenpita) - 2 prices each (yesterday, today)
        for market in ['Pettah', 'Dambulla', 'Narahenpita']:
            if price_index + 1 < len(price_data):
                yesterday_price = price_data[price_index]
                today_price = price_data[price_index + 1]
                
                commodity_prices.append({
                    'market': f"{market}_retail",
                    'market_type': 'retail',
                    'yesterday_price': yesterday_price,
                    'today_price': today_price
                })
                print(f"DEBUG: {market} retail: {yesterday_price} -> {today_price}")
                price_index += 2
        
        if not commodity_prices:
            print(f"WARNING: No prices extracted for {commodity_name}")
            return None
        
        result = {
            'name': commodity_name,
            'category': category,
            'unit': unit,
            'prices': commodity_prices
        }
        
        print(f"DEBUG: Successfully parsed {commodity_name} with {len(commodity_prices)} price records")
        return result
    
    def store_data(self, parsed_data: Dict[str, Any]) -> bool:
        """Store parsed data in MongoDB"""
        try:
            report_date = parsed_data['date']
            if isinstance(report_date, date):
                report_date = datetime.combine(report_date, datetime.min.time())
            
            print(f"📅 Storing data for date: {report_date}")
            
            # Insert/update markets
            markets_inserted = 0
            for market in parsed_data['markets']:
                market_doc = {
                    'name': market['name'],
                    'type': market['type'],
                    'location': market['location'],
                    'created_at': datetime.now()
                }
                result = self.db.markets.update_one(
                    {'name': market['name']},
                    {'$setOnInsert': market_doc},
                    upsert=True
                )
                if result.upserted_id:
                    markets_inserted += 1
            
            print(f"🏪 Markets processed: {len(parsed_data['markets'])}, new: {markets_inserted}")
            
            # Process commodities
            commodities_inserted = 0
            price_records_inserted = 0
            price_changes_inserted = 0
            
            for commodity in parsed_data['commodities']:
                # Insert/update commodity
                commodity_doc = {
                    'name': commodity['name'],
                    'category': commodity['category'],
                    'unit': commodity['unit'],
                    'created_at': datetime.now()
                }
                result = self.db.commodities.update_one(
                    {'name': commodity['name']},
                    {'$setOnInsert': commodity_doc},
                    upsert=True
                )
                if result.upserted_id:
                    commodities_inserted += 1
                
                # Insert price records
                for price_record in commodity['prices']:
                    yesterday_price = price_record.get('yesterday_price')
                    today_price = price_record.get('today_price')
                    
                    # Insert yesterday price
                    if yesterday_price is not None:
                        price_doc = {
                            'commodity_name': commodity['name'],
                            'commodity_category': commodity['category'],
                            'commodity_unit': commodity['unit'],
                            'market_name': price_record['market'],
                            'market_type': price_record['market_type'],
                            'price': yesterday_price,
                            'date': report_date,
                            'price_type': 'yesterday',
                            'created_at': datetime.now()
                        }
                        result = self.db.price_records.update_one(
                            {
                                'commodity_name': commodity['name'],
                                'market_name': price_record['market'],
                                'date': report_date,
                                'price_type': 'yesterday'
                            },
                            {'$set': price_doc},
                            upsert=True
                        )
                        if result.upserted_id or result.modified_count > 0:
                            price_records_inserted += 1
                    
                    # Insert today price
                    if today_price is not None:
                        price_doc = {
                            'commodity_name': commodity['name'],
                            'commodity_category': commodity['category'],
                            'commodity_unit': commodity['unit'],
                            'market_name': price_record['market'],
                            'market_type': price_record['market_type'],
                            'price': today_price,
                            'date': report_date,
                            'price_type': 'today',
                            'created_at': datetime.now()
                        }
                        result = self.db.price_records.update_one(
                            {
                                'commodity_name': commodity['name'],
                                'market_name': price_record['market'],
                                'date': report_date,
                                'price_type': 'today'
                            },
                            {'$set': price_doc},
                            upsert=True
                        )
                        if result.upserted_id or result.modified_count > 0:
                            price_records_inserted += 1
                    
                    # Calculate and store price changes
                    if yesterday_price is not None and today_price is not None:
                        change_amount = today_price - yesterday_price
                        change_percentage = (change_amount / yesterday_price) * 100 if yesterday_price > 0 else 0
                        
                        if abs(change_percentage) >= 5:
                            significant_change = True
                            trend = 'increase' if change_percentage > 0 else 'decrease'
                        else:
                            significant_change = False
                            trend = 'increase' if change_percentage > 0 else ('decrease' if change_percentage < 0 else 'stable')
                        
                        change_doc = {
                            'commodity_name': commodity['name'],
                            'commodity_category': commodity['category'],
                            'commodity_unit': commodity['unit'],
                            'market_name': price_record['market'],
                            'market_type': price_record['market_type'],
                            'date': report_date,
                            'yesterday_price': yesterday_price,
                            'today_price': today_price,
                            'change_amount': change_amount,
                            'change_percentage': change_percentage,
                            'trend': trend,
                            'significant_change': significant_change,
                            'created_at': datetime.now()
                        }
                        
                        result = self.db.price_changes.update_one(
                            {
                                'commodity_name': commodity['name'],
                                'market_name': price_record['market'],
                                'date': report_date
                            },
                            {'$set': change_doc},
                            upsert=True
                        )
                        if result.upserted_id or result.modified_count > 0:
                            price_changes_inserted += 1
            
            print(f"🌾 Commodities processed: {len(parsed_data['commodities'])}, new: {commodities_inserted}")
            print(f"💰 Price records inserted/updated: {price_records_inserted}")
            print(f"📊 Price changes inserted/updated: {price_changes_inserted}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error storing data: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def get_latest_prices(self, category: str = None, market_type: str = None) -> List[Dict]:
        """Get latest prices from MongoDB"""
        # Find the latest date
        latest_date_result = self.db.price_records.find().sort("date", -1).limit(1)
        latest_date_list = list(latest_date_result)
        
        if not latest_date_list:
            return []
        
        latest_date = latest_date_list[0]['date']
        
        # Build query filter
        query_filter = {'date': latest_date}
        
        if category:
            query_filter['commodity_category'] = category
        
        if market_type:
            query_filter['market_type'] = market_type
        
        # Get prices
        results = self.db.price_records.find(query_filter).sort([
            ('commodity_category', 1),
            ('commodity_name', 1),
            ('market_name', 1),
            ('price_type', 1)
        ])
        
        prices = []
        for record in results:
            prices.append({
                'commodity_name': record['commodity_name'],
                'category': record['commodity_category'],
                'unit': record['commodity_unit'],
                'market_name': record['market_name'],
                'market_type': record['market_type'],
                'price': record['price'],
                'date': record['date'].strftime('%Y-%m-%d') if isinstance(record['date'], datetime) else str(record['date']),
                'price_type': record['price_type']
            })
        
        return prices
    
    def get_price_changes(self, significant_only: bool = False) -> List[Dict]:
        """Get price changes from MongoDB"""
        # Find the latest date
        latest_date_result = self.db.price_changes.find().sort("date", -1).limit(1)
        latest_date_list = list(latest_date_result)
        
        if not latest_date_list:
            return []
        
        latest_date = latest_date_list[0]['date']
        
        # Build query filter
        query_filter = {'date': latest_date}
        
        if significant_only:
            query_filter['significant_change'] = True
        
        # Get price changes sorted by absolute change percentage (descending)
        results = list(self.db.price_changes.find(query_filter))
        
        # Sort by absolute change percentage
        results.sort(key=lambda x: abs(x.get('change_percentage', 0)), reverse=True)
        
        changes = []
        for record in results:
            changes.append({
                'commodity_name': record['commodity_name'],
                'category': record['commodity_category'],
                'unit': record['commodity_unit'],
                'market_name': record['market_name'],
                'market_type': record['market_type'],
                'yesterday_price': record['yesterday_price'],
                'today_price': record['today_price'],
                'change_amount': record['change_amount'],
                'change_percentage': record['change_percentage'],
                'trend': record['trend'],
                'significant_change': record['significant_change'],
                'date': record['date'].strftime('%Y-%m-%d') if isinstance(record['date'], datetime) else str(record['date'])
            })
        
        return changes
    
    def close_connection(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()

def main():
    """Main function to parse and store price data"""
    parser = PriceDataParser()
    
    # Read the price data file
    try:
        with open('e:/mspace project/pricefetch/price_data_20250702.txt', 'r', encoding='utf-8') as f:
            text_content = f.read()
        
        print("🔍 Parsing price data...")
        parsed_data = parser.parse_price_text(text_content)
        
        print(f"📊 Found {len(parsed_data['commodities'])} commodities")
        print(f"📅 Report date: {parsed_data['date']}")
        
        # Show parsed categories and sample data
        categories = {}
        for commodity in parsed_data['commodities']:
            category = commodity['category']
            if category not in categories:
                categories[category] = []
            categories[category].append(commodity['name'])
        
        print("\n📋 Categories found:")
        for category, items in categories.items():
            print(f"  {category}: {len(items)} items")
            print(f"    Sample: {', '.join(items[:3])}{'...' if len(items) > 3 else ''}")
        
        print("\n💾 Storing data in database...")
        success = parser.store_data(parsed_data)
        
        if success:
            print("✅ Data stored successfully!")
            
            # Show some sample data
            print("\n--- Latest Prices (Sample) ---")
            latest_prices = parser.get_latest_prices()
            for price in latest_prices[:10]:  # Show first 10
                print(f"{price['commodity_name']} ({price['market_name']}): Rs. {price['price']} ({price['price_type']})")
            
            print("\n--- Significant Price Changes ---")
            changes = parser.get_price_changes(significant_only=True)
            if changes:
                for change in changes[:5]:  # Show top 5
                    print(f"{change['commodity_name']} ({change['market_name']}): {change['change_percentage']:.1f}% {change['trend']}")
            else:
                print("No significant price changes found")
        
        else:
            print("❌ Failed to store data")
    
    except FileNotFoundError:
        print("❌ Price data file not found")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        parser.close_connection()

if __name__ == "__main__":
    main()
