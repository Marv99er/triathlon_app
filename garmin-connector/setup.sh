#!/bin/bash
# Creates the venv outside OneDrive and installs the only dependency.
set -e
mkdir -p ~/.trilog-garmin
python3 -m venv ~/.trilog-garmin/venv
~/.trilog-garmin/venv/bin/pip install -q --upgrade pip garminconnect
echo "Fertig. Jetzt einloggen:"
echo "  ~/.trilog-garmin/venv/bin/python \"$(cd "$(dirname "$0")" && pwd)/login.py\""
