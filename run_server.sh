#!/bin/bash
# NexusDAST Local Development Server Launcher for macOS/Linux
# This script starts the HTTP server and opens the dashboard

echo ""
echo "============================================================"
echo "NexusDAST Development Server"
echo "============================================================"
echo ""

# Get the port from argument or use default
PORT=${1:-8000}

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3.9+ from https://www.python.org"
    exit 1
fi

# Start the server
echo "Starting server on port $PORT..."
echo ""
echo "Opening dashboard at: http://localhost:$PORT/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "============================================================"
echo ""

python3 run_server.py $PORT

if [ $? -ne 0 ]; then
    echo ""
    echo "Error starting server. Try a different port:"
    echo "  $0 8080"
fi
