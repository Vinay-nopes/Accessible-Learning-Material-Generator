import json
import sys
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

MODEL_PATH = r"C:\Users\vinay\OneDrive\Documents\Desktop\AI_CRM_PROJECT\samsum_finetuned_model"

print("Loading tokenizer and model from local path:", MODEL_PATH)
sys.stdout.flush()

try:
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_PATH)
    print("Fine-Tuned Model loaded successfully!")
    sys.stdout.flush()
    READY = True
except Exception as e:
    print(f"Error loading model: {e}", file=sys.stderr)
    sys.stderr.flush()
    READY = False

class InferenceHTTPRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Override to log cleanly
        sys.stdout.write(f"InferenceServer: {format % args}\n")
        sys.stdout.flush()

    def do_POST(self):
        if self.path == '/simplify':
            if not READY:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Unable to load the Fine-Tuned Model.'}).encode('utf-8'))
                return
            
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                request_data = json.loads(post_data.decode('utf-8'))
                
                text = request_data.get('text', '')
                if not text:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({'error': 'Please enter educational content.'}).encode('utf-8'))
                    return
                
                # Input format: simplify: {user_text}
                input_text = f"simplify: {text}"
                
                # Tokenize and run generation
                inputs = tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
                
                # Generate using specified parameters:
                # max_length=256, num_beams=4, early_stopping=True
                with torch.no_grad():
                    outputs = model.generate(
                        **inputs,
                        max_length=256,
                        num_beams=4,
                        early_stopping=True
                    )
                
                simplified_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'result': simplified_text}).encode('utf-8'))
                
            except Exception as e:
                print(f"Inference generation error: {e}", file=sys.stderr)
                sys.stderr.flush()
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Text simplification failed. Please try again.'}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/health':
            self.send_response(200 if READY else 500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'ready' if READY else 'error', 'loaded': READY}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=InferenceHTTPRequestHandler, port=5001):
    server_address = ('127.0.0.1', port)
    httpd = server_class(server_address, handler_class)
    print(f"Inference HTTP Server running on http://127.0.0.1:{port}")
    sys.stdout.flush()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping Inference HTTP Server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
