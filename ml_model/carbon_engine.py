import os
import pandas as pd


def calculate_emissions(
    vessel_type: str,
    distance_nm: float,
    cargo_mt: float = 50000,
    fuel_type: str = 'VLSFO',
):
  """Model 3: Carbon Footprint & ESG Tracking Engine

  Calculates fuel consumed, CO2 emissions, and IMO CII Rating using the
  vessel's actual speed and sea fuel-burn rate from the fleet register.
  """
  BASE_DIR = os.path.dirname(os.path.abspath(__file__))
  VESSEL_PATH = os.path.join(BASE_DIR, 'data', 'vessel_fleet_specs.csv')
  if not os.path.exists(VESSEL_PATH):
    VESSEL_PATH = os.path.join(BASE_DIR, '..', 'data', 'vessel_fleet_specs.csv')

  # Fallback defaults, used only if the vessel isn't found in the register.
  dwt = cargo_mt * 1.1
  speed_knots = 13.0
  fuel_burn_rate = 25.0

  if os.path.exists(VESSEL_PATH):
    try:
      df_vessels = pd.read_csv(VESSEL_PATH)
      df_vessels.columns = df_vessels.columns.str.strip().str.lower()

      matched = df_vessels[
          df_vessels['vessel_class'].str.upper() == vessel_type.upper()
      ]
      if not matched.empty:
        row = matched.iloc[0]
        dwt = float(row['dwt_capacity'])
        speed_knots = float(row['speed_knots'])
        fuel_burn_rate = float(row['fuel_sea_tons_day'])
    except Exception:
      pass

  # 2. Voyage Duration & Fuel Calculation
  voyage_hours = distance_nm / speed_knots
  voyage_days = voyage_hours / 24.0
  total_fuel_consumed_tons = voyage_days * fuel_burn_rate

  # 3. IMO Emission Conversion Factor (t-CO2 / ton fuel)
  emission_factors = {
      'VLSFO': 3.151,
      'LSMGO': 3.206,
      'HFO': 3.114,
      'LNG': 2.750,
  }
  co2_factor = emission_factors.get(fuel_type.upper(), 3.151)
  total_co2_tons = total_fuel_consumed_tons * co2_factor

  # 4. CII (Carbon Intensity Indicator) Rating Calculation
  # Grams of CO2 per DWT-Nautical Mile
  if dwt > 0 and distance_nm > 0:
    cii_grams = (total_co2_tons * 1_000_000) / (dwt * distance_nm)
  else:
    cii_grams = 10.0

  if cii_grams < 5.0:
    cii_rating = 'A (Very Efficient)'
  elif cii_grams < 8.0:
    cii_rating = 'B (Efficient)'
  elif cii_grams < 12.0:
    cii_rating = 'C (Moderate / Compliant)'
  elif cii_grams < 16.0:
    cii_rating = 'D (Warning - High Carbon Intensity)'
  else:
    cii_rating = 'E (Non-Compliant - Action Required)'

  return {
      'voyage_days': round(voyage_days, 2),
      'fuel_consumed_tons': round(total_fuel_consumed_tons, 2),
      'co2_emissions_tons': round(total_co2_tons, 2),
      'cii_grams_per_dwt_nm': round(cii_grams, 2),
      'cii_rating': cii_rating,
  }
