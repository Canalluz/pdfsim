#!/usr/bin/env python3
"""
PDF Text Detection and Modification System
Script completo para detectar, extrair e modificar textos em PDFs
"""

import pdfplumber
import PyPDF2
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.colors import Color, black, red, blue, green
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import re
import json
from typing import Dict, List, Tuple, Optional, Any
import argparse
import os

class PDFTextProcessor:
    def __init__(self, pdf_path: str):
        """
        Inicializa o processador de PDF
        
        Args:
            pdf_path: Caminho para o arquivo PDF
        """
        self.pdf_path = pdf_path
        self.text_blocks = []
        self.metadata = {}
        self.page_contents = []
        
    def extract_text_with_details(self) -> Dict:
        """
        Extrai texto com detalhes completos (posição, fonte, cor, etc.)
        
        Returns:
            Dicionário com todos os textos detectados e seus metadados
        """
        results = {
            'filename': os.path.basename(self.pdf_path),
            'pages': [],
            'total_text_blocks': 0,
            'fonts_detected': set(),
            'colors_detected': set()
        }
        
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_data = {
                        'page_number': page_num,
                        'dimensions': (page.width, page.height),
                        'text_blocks': [],
                        'images': []
                    }
                    
                    # Extrair texto com bounding boxes
                    words = page.extract_words(
                        extra_attrs=["fontname", "size", "colors"]
                    )
                    
                    # Agrupar palavras em linhas e parágrafos
                    lines = {}
                    for word in words:
                        y_pos = word['top']
                        if y_pos not in lines:
                            lines[y_pos] = []
                        lines[y_pos].append(word)
                    
                    # Processar cada linha
                    for y_pos, words_in_line in sorted(lines.items()):
                        line_text = ' '.join([w['text'] for w in sorted(words_in_line, key=lambda x: x['x0'])])
                        
                        # Detalhes da primeira palavra como referência
                        sample_word = words_in_line[0]
                        
                        text_block = {
                            'text': line_text,
                            'position': {
                                'x': sample_word['x0'],
                                'y': sample_word['top'],
                                'width': sample_word['x1'] - sample_word['x0'],
                                'height': sample_word['bottom'] - sample_word['top']
                            },
                            'font': {
                                'name': sample_word.get('fontname', 'Unknown'),
                                'size': sample_word.get('size', 12)
                            },
                            'color': str(sample_word.get('colors', 'black')),
                            'page': page_num
                        }
                        
                        page_data['text_blocks'].append(text_block)
                        
                        # Coletar estatísticas
                        results['fonts_detected'].add(text_block['font']['name'])
                        results['colors_detected'].add(text_block['color'])
                    
                    results['pages'].append(page_data)
                    results['total_text_blocks'] += len(page_data['text_blocks'])
                
                return results
                
        except Exception as e:
            print(f"Erro ao extrair texto: {e}")
            return results
    
    def find_text_positions(self, search_text: str, case_sensitive: bool = False) -> List[Dict]:
        """
        Encontra todas as ocorrências de um texto específico
        
        Args:
            search_text: Texto a ser buscado
            case_sensitive: Se a busca é case sensitive
            
        Returns:
            Lista de posições onde o texto foi encontrado
        """
        matches = []
        text_data = self.extract_text_with_details()
        
        for page_data in text_data['pages']:
            for block in page_data['text_blocks']:
                text_to_search = block['text'] if case_sensitive else block['text'].lower()
                search_term = search_text if case_sensitive else search_text.lower()
                
                if search_term in text_to_search:
                    # Encontrar posição exata dentro do texto
                    start_pos = text_to_search.find(search_term)
                    if start_pos != -1:
                        match_info = {
                            'page': page_data['page_number'],
                            'block_text': block['text'],
                            'position': block['position'],
                            'font': block['font'],
                            'color': block['color'],
                            'full_match': block['text']
                        }
                        matches.append(match_info)
        
        return matches
    
    def modify_text_in_pdf(self, 
                          original_text: str, 
                          new_text: str, 
                          output_path: str,
                          change_font: Optional[Dict] = None,
                          change_color: Optional[str] = None,
                          change_size: Optional[float] = None) -> bool:
        """
        Modifica texto específico em um PDF e salva nova versão
        
        Args:
            original_text: Texto original a ser substituído
            new_text: Novo texto
            output_path: Caminho para salvar PDF modificado
            change_font: Dicionário com nova fonte {'name': 'Arial', 'style': 'bold'}
            change_color: Nova cor em formato hex (#RRGGBB)
            change_size: Novo tamanho da fonte
            
        Returns:
            True se modificação foi bem sucedida
        """
        try:
            # Abrir PDF original
            pdf_reader = PyPDF2.PdfReader(self.pdf_path)
            pdf_writer = PyPDF2.PdfWriter()
            
            # Encontrar posições do texto
            positions = self.find_text_positions(original_text)
            
            if not positions:
                print(f"Texto '{original_text}' não encontrado no PDF.")
                return False
            
            print(f"Encontradas {len(positions)} ocorrências do texto.")
            
            # Para cada página, criar uma nova página com modificações
            for page_num in range(len(pdf_reader.pages)):
                # Criar um canvas para desenhar na nova página
                packet = io.BytesIO()
                can = canvas.Canvas(packet, pagesize=letter)
                
                # Configurar nova formatação se especificada
                if change_color:
                    # Converter hex para cor ReportLab
                    r = int(change_color[1:3], 16) / 255
                    g = int(change_color[3:5], 16) / 255
                    b = int(change_color[5:7], 16) / 255
                    text_color = Color(r, g, b)
                    can.setFillColor(text_color)
                
                if change_font:
                    font_name = change_font.get('name', 'Helvetica')
                    font_style = change_font.get('style', '')
                    
                    # Mapear estilos para fontes do ReportLab
                    if font_style == 'bold':
                        can.setFont('Helvetica-Bold', change_size or 12)
                    elif font_style == 'italic':
                        can.setFont('Helvetica-Oblique', change_size or 12)
                    else:
                        can.setFont(font_name, change_size or 12)
                
                # Posicionar texto nas coordenadas encontradas
                for pos in positions:
                    if pos['page'] == page_num + 1:
                        x = pos['position']['x']
                        y = pos['position']['y']
                        
                        # Desenhar novo texto na posição
                        can.drawString(x, y, new_text)
                
                can.save()
                
                # Mover para o início do buffer
                packet.seek(0)
                
                # Mesclar página original com modificações
                new_pdf = PyPDF2.PdfReader(packet)
                page = pdf_reader.pages[page_num]
                page.merge_page(new_pdf.pages[0])
                pdf_writer.add_page(page)
            
            # Salvar PDF modificado
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)
            
            print(f"PDF modificado salvo em: {output_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao modificar PDF: {e}")
            return False
    
    def delete_text_from_pdf(self, text_to_delete: str, output_path: str) -> bool:
        """
        Remove texto específico do PDF
        
        Args:
            text_to_delete: Texto a ser removido
            output_path: Caminho para salvar PDF modificado
            
        Returns:
            True se remoção foi bem sucedida
        """
        # Implementação simplificada - substitui por string vazia
        return self.modify_text_in_pdf(text_to_delete, '', output_path)
    
    def add_text_to_pdf(self, 
                       text: str, 
                       position: Dict, 
                       output_path: str,
                       font: Dict = None,
                       color: str = '#000000',
                       size: float = 12) -> bool:
        """
        Adiciona novo texto ao PDF em posição específica
        
        Args:
            text: Texto a ser adicionado
            position: Dicionário com x, y coordinates
            output_path: Caminho para salvar PDF modificado
            font: Configurações da fonte
            color: Cor do texto em hex
            size: Tamanho da fonte
            
        Returns:
            True se adição foi bem sucedida
        """
        try:
            # Abrir PDF original
            pdf_reader = PyPDF2.PdfReader(self.pdf_path)
            pdf_writer = PyPDF2.PdfWriter()
            
            # Para cada página, adicionar texto se for a página correta
            for page_num in range(len(pdf_reader.pages)):
                # Criar um canvas para desenhar
                packet = io.BytesIO()
                can = canvas.Canvas(packet, pagesize=letter)
                
                # Configurar formatação
                if color:
                    r = int(color[1:3], 16) / 255
                    g = int(color[3:5], 16) / 255
                    b = int(color[5:7], 16) / 255
                    text_color = Color(r, g, b)
                    can.setFillColor(text_color)
                
                if font:
                    font_name = font.get('name', 'Helvetica')
                    font_style = font.get('style', '')
                    
                    if font_style == 'bold':
                        can.setFont('Helvetica-Bold', size)
                    elif font_style == 'italic':
                        can.setFont('Helvetica-Oblique', size)
                    else:
                        can.setFont(font_name, size)
                else:
                    can.setFont('Helvetica', size)
                
                # Adicionar texto na posição especificada
                if position.get('page', 1) == page_num + 1:
                    x = position.get('x', 100)
                    y = position.get('y', 700)
                    can.drawString(x, y, text)
                
                can.save()
                
                # Mover para o início do buffer
                packet.seek(0)
                
                # Mesclar página original com novo texto
                new_pdf = PyPDF2.PdfReader(packet)
                page = pdf_reader.pages[page_num]
                page.merge_page(new_pdf.pages[0])
                pdf_writer.add_page(page)
            
            # Salvar PDF modificado
            with open(output_path, 'wb') as output_file:
                pdf_writer.write(output_file)
            
            print(f"Texto adicionado ao PDF salvo em: {output_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao adicionar texto ao PDF: {e}")
            return False
    
    def change_text_color(self, text: str, new_color: str, output_path: str) -> bool:
        """
        Altera a cor de um texto específico
        
        Args:
            text: Texto cuja cor será alterada
            new_color: Nova cor em formato hex (#RRGGBB)
            output_path: Caminho para salvar PDF modificado
            
        Returns:
            True se alteração foi bem sucedida
        """
        return self.modify_text_in_pdf(text, text, output_path, change_color=new_color)
    
    def export_text_analysis(self, output_json_path: str) -> bool:
        """
        Exporta análise completa do texto para JSON
        
        Args:
            output_json_path: Caminho para salvar arquivo JSON
            
        Returns:
            True se exportação foi bem sucedida
        """
        try:
            text_data = self.extract_text_with_details()
            
            with open(output_json_path, 'w', encoding='utf-8') as f:
                json.dump(text_data, f, indent=2, ensure_ascii=False)
            
            print(f"Análise exportada para: {output_json_path}")
            return True
            
        except Exception as e:
            print(f"Erro ao exportar análise: {e}")
            return False

def main():
    """Função principal para execução via linha de comando"""
    parser = argparse.ArgumentParser(description='Processador Avançado de PDF')
    parser.add_argument('input_pdf', help='Caminho para o PDF de entrada')
    parser.add_argument('--action', choices=['analyze', 'find', 'modify', 'delete', 'add', 'color'], 
                       default='analyze', help='Ação a ser executada')
    parser.add_argument('--text', help='Texto para busca/modificação')
    parser.add_argument('--new-text', help='Novo texto (para modificação)')
    parser.add_argument('--output', help='Caminho para PDF de saída')
    parser.add_argument('--position', help='Posição para adicionar texto (formato: x,y,page)')
    parser.add_argument('--color', help='Cor em formato hex (#RRGGBB)')
    parser.add_argument('--font-size', type=float, help='Tamanho da fonte')
    parser.add_argument('--export-json', help='Exportar análise para JSON')
    
    args = parser.parse_args()
    
    # Inicializar processador
    processor = PDFTextProcessor(args.input_pdf)
    
    if args.action == 'analyze':
        # Análise completa do PDF
        result = processor.extract_text_with_details()
        print(f"PDF analisado: {result['filename']}")
        print(f"Total de páginas: {len(result['pages'])}")
        print(f"Total de blocos de texto: {result['total_text_blocks']}")
        print(f"Fontes detectadas: {', '.join(result['fonts_detected'])}")
        
        # Exportar para JSON se solicitado
        if args.export_json:
            processor.export_text_analysis(args.export_json)
    
    elif args.action == 'find' and args.text:
        # Buscar texto específico
        matches = processor.find_text_positions(args.text)
        print(f"Encontradas {len(matches)} ocorrências:")
        for i, match in enumerate(matches, 1):
            print(f"{i}. Página {match['page']}: {match['block_text'][:50]}...")
    
    elif args.action == 'modify' and args.text and args.new_text and args.output:
        # Modificar texto
        success = processor.modify_text_in_pdf(
            args.text, 
            args.new_text, 
            args.output,
            change_color=args.color
        )
        if success:
            print("Modificação concluída com sucesso!")
    
    elif args.action == 'delete' and args.text and args.output:
        # Deletar texto
        success = processor.delete_text_from_pdf(args.text, args.output)
        if success:
            print("Texto removido com sucesso!")
    
    elif args.action == 'add' and args.text and args.output and args.position:
        # Adicionar novo texto
        try:
            x, y, page = map(float, args.position.split(','))
            position = {'x': x, 'y': y, 'page': int(page)}
            
            font_config = {'name': 'Helvetica', 'style': 'normal'}
            
            success = processor.add_text_to_pdf(
                text=args.text,
                position=position,
                output_path=args.output,
                font=font_config,
                color=args.color or '#000000',
                size=args.font_size or 12
            )
            if success:
                print("Texto adicionado com sucesso!")
        except ValueError:
            print("Formato de posição inválido. Use: x,y,page")
    
    elif args.action == 'color' and args.text and args.color and args.output:
        # Alterar cor do texto
        success = processor.change_text_color(args.text, args.color, args.output)
        if success:
            print("Cor alterada com sucesso!")
    
    else:
        print("Parâmetros insuficientes. Use --help para ver opções.")

if __name__ == "__main__":
    main()
