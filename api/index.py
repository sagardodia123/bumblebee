import os
import sys
from urllib.parse import parse_qs, urlencode

# Ensure project root is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app import app

class VercelWSGIMiddleware:
    """
    Normalizes WSGI environment for Vercel Serverless deployments.
    Handles path rewriting, query parameter forwarding, and ensures Flask routes match.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        qs_raw = environ.get("QUERY_STRING", "")
        
        # 1. First priority: Check __vercel_path passed via vercel.json rewrite
        if "__vercel_path" in qs_raw:
            qs = parse_qs(qs_raw, keep_blank_values=True)
            if "__vercel_path" in qs:
                target_path = qs.pop("__vercel_path")[0]
                if len(target_path) > 1 and target_path.endswith("/"):
                    target_path = target_path.rstrip("/")
                environ["PATH_INFO"] = target_path
                environ["SCRIPT_NAME"] = ""
                # Clean up query string so __vercel_path isn't in request.args
                flat_qs = [(k, v) for k, vs in qs.items() for v in vs]
                environ["QUERY_STRING"] = urlencode(flat_qs)

        # 2. Check X-Forwarded-Uri or X-Matched-Path headers
        elif environ.get("HTTP_X_FORWARDED_URI") or environ.get("HTTP_X_MATCHED_PATH"):
            fwd = (environ.get("HTTP_X_FORWARDED_URI") or environ.get("HTTP_X_MATCHED_PATH")).split("?")[0]
            if fwd.startswith("/api"):
                if len(fwd) > 1 and fwd.endswith("/"):
                    fwd = fwd.rstrip("/")
                environ["PATH_INFO"] = fwd
                environ["SCRIPT_NAME"] = ""

        # 3. If SCRIPT_NAME is /api and PATH_INFO is /products, join them
        script_name = environ.get("SCRIPT_NAME", "")
        path_info = environ.get("PATH_INFO", "")
        if script_name and not path_info.startswith(script_name):
            combined = script_name.rstrip("/") + "/" + path_info.lstrip("/")
            if len(combined) > 1 and combined.endswith("/"):
                combined = combined.rstrip("/")
            environ["PATH_INFO"] = combined
            environ["SCRIPT_NAME"] = ""

        # 4. If PATH_INFO is the index file itself, fallback to /api
        if environ.get("PATH_INFO") in ["/api/index.py", "/api/index", "/index.py"]:
            environ["PATH_INFO"] = "/api"

        return self.wsgi_app(environ, start_response)

# Apply Vercel WSGI Middleware
app.wsgi_app = VercelWSGIMiddleware(app.wsgi_app)
