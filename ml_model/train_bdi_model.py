import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(
    BASE_DIR, 'data', 'Baltic Dry Index Historical Data.csv'
)

# 1. Dataset Load Karein
df = pd.read_csv(DATA_PATH)

# Auto-detect target column
target_col = None
possible_cols = ['baltic_dry_index', 'Price', 'price', 'Close', 'value']

for col in possible_cols:
  if col in df.columns:
    target_col = col
    break

if not target_col:
  target_col = df.columns[1]

# String to numeric conversion (removes commas and extra spaces)
df['target_val'] = (
    df[target_col]
    .astype(str)
    .str.replace(',', '', regex=True)
    .str.strip()
)
df['target_val'] = pd.to_numeric(df['target_val'], errors='coerce')

# Convert Date column safely
df['Date'] = pd.to_datetime(df['Date'], errors='coerce')

# Sort by date and remove rows where core date or target is missing
df = df.dropna(subset=['Date', 'target_val']).sort_values('Date')

# 2. Time-Series Feature Engineering
df['bdi_lag_1'] = df['target_val'].shift(1)
df['bdi_lag_7'] = df['target_val'].shift(7)

# Adjust rolling window if dataset is smaller than 30 rows
window_size = 30 if len(df) >= 30 else 3
df['bdi_ma_30'] = (
    df['target_val'].rolling(window=window_size, min_periods=1).mean()
)

# Feature columns check: drop missing feature rows only
feature_cols = ['bdi_lag_1', 'bdi_lag_7', 'bdi_ma_30']
df_clean = df.dropna(subset=feature_cols + ['target_val'])

# Check processed dataset size
if df_clean.empty:
  raise ValueError(
      'Dataset filter hone ke baad empty ho gaya hai. CSV data check karein!'
  )

# 3. Features & Target
X = df_clean[feature_cols]
y = df_clean['target_val']

print(f'Total Training Samples Found: {len(X)}')

# 4. Model Training
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X, y)

# 5. Save Model
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'bdi_forecaster_model.pkl')
joblib.dump(model, MODEL_SAVE_PATH)

print('--------------------------------------------------')
print('SUCCESS: Model successfully trained and saved!')
print(f'Model Saved At: {MODEL_SAVE_PATH}')
print('--------------------------------------------------')