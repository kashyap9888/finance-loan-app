#!/bin/bash

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    echo "MongoDB is not installed. Using in-memory MongoDB server."
    echo "Starting development server..."
    npm run dev
else
    # Check if MongoDB is running
    if pgrep -x "mongod" > /dev/null; then
        echo "MongoDB is running."
        echo "Starting production server..."
        npm start
    else
        echo "MongoDB is installed but not running."
        echo "Starting development server with in-memory MongoDB..."
        npm run dev
    fi
fi