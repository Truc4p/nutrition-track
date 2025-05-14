import lmstudio as lms
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def initialize_model():
    try:
        logger.info("Initializing LMStudio model...")
        model = lms.llm("qwen2.5-0.5b-instruct-mlx")
        logger.info("Model initialized successfully")
        return model
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to initialize LMStudio model: {error_msg}")
        logger.error(traceback.format_exc())
        logger.error("\nPlease make sure:")
        logger.error("1. LMStudio application is installed and running")
        logger.error("2. The qwen2.5-0.5b-instruct-mlx model is selected")
        logger.error("3. The local server is started in LMStudio")
        sys.exit(1)

# Initialize the model
model = initialize_model()

@app.route('/chat', methods=['POST'])
def chat():
    try:
        logger.info("Received chat request")
        data = request.get_json()
        if not data:
            logger.warning("No JSON data received")
            return jsonify({'error': 'No input data provided'}), 400
            
        user_message = data.get('message', '')
        if not user_message:
            logger.warning("No message field in request")
            return jsonify({'error': 'No message provided'}), 400
            
        logger.info(f"Processing message: {user_message}")
        
        # Create a nutrition-focused prompt
        prompt = f"""You are a helpful nutrition assistant. Please provide accurate and helpful nutrition advice.
        User's message: {user_message}
        Please respond with relevant nutrition information and advice."""
        
        # Get response from the model
        logger.info("Sending prompt to model")
        response = model.respond(prompt)
        logger.info("Received response from model")
        
        # Format the response in a simple format
        response_text = str(response).strip()  # Convert to string and remove any extra whitespace
        return jsonify({
            'text': response_text,
            'status': 'success'
        })
    except Exception as e:
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        logger.error(f"Error in chat endpoint: {error_msg}")
        logger.error(f"Stack trace: {stack_trace}")
        return jsonify({
            'error': 'An error occurred while processing your request',
            'details': error_msg,
            'stack_trace': stack_trace
        }), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)