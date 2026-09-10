import os
import sys

# Ensure project root is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app import app

class VercelWSGIMiddleware:
    """
    Normalizes WSGI environment for Vercel Serverless deployments.
    Handles path rewriting, proxy headers, and ensures Flask routes match reliably.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # 1. Recover original request URI from Vercel forward headers if present
        fwd_uri = (
            environ.get("HTTP_X_FORWARDED_URI")
            or environ.get("HTTP_X_MATCHED_PATH")
            or environ.get("REQUEST_URI")
        )
        if fwd_uri:
            clean_path = fwd_uri.split("?")[0]
            if clean_path.startswith("/api"):
                environ["PATH_INFO"] = clean_path
                environ["SCRIPT_NAME"] = ""

        # 2. If Vercel sets SCRIPT_NAME to '/api' and PATH_INFO to '/products'
        script_name = environ.get("SCRIPT_NAME", "")
        path_info = environ.get("PATH_INFO", "")
        if script_name and not path_info.startswith(script_name):
            environ["PATH_INFO"] = script_name.rstrip("/") + "/" + path_info.lstrip("/")
            environ["SCRIPT_NAME"] = ""

        # 3. If PATH_INFO points to /api/index.py or /api/index fallback to /api/products or /api/config
        if environ.get("PATH_INFO") in ["/api/index.py", "/api/index", "/index.py"]:
            if fwd_uri and fwd_uri.split("?")[0] not in ["/api/index.py", "/api/index"]:
                environ["PATH_INFO"] = fwd_uri.split("?")[0]

        return self.wsgi_app(environ, start_response)

# Apply Vercel WSGI Middleware
app.wsgi_app = VercelWSGIMiddleware(app.wsgi_app)
