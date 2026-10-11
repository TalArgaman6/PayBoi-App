#!/bin/bash
# Double-click to start the PayBoi dev server.
cd "$(dirname "$0")" || exit 1

# If something is already serving 5173, just open it.
if lsof -i :5173 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Dev server is already running. Opening browser..."
  open "http://localhost:5173"
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed. Get the macOS LTS build from https://nodejs.org"
  read -r -p "Press Return to close."
  exit 1
fi

[ -d node_modules ] || npm install || { read -r -p "Install failed. Press Return."; exit 1; }

echo "Starting PayBoi at http://localhost:5173"
echo "Leave this window open. Press Control-C to stop."
echo ""

sleep 2 && open "http://localhost:5173" &
npm run dev
