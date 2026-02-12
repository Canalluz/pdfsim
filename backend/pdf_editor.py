import fitz  # PyMuPDF
import os
from typing import Dict, List, Optional

class AdvancedPDFEditor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)

    def extract_text(self) -> Dict:
        """Extracts text blocks and page metadata."""
        result = {
            "pages": []
        }
        
        for page_num, page in enumerate(self.doc):
            page_data = {
                "page": page_num + 1,
                "width": page.rect.width,
                "height": page.rect.height,
                "blocks": []
            }
            
            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if block["type"] == 0:  # Text block
                    for line in block["lines"]:
                        for span in line["spans"]:
                            page_data["blocks"].append({
                                "text": span["text"],
                                "x": span["bbox"][0],
                                "y": span["bbox"][1], # PDF uses top-left origin? No, PyMuPDF get_text("dict") bbox is usually (x0, y0, x1, y1) relative to top-left of page rect if default.
                                "width": span["bbox"][2] - span["bbox"][0],
                                "height": span["bbox"][3] - span["bbox"][1],
                                "font": span["font"],
                                "size": span["size"],
                                "color": span["color"],
                                "origin": span["origin"]
                            })
            result["pages"].append(page_data)
            
        return result

    def replace_text(self, old_text: str, new_text: str, output_path: str = None) -> bool:
        """Replaces exact text occurrences visually."""
        try:
            for page in self.doc:
                hits = page.search_for(old_text)
                for rect in hits:
                    page.add_redact_annot(rect, text=new_text, fontsize=11, fontname="helv", cross_on=False)
                    # Note: simple redaction might not place new text exactly as we want if we want font matching.
                    # A better approach for "editing":
                    # 1. Redact (erase) old area
                    # 2. Insert new text at same position
                page.apply_redactions()
            
            save_path = output_path or self.pdf_path
            self.doc.save(save_path)
            return True
        except Exception as e:
            print(f"Error replacing text: {e}")
            return False
            
    def delete_text_at_rect(self, page_num: int, rect: list, output_path: str = None) -> bool:
        """Deletes text within a specific rectangle (useful for UI-driven deletion)."""
        try:
            if 0 <= page_num - 1 < len(self.doc):
                page = self.doc[page_num - 1]
                # rect is [x0, y0, x1, y1]
                page.add_redact_annot(fitz.Rect(rect))
                page.apply_redactions()
                
                save_path = output_path or self.pdf_path
                self.doc.save(save_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting text: {e}")
            return False

    def add_text(self, page_num: int, text: str, x: float, y: float, font_size: float = 12, output_path: str = None):
        """Adds new text at position."""
        try:
            if 0 <= page_num - 1 < len(self.doc):
                page = self.doc[page_num - 1]
                page.insert_text((x, y), text, fontsize=font_size, fontname="helv", color=(0, 0, 0))
                
                save_path = output_path or self.pdf_path
                self.doc.save(save_path)
                return True
            return False
        except Exception as e:
            print(f"Error adding text: {e}")
            return False

    def close(self):
        if self.doc:
            self.doc.close()
