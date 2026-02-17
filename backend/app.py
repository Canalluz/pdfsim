from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
from pdf_editor import AdvancedPDFEditor
from word_converter import WordConverter

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

UPLOAD_FOLDER = 'uploads'
WORD_FOLDER = 'word_files'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(WORD_FOLDER):
    os.makedirs(WORD_FOLDER)

# Store active editors in memory (simple session management for MVP)
# In production, use Redis or database
editors = {}

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "pdfsim-api"}), 200

@app.route('/upload', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    filename = str(uuid.uuid4()) + '.pdf'
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Initialize editor
    editor = AdvancedPDFEditor(filepath)
    editors[filename] = editor
    
    # Extract initial analysis
    extraction_result = editor.extract_text()
    editor.close() 
    
    return jsonify({
        'sessionId': filename,
        'pages': extraction_result['pages']
    })

@app.route('/edit/replace', methods=['POST'])
def replace_text():
    data = request.json
    session_id = data.get('sessionId')
    old_text = data.get('oldText')
    new_text = data.get('newText')
    
    if not session_id or not old_text:
        return jsonify({'error': 'Missing parameters'}), 400
        
    filepath = os.path.join(UPLOAD_FOLDER, session_id)
    if not os.path.exists(filepath):
        return jsonify({'error': 'Session expired or invalid'}), 404
        
    editor = AdvancedPDFEditor(filepath)
    success = editor.replace_text(old_text, new_text)
    editor.close()
    
    return jsonify({'success': success})

@app.route('/download/<session_id>', methods=['GET'])
def download_pdf(session_id):
    filepath = os.path.join(UPLOAD_FOLDER, session_id)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True, download_name='edited_document.pdf')

@app.route('/convert/pdf-to-word', methods=['POST'])
def convert_pdf_to_word():
    """Convert PDF to Word format for editing"""
    data = request.json
    session_id = data.get('sessionId')
    
    if not session_id:
        return jsonify({'error': 'Missing sessionId'}), 400
    
    pdf_path = os.path.join(UPLOAD_FOLDER, session_id)
    if not os.path.exists(pdf_path):
        return jsonify({'error': 'PDF file not found'}), 404
    
    # Generate unique filename for Word document
    word_filename = f"{os.path.splitext(session_id)[0]}.docx"
    word_path = os.path.join(WORD_FOLDER, word_filename)
    
    # Convert PDF to Word
    converter = WordConverter()
    success = converter.pdf_to_word(pdf_path, word_path)
    
    if not success:
        return jsonify({'error': 'Conversion failed'}), 500
    
    # Return the Word file for download
    return send_file(
        word_path,
        as_attachment=True,
        download_name='documento_editavel.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

@app.route('/convert/word-to-pdf', methods=['POST'])
def convert_word_to_pdf():
    """Convert edited Word document back to PDF"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if not file.filename.endswith('.docx'):
        return jsonify({'error': 'File must be .docx format'}), 400
    
    # Save uploaded Word file
    word_filename = str(uuid.uuid4()) + '.docx'
    word_path = os.path.join(WORD_FOLDER, word_filename)
    file.save(word_path)
    
    # Convert Word to PDF
    pdf_filename = str(uuid.uuid4()) + '.pdf'
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
    
    converter = WordConverter()
    success = converter.word_to_pdf(word_path, pdf_path)
    
    if not success:
        return jsonify({'error': 'Conversion failed'}), 500
    
    # Extract text from converted PDF for editing
    editor = AdvancedPDFEditor(pdf_path)
    extraction_result = editor.extract_text()
    editor.close()
    
    return jsonify({
        'sessionId': pdf_filename,
        'pages': extraction_result['pages']
    })

@app.route('/download/word/<session_id>', methods=['GET'])
def download_word(session_id):
    """Download Word file associated with session"""
    word_filename = f"{os.path.splitext(session_id)[0]}.docx"
    word_path = os.path.join(WORD_FOLDER, word_filename)
    
    if not os.path.exists(word_path):
        return jsonify({'error': 'Word file not found'}), 404
    
    return send_file(
        word_path,
        as_attachment=True,
        download_name='documento_editavel.docx',
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

@app.route('/render-page', methods=['POST'])
def render_page():
    """Render PDF page as high-quality image for background"""
    data = request.json
    session_id = data.get('sessionId')
    page_num = data.get('pageNumber', 1)
    dpi = data.get('dpi', 150)  # Higher DPI = better quality
    
    if not session_id:
        return jsonify({'error': 'Missing sessionId'}), 400
    
    pdf_path = os.path.join(UPLOAD_FOLDER, session_id)
    if not os.path.exists(pdf_path):
        return jsonify({'error': 'PDF not found'}), 404
    
    try:
        import fitz  # PyMuPDF
        import base64
        
        # Open PDF
        doc = fitz.open(pdf_path)
        
        # Validate page number
        if page_num < 1 or page_num > len(doc):
            doc.close()
            return jsonify({'error': f'Invalid page number. PDF has {len(doc)} pages'}), 400
        
        # Get page
        page = doc[page_num - 1]
        
        # Render at specified DPI (higher = better quality)
        mat = fitz.Matrix(dpi/72, dpi/72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        # Convert to PNG bytes
        img_bytes = pix.tobytes("png")
        
        # Encode as base64
        img_base64 = base64.b64encode(img_bytes).decode('utf-8')
        
        # Get dimensions
        width = pix.width
        height = pix.height
        
        doc.close()
        
        return jsonify({
            'image': f'data:image/png;base64,{img_base64}',
            'width': width,
            'height': height,
            'pageNumber': page_num
        })
        
    except Exception as e:
        print(f'Error rendering page: {e}')
        return jsonify({'error': f'Failed to render page: {str(e)}'}), 500

import stripe
from dotenv import load_dotenv

load_dotenv()

# Stripe Configuration using Environment Variables
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    data = request.json or {}
    try:
        if not stripe.api_key:
            print("Error: STRIPE_SECRET_KEY is not set in environment variables.")
            return jsonify(error="Configuração do Stripe ausente no servidor."), 500

        email = data.get('email') or None  # Ensure empty string becomes None
        origin = data.get('origin', os.getenv('FRONTEND_URL', 'http://localhost:5173'))
        
        # Validate origin
        if not origin or not origin.startswith(('http://', 'https://')):
            return jsonify(error="Origem inválida."), 400

        print(f"Creating checkout session (Email: {email}, Origin: {origin})")
        
        # Build common session parameters
        session_params = {
            'line_items': [
                {
                    'price_data': {
                        'currency': 'brl',
                        'product_data': {
                            'name': 'Exportação PDF Premium',
                        },
                        'unit_amount': 1000,  # R$ 10,00
                    },
                    'quantity': 1,
                },
            ],
            'mode': 'payment',
            'locale': 'pt-BR',
            'success_url': f"{origin}/?payment_success=true",
            'cancel_url': f"{origin}/?payment_canceled=true",
        }
        
        # Only include customer_email if we have a valid email
        if email:
            session_params['customer_email'] = email
        
        try:
            # Try automatic payment methods first (Preferred)
            checkout_session = stripe.checkout.Session.create(
                automatic_payment_methods={'enabled': True},
                **session_params
            )
        except stripe.error.InvalidRequestError as e:
            error_msg = str(e)
            print(f"Automatic methods failed: {error_msg}. Falling back to card only.")
            
            # Fallback for older API versions or restricted accounts
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                **session_params
            )

        print(f"Session created: {checkout_session.id}")
        return jsonify({'id': checkout_session.id, 'url': checkout_session.url})
    except stripe.error.StripeError as e:
        print(f"Stripe error: {str(e)}")
        return jsonify(error=f"Erro do Stripe: {str(e)}"), 500
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        return jsonify(error=str(e)), 500

@app.route('/send-pdf-email', methods=['POST'])
def send_pdf_email():
    """Send generated PDF via email"""
    data = request.json
    email = data.get('email')
    pdf_base64 = data.get('pdfBase64') # Full data URL or just base64
    
    if not email or not pdf_base64:
        return jsonify({'error': 'Email and PDF content are required'}), 400
    
    # Email Configuration from Env
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        print("Warning: SMTP credentials not configured. Skipping email send.")
        return jsonify({'success': True, 'message': 'Simulação: Email não configurado no servidor.'})

    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.base import MIMEBase
        from email.mime.text import MIMEText
        from email import encoders
        import base64

        # Prepare message
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = email
        msg['Subject'] = 'Seu Currículo Inteligente - PDF Sim'
        
        body = "Olá! Conforme solicitado, aqui está o seu currículo gerado no PDF Sim.\n\nObrigado por usar nossos serviços!"
        msg.attach(MIMEText(body, 'plain'))

        # Process PDF attachment
        if 'base64,' in pdf_base64:
            pdf_base64 = pdf_base64.split('base64,')[1]
        
        pdf_data = base64.b64decode(pdf_base64)
        
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(pdf_data)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f"attachment; filename=curriculo.pdf")
        msg.attach(part)

        # Connect and send
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        
        print(f"Email sent successfully to {email}")
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': f"Erro ao enviar email: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
