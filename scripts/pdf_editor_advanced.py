#!/usr/bin/env python3
"""
PDF Text Editor Avançado - Edição Direta de PDFs
Solução para editar texto sem converter em imagem
"""

import fitz  # PyMuPDF - para edição real de PDFs
import pdfplumber
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import Color, HexColor
import io
import json
import os
import re
from typing import Dict, List, Optional, Tuple
import argparse

class AdvancedPDFEditor:
    def __init__(self, pdf_path: str):
        """
        Inicializa o editor de PDF
        
        Args:
            pdf_path: Caminho para o arquivo PDF
        """
        self.pdf_path = pdf_path
        self.doc = fitz.open(pdf_path)
        self.text_blocks = []
        
    def extract_text_with_precision(self) -> List[Dict]:
        """
        Extrai texto com precisão usando PyMuPDF (fitz)
        Mantém informações detalhadas de formatação
        """
        text_blocks = []
        
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            
            # Extrair texto com detalhes
            blocks = page.get_text("dict")["blocks"]
            
            for block in blocks:
                if block["type"] == 0:  # Text block
                    for line in block["lines"]:
                        for span in line["spans"]:
                            text_info = {
                                "page": page_num + 1,
                                "text": span["text"],
                                "bbox": span["bbox"],  # [x0, y0, x1, y1]
                                "font": span["font"],
                                "size": span["size"],
                                "color": span["color"],
                                "flags": span["flags"],  # bold, italic, etc.
                                "origin": span["origin"]  # Posição exata
                            }
                            text_blocks.append(text_info)
        
        return text_blocks
    
    def find_text_exact(self, search_text: str) -> List[Dict]:
        """
        Encontra texto exato no PDF com todas as ocorrências
        
        Args:
            search_text: Texto a ser buscado
            
        Returns:
            Lista com todas as ocorrências encontradas
        """
        occurrences = []
        
        for page_num in range(len(self.doc)):
            page = self.doc[page_num]
            
            # Buscar texto na página
            text_instances = page.search_for(search_text)
            
            for inst in text_instances:
                occurrence = {
                    "page": page_num + 1,
                    "bbox": inst,  # Retângulo onde o texto está
                    "text": search_text,
                    "type": "exact_match"
                }
                occurrences.append(occurrence)
        
        return occurrences
    
    def replace_text_directly(self, old_text: str, new_text: str, 
                            output_path: Optional[str] = None,
                            font_name: Optional[str] = None,
                            font_size: Optional[float] = None,
                            text_color: Optional[str] = None) -> bool:
        """
        Substitui texto diretamente no PDF (preserva formatação)
        
        Args:
            old_text: Texto a ser substituído
            new_text: Novo texto
            output_path: Caminho para salvar (None para sobrescrever)
            font_name: Nome da fonte (opcional)
            font_size: Tamanho da fonte (opcional)
            text_color: Cor do texto em hex (opcional)
            
        Returns:
            True se sucesso, False se falha
        """
        try:
            # Clonar documento para edição
            doc = fitz.open(self.pdf_path)
            
            # Buscar todas as ocorrências do texto
            total_replacements = 0
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Encontrar todas as instâncias do texto
                text_instances = page.search_for(old_text)
                
                for inst in text_instances:
                    # Criar anotação para apagar texto antigo
                    rect = fitz.Rect(inst)
                    
                    # Apagar texto antigo
                    page.add_redact_annot(rect)
                    
                    # Calcular posição para novo texto
                    # Manter mesma posição básica
                    x0, y0, x1, y1 = inst
                    
                    # Adicionar novo texto
                    if font_name or font_size or text_color:
                        # Configurar atributos de texto personalizados
                        if text_color:
                            # Converter hex para RGB
                            if text_color.startswith('#'):
                                r = int(text_color[1:3], 16) / 255
                                g = int(text_color[3:5], 16) / 255
                                b = int(text_color[5:7], 16) / 255
                                color = (r, g, b)
                            else:
                                color = (0, 0, 0)  # Preto padrão
                        else:
                            color = (0, 0, 0)
                        
                        # Configurar fonte
                        fontsize = font_size or 11
                        fontname = font_name or "helv"
                        
                        # Inserir texto com formatação
                        page.insert_text(
                            point=(x0, y1 - 2),  # Posição ajustada
                            text=new_text,
                            fontsize=fontsize,
                            fontname=fontname,
                            color=color
                        )
                    
                    total_replacements += 1
                
                # Aplicar redações (apagar texto antigo)
                if text_instances:
                    page.apply_redactions()
            
            # Salvar documento
            save_path = output_path or self.pdf_path.replace('.pdf', '_modified.pdf')
            doc.save(save_path)
            doc.close()
            
            print(f"Texto substituído {total_replacements} vezes")
            print(f"Documento salvo em: {save_path}")
            
            return True
            
        except Exception as e:
            print(f"Erro ao substituir texto: {e}")
            return False
    
    def delete_text(self, text_to_delete: str, output_path: Optional[str] = None) -> bool:
        """
        Remove texto do PDF usando redação
        
        Args:
            text_to_delete: Texto a ser removido
            output_path: Caminho para salvar
            
        Returns:
            True se sucesso
        """
        try:
            doc = fitz.open(self.pdf_path)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_instances = page.search_for(text_to_delete)
                
                for inst in text_instances:
                    page.add_redact_annot(fitz.Rect(inst))
                
                if text_instances:
                    page.apply_redactions()
            
            save_path = output_path or self.pdf_path.replace('.pdf', '_cleaned.pdf')
            doc.save(save_path)
            doc.close()
            
            print(f"Texto removido. Documento salvo em: {save_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao remover texto: {e}")
            return False
    
    def add_text_with_formatting(self, text: str, position: Dict, 
                               output_path: Optional[str] = None,
                               font_name: str = "helv",
                               font_size: float = 11,
                               text_color: str = "#000000",
                               bold: bool = False,
                               italic: bool = False) -> bool:
        """
        Adiciona texto com formatação completa
        
        Args:
            text: Texto a adicionar
            position: {'x': x, 'y': y, 'page': page_num}
            output_path: Caminho para salvar
            font_name: Nome da fonte
            font_size: Tamanho da fonte
            text_color: Cor em hex
            bold: Negrito
            italic: Itálico
            
        Returns:
            True se sucesso
        """
        try:
            doc = fitz.open(self.pdf_path)
            
            # Converter cor hex para RGB
            if text_color.startswith('#'):
                r = int(text_color[1:3], 16) / 255
                g = int(text_color[3:5], 16) / 255
                b = int(text_color[5:7], 16) / 255
                color = (r, g, b)
            else:
                color = (0, 0, 0)  # Preto padrão
            
            # Determinar fonte baseada em bold/italic
            if bold and italic:
                fontname = "helv-bi"
            elif bold:
                fontname = "helv-b"
            elif italic:
                fontname = "helv-i"
            else:
                fontname = font_name
            
            # Página onde adicionar (ajustar para índice base 0)
            page_num = position.get('page', 1) - 1
            
            if 0 <= page_num < len(doc):
                page = doc[page_num]
                
                # Adicionar texto
                page.insert_text(
                    point=(position['x'], position['y']),
                    text=text,
                    fontsize=font_size,
                    fontname=fontname,
                    color=color
                )
            
            # Salvar
            save_path = output_path or self.pdf_path.replace('.pdf', '_with_text.pdf')
            doc.save(save_path)
            doc.close()
            
            print(f"Texto adicionado. Documento salvo em: {save_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao adicionar texto: {e}")
            return False
    
    def change_text_color(self, text: str, new_color: str, 
                        output_path: Optional[str] = None) -> bool:
        """
        Altera a cor de texto específico
        
        Args:
            text: Texto cuja cor será alterada
            new_color: Nova cor em hex
            output_path: Caminho para salvar
            
        Returns:
            True se sucesso
        """
        try:
            doc = fitz.open(self.pdf_path)
            
            # Converter cor
            if new_color.startswith('#'):
                r = int(new_color[1:3], 16) / 255
                g = int(new_color[3:5], 16) / 255
                b = int(new_color[5:7], 16) / 255
                color = (r, g, b)
            else:
                color = (0, 0, 0)
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_instances = page.search_for(text)
                
                for inst in text_instances:
                    x0, y0, x1, y1 = inst
                    
                    # Primeiro, apagar texto antigo
                    page.add_redact_annot(fitz.Rect(inst))
                    
                    # Extrair o texto real (pode ter variações)
                    # Usar a área de texto para obter conteúdo exato
                    text_area = page.get_textbox(inst)
                    
                    if text_area.strip():
                        # Adicionar texto com nova cor
                        page.insert_text(
                            point=(x0, y1 - 2),
                            text=text_area.strip(),
                            fontsize=11,  # Tamanho padrão, ajustável
                            color=color
                        )
                
                if text_instances:
                    page.apply_redactions()
            
            save_path = output_path or self.pdf_path.replace('.pdf', '_colored.pdf')
            doc.save(save_path)
            doc.close()
            
            print(f"Cores alteradas. Documento salvo em: {save_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao alterar cor: {e}")
            return False
    
    def highlight_text(self, text: str, color: str = "#FFFF00", 
                      output_path: Optional[str] = None) -> bool:
        """
        Destaca texto no PDF
        
        Args:
            text: Texto a destacar
            color: Cor do destaque em hex
            output_path: Caminho para salvar
            
        Returns:
            True se sucesso
        """
        try:
            doc = fitz.open(self.pdf_path)
            
            # Converter cor
            if color.startswith('#'):
                r = int(color[1:3], 16) / 255
                g = int(color[3:5], 16) / 255
                b = int(color[5:7], 16) / 255
                highlight_color = (r, g, b)
            else:
                highlight_color = (1, 1, 0)  # Amarelo padrão
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                text_instances = page.search_for(text)
                
                for inst in text_instances:
                    # Adicionar destaque
                    highlight = page.add_highlight_annot(inst)
                    highlight.set_colors(stroke=highlight_color)
                    highlight.update()
            
            save_path = output_path or self.pdf_path.replace('.pdf', '_highlighted.pdf')
            doc.save(save_path)
            doc.close()
            
            print(f"Texto destacado. Documento salvo em: {save_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao destacar texto: {e}")
            return False
    
    def extract_fonts_info(self) -> Dict:
        """
        Extrai informações sobre fontes usadas no PDF
        
        Returns:
            Dicionário com informações de fontes
        """
        fonts_info = {
            "total_fonts": 0,
            "fonts": [],
            "pages_analyzed": 0
        }
        
        try:
            for page_num in range(len(self.doc)):
                page = self.doc[page_num]
                fonts = page.get_fonts()
                
                for font in fonts:
                    font_info = {
                        "page": page_num + 1,
                        "name": font[3],  # Nome da fonte
                        "type": font[4],  # Tipo da fonte
                        "embedded": font[6]  # Se está embutida
                    }
                    fonts_info["fonts"].append(font_info)
                
                fonts_info["pages_analyzed"] += 1
            
            fonts_info["total_fonts"] = len(fonts_info["fonts"])
            return fonts_info
            
        except Exception as e:
            print(f"Erro ao extrair fontes: {e}")
            return fonts_info
    
    def export_analysis(self, output_json_path: str) -> bool:
        """
        Exporta análise completa do PDF para JSON
        
        Args:
            output_json_path: Caminho para salvar JSON
            
        Returns:
            True se sucesso
        """
        try:
            analysis = {
                "file": os.path.basename(self.pdf_path),
                "pages": len(self.doc),
                "text_blocks": self.extract_text_with_precision(),
                "fonts": self.extract_fonts_info(),
                "metadata": self.doc.metadata
            }
            
            with open(output_json_path, 'w', encoding='utf-8') as f:
                json.dump(analysis, f, indent=2, ensure_ascii=False)
            
            print(f"Análise exportada para: {output_json_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao exportar análise: {e}")
            return False
    
    def close(self):
        """Fecha o documento"""
        if self.doc:
            self.doc.close()

def create_sample_pdf() -> str:
    """
    Cria um PDF de exemplo para testes
    """
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.units import inch
    
    filename = "sample_document.pdf"
    
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Conteúdo do documento
    story = []
    
    # Título
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        textColor='#2E4053'
    )
    
    story.append(Paragraph("Documento de Teste para PDF Editor", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Subtítulo
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=18,
        spaceAfter=20,
        textColor='#3498DB'
    )
    
    story.append(Paragraph("Este é um subtítulo importante", subtitle_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Texto normal
    normal_text = """
    Este é um parágrafo de texto normal que contém informações importantes.
    Aqui temos um exemplo de texto que pode ser editado posteriormente.
    O texto inclui números como 12345 e datas como 25/12/2023.
    
    Podemos também incluir uma lista:
    • Item 1 da lista
    • Item 2 da lista
    • Item 3 da lista
    
    E também podemos ter um texto em <b>negrito</b> e em <i>itálico</i>.
    """
    
    story.append(Paragraph(normal_text, styles["Normal"]))
    story.append(Spacer(1, 0.3*inch))
    
    # Texto para busca e substituição
    searchable_text = """
    TEXTO_PARA_BUSCAR: Este texto será usado para testes de busca e substituição.
    Outro exemplo: CONTRATO entre as partes.
    Valor: R$ 1.000,00
    Data: 15/03/2024
    """
    
    story.append(Paragraph(searchable_text, styles["Normal"]))
    
    # Construir PDF
    doc.build(story)
    
    print(f"PDF de exemplo criado: {filename}")
    return filename

def main():
    """Função principal para linha de comando"""
    parser = argparse.ArgumentParser(
        description='Editor Avançado de PDF - Edição Direta de Textos',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  %(prog)s documento.pdf --analyze
  %(prog)s documento.pdf --find "texto a buscar"
  %(prog)s documento.pdf --replace "velho" "novo" --output modificado.pdf
  %(prog)s documento.pdf --add-text "Novo Texto" --page 1 --x 100 --y 700
  %(prog)s documento.pdf --delete "texto para deletar"
  %(prog)s documento.pdf --color "texto" "#FF0000"
        """
    )
    
    parser.add_argument('pdf_file', help='Arquivo PDF de entrada')
    
    # Ações principais
    action_group = parser.add_mutually_exclusive_group(required=True)
    action_group.add_argument('--analyze', action='store_true', 
                             help='Analisar PDF e extrair informações')
    action_group.add_argument('--find', metavar='TEXTO',
                             help='Buscar texto no PDF')
    action_group.add_argument('--replace', nargs=2, metavar=('VELHO', 'NOVO'),
                             help='Substituir texto')
    action_group.add_argument('--delete', metavar='TEXTO',
                             help='Deletar texto do PDF')
    action_group.add_argument('--add-text', metavar='TEXTO',
                             help='Adicionar texto ao PDF')
    action_group.add_argument('--color', nargs=2, metavar=('TEXTO', 'COR'),
                             help='Mudar cor do texto (ex: #FF0000)')
    action_group.add_argument('--highlight', nargs=2, metavar=('TEXTO', 'COR'),
                             help='Destacar texto (cor padrão: amarelo)')
    action_group.add_argument('--create-sample', action='store_true',
                             help='Criar PDF de exemplo para testes')
    
    # Opções adicionais
    parser.add_argument('--output', '-o', help='Arquivo de saída')
    parser.add_argument('--page', type=int, default=1, 
                       help='Número da página (para --add-text)')
    parser.add_argument('--x', type=float, default=100.0,
                       help='Coordenada X (para --add-text)')
    parser.add_argument('--y', type=float, default=700.0,
                       help='Coordenada Y (para --add-text)')
    parser.add_argument('--font-size', type=float, 
                       help='Tamanho da fonte (para --add-text ou --replace)')
    parser.add_argument('--font-name', default='helv',
                       help='Nome da fonte (para --add-text)')
    parser.add_argument('--export-json', metavar='ARQUIVO',
                       help='Exportar análise para JSON')
    parser.add_argument('--bold', action='store_true',
                       help='Texto em negrito (para --add-text)')
    parser.add_argument('--italic', action='store_true',
                       help='Texto em itálico (para --add-text)')
    
    args = parser.parse_args()
    
    # Criar PDF de exemplo se solicitado
    if args.create_sample:
        create_sample_pdf()
        return
    
    # Verificar se arquivo existe
    if not os.path.exists(args.pdf_file):
        print(f"Erro: Arquivo '{args.pdf_file}' não encontrado.")
        return
    
    # Inicializar editor
    editor = AdvancedPDFEditor(args.pdf_file)
    
    try:
        if args.analyze:
            # Análise do PDF
            print(f"Analisando: {args.pdf_file}")
            print(f"Total de páginas: {len(editor.doc)}")
            
            text_blocks = editor.extract_text_with_precision()
            print(f"Blocos de texto encontrados: {len(text_blocks)}")
            
            # Extrair fontes
            fonts_info = editor.extract_fonts_info()
            print(f"Fontes usadas: {fonts_info['total_fonts']}")
            
            # Exportar para JSON se solicitado
            if args.export_json:
                editor.export_analysis(args.export_json)
        
        elif args.find:
            # Buscar texto
            print(f"Buscando: '{args.find}'")
            occurrences = editor.find_text_exact(args.find)
            
            if occurrences:
                print(f"Encontradas {len(occurrences)} ocorrências:")
                for i, occ in enumerate(occurrences, 1):
                    print(f"  {i}. Página {occ['page']}: {occ['bbox']}")
            else:
                print("Nenhuma ocorrência encontrada.")
        
        elif args.replace:
            # Substituir texto
            old_text, new_text = args.replace
            print(f"Substituindo: '{old_text}' por '{new_text}'")
            
            success = editor.replace_text_directly(
                old_text, new_text, args.output,
                font_name=args.font_name,
                font_size=args.font_size
            )
            
            if success:
                print("Substituição concluída com sucesso!")
        
        elif args.delete:
            # Deletar texto
            print(f"Deletando: '{args.delete}'")
            success = editor.delete_text(args.delete, args.output)
            
            if success:
                print("Texto deletado com sucesso!")
        
        elif args.add_text:
            # Adicionar texto
            position = {
                'x': args.x,
                'y': args.y,
                'page': args.page
            }
            
            print(f"Adicionando texto na página {args.page}, posição ({args.x}, {args.y})")
            
            success = editor.add_text_with_formatting(
                args.add_text, position, args.output,
                font_name=args.font_name,
                font_size=args.font_size or 11,
                bold=args.bold,
                italic=args.italic
            )
            
            if success:
                print("Texto adicionado com sucesso!")
        
        elif args.color:
            # Mudar cor do texto
            text, color = args.color
            print(f"Mudando cor de '{text}' para {color}")
            
            success = editor.change_text_color(text, color, args.output)
            
            if success:
                print("Cor alterada com sucesso!")
        
        elif args.highlight:
            # Destacar texto
            text, color = args.highlight
            print(f"Destacando: '{text}' com cor {color}")
            
            success = editor.highlight_text(text, color, args.output)
            
            if success:
                print("Texto destacado com sucesso!")
    
    finally:
        # Fechar documento
        editor.close()

if __name__ == "__main__":
    main()
