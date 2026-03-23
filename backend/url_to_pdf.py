import os
import asyncio
from playwright.async_api import async_playwright

class URLToPDFConverter:
    """Utility to convert a website URL to a PDF file using Playwright"""

    @staticmethod
    async def convert(url, output_path):
        """
        Captures a website URL and saves it as a PDF.
        
        Args:
            url (str): The website URL to capture.
            output_path (str): The file path to save the PDF.
            
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                
                # Set a reasonable timeout and wait for network idle
                await page.goto(url, wait_until="networkidle", timeout=60000)
                
                # Use standard A4 format
                await page.pdf(
                    path=output_path,
                    format="A4",
                    print_background=True,
                    margin={"top": "0px", "right": "0px", "bottom": "0px", "left": "0px"}
                )
                
                await browser.close()
                
            if os.path.exists(output_path):
                print(f"✓ URL converted to PDF: {output_path}")
                return True
            return False
            
        except Exception as e:
            print(f"✗ Error converting URL to PDF: {e}")
            return False

def sync_convert_url_to_pdf(url, output_path):
    """Synchronous wrapper for async convert method"""
    return asyncio.run(URLToPDFConverter.convert(url, output_path))
