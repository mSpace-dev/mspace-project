import requests
from bs4 import BeautifulSoup
import pdfplumber
import os
from datetime import datetime

# Step 1: Get the latest price report link
url = "https://www.cbsl.gov.lk/en/statistics/economic-indicators/price-report"
print(f"Fetching page: {url}")

try:
    res = requests.get(url, timeout=30)
    res.raise_for_status()  # Raises an HTTPError for bad responses
    print(f"✅ Successfully fetched page. Status: {res.status_code}")
except requests.RequestException as e:
    print(f"❌ Error fetching page: {e}")
    exit(1)

soup = BeautifulSoup(res.text, 'html.parser')

pdf_link = None
for a in soup.find_all('a', href=True):
    href = a['href']
    print(f"Found link: {href}")  # Debug print
    if "price_report_" in href:
        # Check if the href is already a full URL or a relative path
        if href.startswith('http'):
            pdf_link = href
        else:
            pdf_link = "https://www.cbsl.gov.lk" + href
        print(f"Selected PDF link: {pdf_link}")
        break

# Step 2: Download the PDF
if pdf_link:
    print(f"Downloading PDF from: {pdf_link}")
    pdf_response = requests.get(pdf_link)
    
    if pdf_response.status_code == 200:
        filename = "Daily Price Report - 01 July 2025.pdf"
        with open(filename, 'wb') as f:
            f.write(pdf_response.content)
        print(f"✅ PDF downloaded successfully as: {filename}")
        
        # Step 3: Extract prices from PDF
        try:
            with pdfplumber.open(filename) as pdf:
                if len(pdf.pages) > 1:
                    first_page = pdf.pages[1]  # Page 2 (0-indexed)
                else:
                    first_page = pdf.pages[0]  # Fall back to first page
                    
                text = first_page.extract_text()

                print("---- Extracted Text ----")
                print(text)
                
                # Save extracted text to file for further processing
                text_filename = "./pricefetch/price_data.txt"
                with open(text_filename, 'w', encoding='utf-8') as text_file:
                    text_file.write(text)
                print(f"✅ Text extracted and saved to: {text_filename}")
                
        except Exception as e:
            print(f"❌ Error extracting text from PDF: {e}")
    else:
        print(f"❌ Failed to download PDF. Status code: {pdf_response.status_code}")
else:
    print("❌ PDF link not found.")
