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
        if not stripe.api_key:
            print("Error: STRIPE_SECRET_KEY is not set in environment variables.")
            return jsonify(error="Configuração do Stripe ausente no servidor."), 500

        print(f"Creating checkout session with key: {stripe.api_key[:10]}...")
        
        try:
            # Try automatic payment methods first (Preferred)
            checkout_session = stripe.checkout.Session.create(
                automatic_payment_methods={'enabled': True},
                line_items=[
                    {
                        'price_data': {
                            'currency': 'brl',
                            'product_data': {
                                'name': 'Exportação PDF Premium',
                            },
                            'unit_amount': 1000, # R$ 10,00
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                billing_address_collection='required',
                shipping_address_collection={
                    'allowed_countries': ['BR'],
                },
                locale='pt-BR',
                success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/?payment_success=true",
                cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/?payment_canceled=true",
            )
        except stripe.error.InvalidRequestError as e:
            error_msg = str(e)
            print(f"Automatic methods failed: {error_msg}. Falling back to manual configuration.")
            
            # Fallback for older API versions or restricted accounts
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'brl',
                            'product_data': {
                                'name': 'Exportação PDF Premium',
                            },
                            'unit_amount': 1000, # R$ 10,00
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                billing_address_collection='required',
                shipping_address_collection={
                    'allowed_countries': ['BR'],
                },
                locale='pt-BR',
                success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/?payment_success=true",
                cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/?payment_canceled=true",
            )

        print(f"Session created: {checkout_session.id}")
        return jsonify({'id': checkout_session.id, 'url': checkout_session.url})
    except Exception as e:
        print(f"Error creating checkout session: {str(e)}")
        return jsonify(error=str(e)), 403

if __name__ == '__main__':
    print("Starting Minimal Backend Server on port 5000...")
    app.run(debug=True, port=5000)
