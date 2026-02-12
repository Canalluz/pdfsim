"""
Word Converter Module
Handles PDF ↔ Word conversions for the PDF editor
"""
import os
from typing import Optional
from pdf2docx import Converter
import platform

class WordConverter:
    """Manages conversions between PDF and Word formats"""
    
    @staticmethod
    def pdf_to_word(pdf_path: str, docx_path: str) -> bool:
        """
        Convert PDF to Word (.docx) format
        
        Args:
            pdf_path: Path to input PDF file
            docx_path: Path to output DOCX file
            
        Returns:
            True if conversion successful, False otherwise
        """
        try:
            # Create converter instance
            cv = Converter(pdf_path)
            
            # Convert PDF to DOCX
            cv.convert(docx_path, start=0, end=None)
            cv.close()
            
            # Verify output file was created
            if os.path.exists(docx_path):
                print(f"✓ PDF converted to Word: {docx_path}")
                return True
            else:
                print(f"✗ Conversion failed: Output file not created")
                return False
                
        except Exception as e:
            print(f"✗ Error converting PDF to Word: {e}")
            return False
    
    @staticmethod
    def word_to_pdf(docx_path: str, pdf_path: str) -> bool:
        """
        Convert Word (.docx) to PDF format
        
        Args:
            docx_path: Path to input DOCX file
            pdf_path: Path to output PDF file
            
        Returns:
            True if conversion successful, False otherwise
        """
        try:
            system = platform.system()
            
            if system == "Windows":
                # Use docx2pdf on Windows (requires MS Word installed)
                from docx2pdf import convert
                convert(docx_path, pdf_path)
                
            elif system in ["Linux", "Darwin"]:  # Darwin = macOS
                # Use LibreOffice on Linux/Mac
                import subprocess
                subprocess.run([
                    'libreoffice',
                    '--headless',
                    '--convert-to', 'pdf',
                    '--outdir', os.path.dirname(pdf_path),
                    docx_path
                ], check=True)
                
                # LibreOffice creates file with same name as input
                # Need to rename if output path is different
                expected_output = os.path.join(
                    os.path.dirname(pdf_path),
                    os.path.splitext(os.path.basename(docx_path))[0] + '.pdf'
                )
                if expected_output != pdf_path and os.path.exists(expected_output):
                    os.rename(expected_output, pdf_path)
            else:
                raise Exception(f"Unsupported platform: {system}")
            
            # Verify output file was created
            if os.path.exists(pdf_path):
                print(f"✓ Word converted to PDF: {pdf_path}")
                return True
            else:
                print(f"✗ Conversion failed: Output file not created")
                return False
                
        except ImportError as e:
            print(f"✗ Missing dependency: {e}")
            print("On Windows: Install Microsoft Word")
            print("On Linux/Mac: Install LibreOffice (sudo apt install libreoffice)")
            return False
        except Exception as e:
            print(f"✗ Error converting Word to PDF: {e}")
            return False
    
    @staticmethod
    def validate_pdf(pdf_path: str) -> bool:
        """Validate that a file is a valid PDF"""
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            return page_count > 0
        except:
            return False
    
    @staticmethod
    def validate_docx(docx_path: str) -> bool:
        """Validate that a file is a valid DOCX"""
        try:
            from docx import Document
            doc = Document(docx_path)
            return len(doc.paragraphs) >= 0  # Even empty docs have 0 paragraphs
        except:
            return False
