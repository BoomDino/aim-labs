#!/bin/sh
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  exec python3 run.py "$@"
elif command -v python >/dev/null 2>&1; then
  exec python run.py "$@"
else
  echo "Python 3.9+ is required. Install Python, then run this script again." >&2
  exit 1
fi
