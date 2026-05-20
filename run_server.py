#!/usr/bin/env python3
"""
NexusDAST Local Development Server
Starts a simple HTTP server to view the frontend on localhost
"""

import http.server
import socketserver
import os
import webbrowser
import sys
from pathlib import Path

def main():
    # Get the project directory
    project_dir = Path(__file__).parent.absolute()
    os.chdir(project_dir)
    
    # Default port
    PORT = 8000
    
    # Check for custom port argument
    if len(sys.argv) > 1:
        try:
            PORT = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}")
            print(f"Usage: python run_server.py [PORT]")
            sys.exit(1)
    
    # Create handler
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            url = f"http://localhost:{PORT}"
            print(f"\n{'='*60}")
            print(f"🚀 NexusDAST Development Server")
            print(f"{'='*60}")
            print(f"\n📍 Server running at: {url}")
            print(f"📁 Serving from: {project_dir}")
            print(f"\n✅ Open your browser and navigate to:")
            print(f"   {url}/index.html")
            print(f"\n📊 View sample report:")
            print(f"   {url}/scan_report.html")
            print(f"\n🛑 Press Ctrl+C to stop the server")
            print(f"\n{'='*60}\n")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f"{url}/index.html")
                print("✨ Opening browser automatically...\n")
            except:
                pass
            
            # Start server
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Port already in use
            print(f"\n❌ Error: Port {PORT} is already in use")
            print(f"   Try running: python run_server.py {PORT + 1}")
        else:
            print(f"\n❌ Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print(f"\n\n✅ Server stopped")
        sys.exit(0)

if __name__ == "__main__":
    main()
