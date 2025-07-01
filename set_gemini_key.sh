#!/bin/bash

# Set Gemini API key
export GEMINI_API_KEY='AIzaSyAZbp4SEeaAq8ioyvuWNF7kcwalhNA8h8I'

# Kill any running server instances
pkill -f "python.*server.py" || true

# Start the server
python server.py 