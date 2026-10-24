#!/usr/bin/env python3
"""One-time Garmin Connect login. Run this yourself in a terminal.

Email/password are typed here (password hidden) and only used to obtain
tokens, which are stored in ~/.trilog-garmin/tokens (outside the repo and
outside OneDrive). The password itself is never saved.
"""
import getpass
import os
import warnings

warnings.filterwarnings("ignore")

import garth
from garminconnect import Garmin

TOKENS = os.path.expanduser("~/.trilog-garmin/tokens")

email = input("Garmin-Connect E-Mail: ").strip()
password = getpass.getpass("Passwort (wird nicht angezeigt): ")

garth.login(email, password, prompt_mfa=lambda: input("MFA-Code: ").strip())
os.makedirs(TOKENS, exist_ok=True)
garth.client.dump(TOKENS)
os.chmod(TOKENS, 0o700)

g = Garmin()
g.login(TOKENS)
print("Login ok als:", g.get_full_name())
print("Tokens gespeichert in", TOKENS)
