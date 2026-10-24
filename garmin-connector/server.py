#!/usr/bin/env python3
"""Minimal MCP server (stdio, JSON-RPC) exposing read-only Garmin Connect data.

No MCP SDK needed, so it runs on the system Python 3.9. Only dependency:
garminconnect (installed by setup.sh into ~/.trilog-garmin/venv).
Credentials are never handled here; run login.py once in your own terminal.
"""
import json
import os
import sys
import warnings
from datetime import date, timedelta

warnings.filterwarnings("ignore")

HOME = os.path.expanduser("~/.trilog-garmin")
TOKENS = os.path.join(HOME, "tokens")
PROTOCOL = "2024-11-05"

_client = None


def client():
    global _client
    if _client is None:
        from garminconnect import Garmin

        if not os.path.isdir(TOKENS):
            raise RuntimeError(
                "Nicht eingeloggt. Bitte im Terminal ausfuehren: "
                "~/.trilog-garmin/venv/bin/python garmin-connector/login.py"
            )
        g = Garmin()
        g.login(TOKENS)
        _client = g
    return _client


def _d(args, key="date"):
    return args.get(key) or date.today().isoformat()


def _range(args):
    end = args.get("end_date") or date.today().isoformat()
    start = args.get("start_date") or (date.today() - timedelta(days=7)).isoformat()
    return start, end


DATE = {"type": "string", "description": "YYYY-MM-DD (default: heute)"}
RANGE = {
    "start_date": {"type": "string", "description": "YYYY-MM-DD (default: vor 7 Tagen)"},
    "end_date": {"type": "string", "description": "YYYY-MM-DD (default: heute)"},
}
ACT = {"activity_id": {"type": "integer"}}

TOOLS = {
    "get_activities": (
        "Letzte Aktivitaeten (Lauf, Rad, Schwimmen, ...), neueste zuerst.",
        {"limit": {"type": "integer", "description": "Anzahl, default 10"},
         "start": {"type": "integer", "description": "Offset, default 0"}},
        lambda c, a: c.get_activities(a.get("start", 0), a.get("limit", 10)),
    ),
    "get_activities_by_date": (
        "Aktivitaeten in einem Zeitraum, optional nach Typ (running, cycling, lap_swimming, ...).",
        {**RANGE, "activity_type": {"type": "string"}},
        lambda c, a: c.get_activities_by_date(*_range(a), a.get("activity_type")),
    ),
    "get_activity": (
        "Zusammenfassung einer Aktivitaet.",
        ACT,
        lambda c, a: c.get_activity(a["activity_id"]),
    ),
    "get_activity_splits": (
        "Splits/Runden einer Aktivitaet.",
        ACT,
        lambda c, a: c.get_activity_splits(a["activity_id"]),
    ),
    "get_activity_hr_zones": (
        "Zeit in Herzfrequenzzonen fuer eine Aktivitaet.",
        ACT,
        lambda c, a: c.get_activity_hr_in_timezones(a["activity_id"]),
    ),
    "get_daily_summary": (
        "Tageszusammenfassung (Schritte, Kalorien, Stress, Body Battery, ...).",
        {"date": DATE},
        lambda c, a: c.get_user_summary(_d(a)),
    ),
    "get_sleep": ("Schlafdaten eines Tages.", {"date": DATE}, lambda c, a: c.get_sleep_data(_d(a))),
    "get_hrv": ("HRV-Daten eines Tages.", {"date": DATE}, lambda c, a: c.get_hrv_data(_d(a))),
    "get_resting_hr": ("Ruhepuls eines Tages.", {"date": DATE}, lambda c, a: c.get_rhr_day(_d(a))),
    "get_heart_rates": ("Herzfrequenzverlauf eines Tages.", {"date": DATE}, lambda c, a: c.get_heart_rates(_d(a))),
    "get_stress": ("Stressdaten eines Tages.", {"date": DATE}, lambda c, a: c.get_stress_data(_d(a))),
    "get_body_battery": ("Body Battery im Zeitraum.", RANGE, lambda c, a: c.get_body_battery(*_range(a))),
    "get_training_status": ("Trainingsstatus/Load eines Tages.", {"date": DATE}, lambda c, a: c.get_training_status(_d(a))),
    "get_training_readiness": ("Trainingsbereitschaft eines Tages.", {"date": DATE}, lambda c, a: c.get_training_readiness(_d(a))),
    "get_max_metrics": ("VO2max und verwandte Werte.", {"date": DATE}, lambda c, a: c.get_max_metrics(_d(a))),
    "get_race_predictions": ("Wettkampfzeit-Prognosen (5k/10k/HM/M).", {}, lambda c, a: c.get_race_predictions()),
    "get_endurance_score": ("Endurance Score im Zeitraum.", RANGE, lambda c, a: c.get_endurance_score(*_range(a))),
    "get_weigh_ins": ("Gewichtseintraege im Zeitraum.", RANGE, lambda c, a: c.get_weigh_ins(*_range(a))),
    "get_body_composition": ("Koerperzusammensetzung im Zeitraum.", RANGE, lambda c, a: c.get_body_composition(*_range(a))),
}


NOISE_KEYS = {"userRoles", "ownerDisplayName"}
MAX_SERIES = 60  # longer lists are minute-by-minute time series; drop them


def slim(x, full=False):
    """Drop API noise and long raw time series so answers stay readable."""
    if isinstance(x, dict):
        return {k: slim(v, full) for k, v in x.items() if k not in NOISE_KEYS}
    if isinstance(x, list):
        if not full and len(x) > MAX_SERIES and not isinstance(x[0], (str, int, float)):
            return "[%d Messwerte ausgelassen, full=true setzen]" % len(x)
        return [slim(v, full) for v in x]
    return x


def call_tool(name, args):
    if name not in TOOLS:
        raise ValueError("Unbekanntes Tool: " + name)
    args = args or {}
    return slim(TOOLS[name][2](client(), args), bool(args.get("full")))


def reply(id_, result=None, error=None):
    msg = {"jsonrpc": "2.0", "id": id_}
    if error is not None:
        msg["error"] = error
    else:
        msg["result"] = result
    sys.stdout.write(json.dumps(msg, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def handle(req):
    method, id_, params = req.get("method"), req.get("id"), req.get("params") or {}
    if id_ is None:  # notification
        return
    if method == "initialize":
        reply(id_, {
            "protocolVersion": params.get("protocolVersion", PROTOCOL),
            "capabilities": {"tools": {}},
            "serverInfo": {"name": "garmin-connect", "version": "0.1.0"},
        })
    elif method == "ping":
        reply(id_, {})
    elif method == "tools/list":
        reply(id_, {"tools": [
            {"name": n, "description": d,
             "inputSchema": {"type": "object", "properties": dict(
                 p, full={"type": "boolean",
                          "description": "Rohe Messreihen nicht auslassen (sehr gross)"})}}
            for n, (d, p, _) in TOOLS.items()
        ]})
    elif method == "tools/call":
        try:
            data = call_tool(params.get("name"), params.get("arguments"))
            text = json.dumps(data, ensure_ascii=False, default=str)
            reply(id_, {"content": [{"type": "text", "text": text}]})
        except Exception as e:  # report tool errors in-band
            reply(id_, {"content": [{"type": "text", "text": "Fehler: %s" % e}], "isError": True})
    else:
        reply(id_, error={"code": -32601, "message": "Method not found: %s" % method})


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            handle(json.loads(line))
        except Exception as e:
            sys.stderr.write("server error: %s\n" % e)


if __name__ == "__main__":
    main()
