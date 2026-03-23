import fitz  # PyMuPDF
import os
from typing import Dict, List, Optional, Any
import datetime
import tempfile
import time
import traceback

class AdvancedPDFEditor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)

    def _log(self, message: str):
        """Writes logs to a high-visibility file and prints to stdout."""
        try:
            # Absolute path in project root for local env, fallback for others
            log_dir = r"c:\Users\User\Documents\APP SOFTWARE\APLICATIVOS PRONTOS\PDFSIM"
            if os.path.exists(log_dir):
                log_path = os.path.join(log_dir, "backend_debug.log")
            else:
                log_path = "backend_debug.log" # Relative fallback
            
            timestamp = datetime.datetime.now().strftime("%H:%M:%S")
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(f"[{timestamp}] {message}\n")
        except:
            pass
        print(f"B_LOG: {message}", flush=True)

    def _normalize_color(self, color: Any) -> tuple:
        """Converts various color formats (int, list, etc) to normalized RGB (R, G, B) [0,1]."""
        try:
            if isinstance(color, int):
                r = (color >> 16) & 255
                g = (color >> 8) & 255
                b = color & 255
                return (r / 255.0, g / 255.0, b / 255.0)
            elif isinstance(color, (list, tuple)):
                if len(color) == 3:
                    if all(isinstance(c, float) and 0 <= c <= 1.0 for c in color):
                        return tuple(color)
                    return tuple(float(c) / 255.0 for c in color)
            return (0, 0, 0)
        except:
            return (0, 0, 0)

    def _safe_save(self, output_path: Optional[str] = None) -> bool:
        """Robustly saves using atomic temporary file strategy."""
        temp_path = None
        try:
            target_path = os.path.abspath(output_path or self.pdf_path)
            self._log(f"SAVING: {target_path}")
            
            target_dir = os.path.dirname(target_path)
            if not os.path.exists(target_dir):
                os.makedirs(target_dir, exist_ok=True)
                
            fd, temp_path = tempfile.mkstemp(dir=target_dir, suffix=".pdf")
            os.close(fd)
            
            self.doc.save(temp_path, garbage=3, deflate=True, clean=True)
            self.doc.close()
            
            success = False
            for attempt in range(10):
                try:
                    if os.path.exists(target_path):
                        try: os.remove(target_path)
                        except: pass
                    os.rename(temp_path, target_path)
                    success = True
                    break
                except Exception as e:
                    self._log(f"ATT {attempt+1} FAIL: {e}")
                    time.sleep(0.5)
            
            if not success:
                raise Exception("Max attempts reached for file replace.")
            
            self.doc = fitz.open(target_path)
            return True
        except Exception as e:
            self._log(f"SAVE ERROR: {e}")
            if temp_path and os.path.exists(temp_path):
                try: os.remove(temp_path)
                except: pass
            try:
                if not self.doc or self.doc.is_closed:
                    self.doc = fitz.open(self.pdf_path)
            except: pass
            return False

    def extract_text(self) -> Dict:
        """Extracts text blocks with metadata for font preservation."""
        result = {"pages": [], "fonts": {}}
        for page_num, page in enumerate(self.doc):
            page_data = {
                "page": page_num + 1,
                "width": page.rect.width,
                "height": page.rect.height,
                "blocks": []
            }
            page_fonts = page.get_fonts()
            font_map = {f[3]: {"id": f[0], "ext": f[1], "type": f[2]} for f in page_fonts}

            blocks = page.get_text("dict")["blocks"]
            for block in blocks:
                if block["type"] == 0:
                    for line in block["lines"]:
                        for span in line["spans"]:
                            font_name = span["font"]
                            font_info = font_map.get(font_name, {})
                            page_data["blocks"].append({
                                "text": span["text"],
                                "bbox": span["bbox"],
                                "font": font_name,
                                "font_id": font_info.get("id"),
                                "size": span["size"],
                                "color": span["color"],
                                "origin": span["origin"],
                                "is_subset": "+" in font_name,
                                "flags": span.get("flags", 0)
                            })
                            if font_name not in result["fonts"] and font_info.get("id"):
                                result["fonts"][font_name] = {
                                    "object_id": font_info["id"],
                                    "type": font_info["type"]
                                }
            result["pages"].append(page_data)
        return result

    def replace_text(self, old_text: str, new_text: str, output_path: Optional[str] = None) -> bool:
        """Replaces exact text occurrences visually."""
        try:
            for page in self.doc:
                hits = page.search_for(old_text)
                for rect in hits:
                    page.add_redact_annot(rect)
                page.apply_redactions()
            return self._safe_save(output_path)
        except Exception as e:
            self._log(f"REPLACE ERR: {e}")
            return False

    def edit_text_at_rect(self, page_num: int, rect: list, new_text: str, font_name: str = "helv", font_size: float = 11, color: Any = (0, 0, 0), origin: Optional[list] = None, output_path: Optional[str] = None) -> bool:
        """Precisely replaces text at a specific rectangle."""
        self._log(f"EDIT REQ - PG {page_num} RECT {rect}")
        try:
            if 0 <= page_num - 1 < len(self.doc):
                page = self.doc[page_num - 1]
                target_rect = fitz.Rect(rect)
                
                # 1. Redact
                page.add_redact_annot(target_rect)
                page.apply_redactions()
                
                # 2. Insert
                insertion_point = origin if origin else (target_rect.x0, target_rect.y1 - 2)
                fitz_font = "helv"
                fn_lower = font_name.lower()
                if "bold" in fn_lower and "italic" in fn_lower: fitz_font = "bi"
                elif "bold" in fn_lower: fitz_font = "hebo"
                elif "italic" in fn_lower: fitz_font = "heit"
                elif "times" in fn_lower: fitz_font = "tiro"
                elif "courier" in fn_lower: fitz_font = "cour"
                
                rgb_color = self._normalize_color(color)
                self._log(f"INSERT: '{new_text}' Color: {rgb_color}")
                
                page.insert_text(insertion_point, new_text, fontname=fitz_font, fontsize=font_size, color=rgb_color)
                
                # 3. Save
                return self._safe_save(output_path)
            self._log(f"PAGE {page_num} OUT OF RANGE")
            return False
        except Exception as e:
            self._log(f"EDIT ERR: {e}")
            self._log(traceback.format_exc())
            return False

    def delete_text_at_rect(self, page_num: int, rect: list, output_path: Optional[str] = None) -> bool:
        """Deletes text within a specific rectangle."""
        try:
            if 0 <= page_num - 1 < len(self.doc):
                page = self.doc[page_num - 1]
                page.add_redact_annot(fitz.Rect(rect))
                page.apply_redactions()
                return self._safe_save(output_path)
            return False
        except Exception as e:
            self._log(f"DEL ERR: {e}")
            return False

    def add_text(self, page_num: int, text: str, x: float, y: float, font_size: float = 12, output_path: Optional[str] = None) -> bool:
        """Adds new text at position."""
        try:
            if 0 <= page_num - 1 < len(self.doc):
                page = self.doc[page_num - 1]
                page.insert_text((x, y), text, fontsize=font_size, fontname="helv", color=(0, 0, 0))
                return self._safe_save(output_path)
            return False
        except Exception as e:
            self._log(f"ADD ERR: {e}")
            return False

    def close(self):
        if self.doc and not self.doc.is_closed:
            self.doc.close()
