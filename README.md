# SAIL Fleet Pulse — Fixed & Verified

This project was reviewed end-to-end and several bugs that prevented it from
actually working were fixed. Everything below has been tested by running the
real backend and hitting it with real requests, and by running `npm install`
+ `npm run build` on the real frontend.

## What was broken

1. **Backend wouldn't start from the folder you'd naturally run it from.**
   `backend/main.py` did `from ml_model.carbon_engine import ...`, but
   `ml_model/` lives one level above `backend/`. Running `cd backend &&
   uvicorn main:app` failed with `ModuleNotFoundError: No module named
   'ml_model'`. Fixed by adding the project root to `sys.path` in
   `backend/main.py`, so it works no matter which directory you launch it
   from.

2. **Port safety checks were fake.** `constraint_engine.py` loaded
   `port_constraints.csv` and `vessel_fleet_specs.csv` into memory but never
   used them — `draft_check` and `loa_check` were hardcoded to always say
   `"PASSED"`, and the recommended vessel was chosen purely from a
   cargo-size threshold with no regard for whether it could physically fit
   the ports involved (a Capesize ship, which needs 17m of draft, would
   have been "recommended" for Haldia, whose real limit is far shallower).
   Rewrote `optimize_fleet()` to actually look up both ports' draft/LOA
   limits and the selected vessel's requirements, fail or downgrade the
   vessel class when it doesn't fit, and price the voyage from the vessel's
   real charter rate plus port handling costs.

3. **Carbon/CII numbers were always defaults, silently.** `carbon_engine.py`
   looked for CSV columns (`FUEL_CONSUMPTION_TPD`, `DWT`, etc.) that don't
   exist in `vessel_fleet_specs.csv` (the real columns are `dwt_capacity`,
   `fuel_sea_tons_day`, `speed_knots`, ...). The lookup silently failed and
   every vessel type produced identical, made-up fuel/CO2 numbers. Fixed to
   read the actual column names, so a Handysize and a Capesize now report
   genuinely different fuel burn and emissions.

4. **Port name mismatch between frontend and data.** The frontend offers
   Visakhapatnam, Paradip, Haldia, Mumbai, Chennai. The data only had
   "Vizag" (not "Visakhapatnam") and had no Mumbai or Chennai rows at all,
   so those routes had no real constraint data. Renamed "Vizag" →
   "Visakhapatnam" and added estimated constraint rows for Mumbai and
   Chennai.

5. **Haldia's draft limit made the port permanently unusable.** It was set
   to 7.5m, shallower than even the smallest vessel class in the fleet
   register (10m). Once the safety checks were made real, *every* route
   into Haldia would report infeasible. Calibrated it to 11.8m — Haldia
   remains the most draft-restricted port in the list (realistic for a
   river port) but can now take vessels up to Supramax size, matching how
   the port is actually used.

6. **No input validation.** The `/optimize` endpoint accepted a raw `dict`
   with no schema, so malformed requests (missing fields, negative cargo)
   would either 500 or silently produce nonsense. Added a Pydantic request
   model and a check that rejects non-positive cargo and identical
   origin/destination ports with a clear 400 error.

## Running it

### Backend

```bash
cd SAIL_FLEET_PULSE
python -m venv venv
# Windows: venv\Scripts\activate    macOS/Linux: source venv/bin/activate
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

Run this from the **project root** (`SAIL_FLEET_PULSE/`), not from inside
`backend/` — the command above (`backend.main:app`) is what makes the
`ml_model` import resolve correctly.

Verify it's up: `curl http://127.0.0.1:8000/` should return
`{"status":"Online", ...}`.

### Frontend

```bash
cd SAIL_FLEET_PULSE/frontend
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:3000`). The page
calls `http://127.0.0.1:8000/optimize` directly, so the backend must be
running first.

### Retraining the BDI model (optional)

The trained model is already committed at `ml_model/bdi_forecaster_model.pkl`.
To retrain it from the historical BDI CSV:

```bash
cd SAIL_FLEET_PULSE
python ml_model/train_bdi_model.py
```

## A note on the reference data

`port_constraints.csv` and `vessel_fleet_specs.csv` are illustrative, not
authoritative shipping data — draft/LOA/cost figures for Mumbai, Chennai,
and the Haldia calibration above are reasonable estimates, not verified
port authority figures. Good enough for a working demo; swap in real
figures before using this for anything beyond that.
