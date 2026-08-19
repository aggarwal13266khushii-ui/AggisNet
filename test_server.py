import unittest
import urllib.request
import threading
import socketserver
import os
import sys

# Add directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import handler from server.py
from server import SafeHandler

class TestAegisNetServer(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.port = 8085
        cls.server_address = ('127.0.0.1', cls.port)
        # Suppress server console logs during tests to keep output clean
        class QuietHandler(SafeHandler):
            def log_message(self, format, *args):
                pass
        
        socketserver.TCPServer.allow_reuse_address = True
        cls.httpd = socketserver.TCPServer(cls.server_address, QuietHandler)
        cls.server_thread = threading.Thread(target=cls.httpd.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()
        print(f"Test server started on 127.0.0.1:{cls.port}")

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()
        print("Test server shut down.")

    def test_01_index_page_loads(self):
        url = f"http://127.0.0.1:{self.port}/"
        response = urllib.request.urlopen(url, timeout=5)
        self.assertEqual(response.status, 200)
        
        # Verify HTML content contains crucial tags
        content = response.read().decode('utf-8')
        self.assertIn("<!DOCTYPE html>", content)
        self.assertIn("AegisNet", content)
        self.assertIn("viewport", content) # Essential for accessibility

    def test_02_security_headers_present(self):
        url = f"http://127.0.0.1:{self.port}/"
        response = urllib.request.urlopen(url, timeout=5)
        headers = response.info()
        
        # Verify required safety & frame headers
        self.assertEqual(headers.get('X-Frame-Options'), 'DENY')
        self.assertEqual(headers.get('X-Content-Type-Options'), 'nosniff')
        self.assertEqual(headers.get('X-XSS-Protection'), '1; mode=block')
        self.assertIn('Content-Security-Policy', headers)

    def test_03_js_mime_type(self):
        url = f"http://127.0.0.1:{self.port}/app.js"
        response = urllib.request.urlopen(url, timeout=5)
        self.assertEqual(response.status, 200)
        
        headers = response.info()
        self.assertEqual(headers.get('Content-Type'), 'application/javascript')

    def test_04_html_mime_type(self):
        url = f"http://127.0.0.1:{self.port}/index.html"
        response = urllib.request.urlopen(url, timeout=5)
        self.assertEqual(response.status, 200)
        
        headers = response.info()
        self.assertEqual(headers.get('Content-Type'), 'text/html')

if __name__ == '__main__':
    unittest.main()
