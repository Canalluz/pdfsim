from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import stripe
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

# Stripe Configuration using Environment Variables
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "pdfsim-api-minimal", "mode": "payment-only"}), 200

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.json or {}
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
    pdf_base64 = data.get('pdfBase64')
    
    if not email or not pdf_base64:
        return jsonify({'error': 'Email and PDF content are required'}), 400
    
    smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', 587))
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_user or not smtp_password:
        return jsonify({'success': True, 'message': 'Simulação: Email não configurado no servidor.'})

    try:
        import smtplib
        from email.mime.multipart import MIMEMultipart
        from email.mime.base import MIMEBase
        from email.mime.text import MIMEText
        from email import encoders
        import base64

        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = email
        msg['Subject'] = 'Seu Currículo Inteligente - PDF Sim'
        msg.attach(MIMEText("Olá! Aqui está o seu currículo gerado no PDF Sim.", 'plain'))

        if 'base64,' in pdf_base64:
            pdf_base64 = pdf_base64.split('base64,')[1]
        pdf_data = base64.b64decode(pdf_base64)
        
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(pdf_data)
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', "attachment; filename=curriculo.pdf")
        msg.attach(part)

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
        server.quit()
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Minimal Backend Server on port 5000...")
    app.run(debug=True, port=5000)
