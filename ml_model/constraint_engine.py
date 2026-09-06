import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Approximate coastal shipping distances (nautical miles) between the ports
# offered in the UI. Distances are symmetric and represent typical coastal
# routing (not straight-line/great-circle distance).
ROUTE_DISTANCES_NM = {
    frozenset(["HALDIA", "PARADIP"]): 180,
    frozenset(["HALDIA", "VISAKHAPATNAM"]): 350,
    frozenset(["HALDIA", "CHENNAI"]): 750,
    frozenset(["HALDIA", "MUMBAI"]): 1550,
    frozenset(["PARADIP", "VISAKHAPATNAM"]): 230,
    frozenset(["PARADIP", "CHENNAI"]): 620,
    frozenset(["PARADIP", "MUMBAI"]): 1420,
    frozenset(["VISAKHAPATNAM", "CHENNAI"]): 400,
    frozenset(["VISAKHAPATNAM", "MUMBAI"]): 1200,
    frozenset(["CHENNAI", "MUMBAI"]): 850,
}

DEFAULT_DISTANCE_NM = 500  # fallback for any route not in the table above


def _load_reference_data():
  """Loads and normalizes the port and vessel reference tables."""
  port_path = os.path.join(BASE_DIR, "data", "port_constraints.csv")
  vessel_path = os.path.join(BASE_DIR, "data", "vessel_fleet_specs.csv")

  if not os.path.exists(port_path):
    port_path = os.path.join(BASE_DIR, "..", "data", "port_constraints.csv")
  if not os.path.exists(vessel_path):
    vessel_path = os.path.join(
        BASE_DIR, "..", "data", "vessel_fleet_specs.csv"
    )

  if not os.path.exists(port_path) or not os.path.exists(vessel_path):
    return None, None

  ports_df = pd.read_csv(port_path)
  vessels_df = pd.read_csv(vessel_path)
  ports_df.columns = ports_df.columns.str.strip().str.lower()
  vessels_df.columns = vessels_df.columns.str.strip().str.lower()
  ports_df["port_key"] = ports_df["port_name"].str.strip().str.upper()

  return ports_df, vessels_df


def _get_route_distance(origin_key: str, dest_key: str) -> int:
  return ROUTE_DISTANCES_NM.get(
      frozenset([origin_key, dest_key]), DEFAULT_DISTANCE_NM
  )


def _lookup_port(ports_df: pd.DataFrame, port_name: str):
  match = ports_df[ports_df["port_key"] == port_name.strip().upper()]
  if match.empty:
    return None
  return match.iloc[0]


def _select_vessel(vessels_df: pd.DataFrame, cargo_mt: float):
  """Pick the smallest vessel class whose DWT can carry the cargo.

  Falls back to the largest available vessel if the cargo exceeds every
  class in the fleet register.
  """
  vessels_sorted = vessels_df.sort_values("dwt_capacity")
  fits = vessels_sorted[vessels_sorted["dwt_capacity"] >= cargo_mt]
  if not fits.empty:
    return fits.iloc[0]
  return vessels_sorted.iloc[-1]


def optimize_fleet(
    origin_port: str,
    dest_port: str,
    cargo_mt: float,
    predicted_bdi: float,
):
  """Model 2: Dynamic Port Constraint & Fleet Optimization Engine.

  Selects a vessel class sized for the requested cargo, checks it against
  the physical draft/LOA limits of both the origin and destination ports,
  and estimates the voyage cost from the vessel's charter rate, the
  predicted market rate (BDI), and port handling costs.
  """
  ports_df, vessels_df = _load_reference_data()

  if ports_df is None or vessels_df is None:
    return {
        "status": "error",
        "message": "Reference data (port/vessel CSVs) could not be found.",
    }

  if origin_port.strip().upper() == dest_port.strip().upper():
    return {
        "status": "error",
        "message": "Origin and destination ports must be different.",
    }

  origin_key = origin_port.strip().upper()
  dest_key = dest_port.strip().upper()
  distance_nm = _get_route_distance(origin_key, dest_key)

  origin_row = _lookup_port(ports_df, origin_port)
  dest_row = _lookup_port(ports_df, dest_port)

  vessel = _select_vessel(vessels_df, cargo_mt)
  recommended_vessel = vessel["vessel_class"]
  req_draft_m = float(vessel["req_draft_m"])
  req_loa_m = float(vessel["req_loa_m"])
  charter_cost_usd_day = float(vessel["charter_cost_usd_day"])

  # The shallower/tighter of the two ports governs whether the vessel fits.
  def _binding_port(attr):
    candidates = []
    if origin_row is not None:
      candidates.append((origin_row["port_name"], float(origin_row[attr])))
    if dest_row is not None:
      candidates.append((dest_row["port_name"], float(dest_row[attr])))
    if not candidates:
      return None, None
    return min(candidates, key=lambda pair: pair[1])

  draft_port_name, min_max_draft = _binding_port("max_draft_m")
  loa_port_name, min_max_loa = _binding_port("max_loa_m")

  if min_max_draft is None:
    draft_check = "UNKNOWN (port draft data unavailable)"
    draft_ok = True
  elif req_draft_m <= min_max_draft:
    draft_check = f"PASSED (Safe Depth at {draft_port_name})"
    draft_ok = True
  else:
    draft_check = (
        f"FAILED (Vessel draft {req_draft_m:.1f}m exceeds "
        f"{draft_port_name} limit of {min_max_draft:.1f}m)"
    )
    draft_ok = False

  if min_max_loa is None:
    loa_check = "UNKNOWN (port LOA data unavailable)"
    loa_ok = True
  elif req_loa_m <= min_max_loa:
    loa_check = f"PASSED (Berth Fit at {loa_port_name})"
    loa_ok = True
  else:
    loa_check = (
        f"FAILED (Vessel LOA {req_loa_m:.0f}m exceeds "
        f"{loa_port_name} limit of {min_max_loa:.0f}m)"
    )
    loa_ok = False

  # If the naturally-sized vessel doesn't physically fit, downgrade to the
  # largest vessel class that fits both ports, since a bigger ship is never
  # usable where a smaller one is already too big.
  if not (draft_ok and loa_ok) and min_max_draft is not None and min_max_loa is not None:
    fitting = vessels_df[
        (vessels_df["req_draft_m"] <= min_max_draft)
        & (vessels_df["req_loa_m"] <= min_max_loa)
    ].sort_values("dwt_capacity", ascending=False)
    if not fitting.empty:
      vessel = fitting.iloc[0]
      recommended_vessel = vessel["vessel_class"]
      charter_cost_usd_day = float(vessel["charter_cost_usd_day"])
      draft_check = f"PASSED (Safe Depth at {draft_port_name}, vessel downgraded to fit)"
      loa_check = f"PASSED (Berth Fit at {loa_port_name}, vessel downgraded to fit)"
      status = "feasible_with_downgrade"
      if float(vessel["dwt_capacity"]) < cargo_mt:
        status = "infeasible_multiple_voyages_required"
    else:
      status = "infeasible"
  else:
    status = "feasible"

  # Cost model: charter rate scaled by how the predicted market (BDI)
  # compares to a baseline index, plus port handling costs at both ends.
  baseline_bdi = 1500.0
  market_multiplier = max(predicted_bdi, 1.0) / baseline_bdi
  voyage_days = (distance_nm / (float(vessel["speed_knots"]) * 24.0)) + 2
  port_costs = 0.0
  for row in (origin_row, dest_row):
    if row is not None:
      port_costs += float(row["port_cost_usd_day"]) * 1.0  # ~1 day per call

  estimated_cost_usd = (
      (voyage_days * charter_cost_usd_day * market_multiplier)
      + port_costs
      + (cargo_mt * 1.8)
  )

  return {
      "status": status,
      "origin_port": origin_port,
      "destination_port": dest_port,
      "distance_nm": distance_nm,
      "recommended_vessel": recommended_vessel,
      "cargo_allocated_mt": min(cargo_mt, float(vessel["dwt_capacity"])),
      "estimated_cost_usd": round(estimated_cost_usd, 2),
      "draft_check": draft_check,
      "loa_check": loa_check,
  }
