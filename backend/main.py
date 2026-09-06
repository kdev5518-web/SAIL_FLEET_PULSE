import os
import sys

# Ensure the project root (the parent of this backend/ folder) is on the
# import path, so `ml_model` resolves whether this app is launched as
# `uvicorn backend.main:app` from the project root, or as `uvicorn main:app`
# from inside backend/.
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
  sys.path.insert(0, _PROJECT_ROOT)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd
from pydantic import BaseModel

from ml_model.carbon_engine import calculate_emissions
from ml_model.constraint_engine import optimize_fleet

app = FastAPI(title="SAIL Fleet Pulse API")


class OptimizationRequest(BaseModel):
  origin_port: str = "Paradip"
  dest_port: str = "Haldia"
  cargo_mt: float = 50000
  recent_bdi: float = 1500

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(
    BASE_DIR, "..", "ml_model", "bdi_forecaster_model.pkl"
)

bdi_model = None
if os.path.exists(MODEL_PATH):
  bdi_model = joblib.load(MODEL_PATH)


@app.get("/")
def home():
  return {
      "status": "Online",
      "message": "SAIL Fleet Pulse Core API Running Live!",
  }


@app.post("/optimize")
def predict_and_optimize(data: OptimizationRequest):
  origin = data.origin_port
  destination = data.dest_port
  cargo_mt = data.cargo_mt
  recent_bdi = data.recent_bdi

  if cargo_mt <= 0:
    raise HTTPException(status_code=400, detail="cargo_mt must be positive.")

  # 1. Model 1 Execution: BDI Rate Prediction using DataFrame with feature names
  predicted_bdi = recent_bdi
  if bdi_model is not None:
    features_df = pd.DataFrame(
        [[recent_bdi, recent_bdi, recent_bdi]],
        columns=["bdi_lag_1", "bdi_lag_7", "bdi_ma_30"],
    )
    predicted_bdi = float(bdi_model.predict(features_df)[0])

  # 2. Model 2 Execution: Route & Vessel Constraint Optimization
  opt_result = optimize_fleet(
      origin_port=origin,
      dest_port=destination,
      cargo_mt=cargo_mt,
      predicted_bdi=predicted_bdi,
  )

  if opt_result.get("status") == "error":
    raise HTTPException(
        status_code=400, detail=opt_result.get("message", "Optimization failed.")
    )

  recommended_vessel = opt_result.get("recommended_vessel", "Panamax")
  distance_nm = opt_result.get("distance_nm", 1000)

  # 3. Model 3 Execution: Carbon & ESG Tracking
  carbon_report = calculate_emissions(
      vessel_type=recommended_vessel,
      distance_nm=distance_nm,
      cargo_mt=cargo_mt,
  )

  return {
      "predicted_bdi": round(predicted_bdi, 2),
      "optimization_details": opt_result,
      "carbon_emissions": carbon_report,
  }