import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
import joblib
import os

def train_petalio_demand_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, "data", "flower_sales_historical.csv")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset file not found at {data_path}")

    print(f"Loading dataset from '{data_path}'...")
    df = pd.read_csv(data_path)

    # 1. Datetime Features Extraction
    df['Order_Date'] = pd.to_datetime(df['Order_Date'])
    df['Month'] = df['Order_Date'].dt.month
    df['Day'] = df['Order_Date'].dt.day
    df['DayOfWeek'] = df['Order_Date'].dt.dayofweek
    df['IsWeekend'] = df['DayOfWeek'].apply(lambda x: 1 if x >= 5 else 0)

    # 2. Categorical Label Encoding
    le_flower = LabelEncoder()
    le_variety = LabelEncoder()
    le_color = LabelEncoder()
    le_season = LabelEncoder()

    df['Flower_Type_Encoded'] = le_flower.fit_transform(df['Flower_Type'])
    df['Flower_Variety_Encoded'] = le_variety.fit_transform(df['Flower_Variety'])
    df['Flower_Color_Encoded'] = le_color.fit_transform(df['Flower_Color'])
    df['Season_Event_Encoded'] = le_season.fit_transform(df['Season_Event'])

    # Features and Target
    feature_cols = [
        'Flower_Type_Encoded', 
        'Flower_Variety_Encoded',
        'Flower_Color_Encoded',
        'Price_Per_Unit', 
        'Season_Event_Encoded', 
        'Month', 
        'Day', 
        'DayOfWeek', 
        'IsWeekend'
    ]
    target_col = 'Quantity_Ordered'

    X = df[feature_cols]
    y = df[target_col]

    # 3. Train Test Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 4. Model Training (Random Forest Regressor)
    model = RandomForestRegressor(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    # 5. Evaluation
    predictions = model.predict(X_test)
    mae = mean_absolute_error(y_test, predictions)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)

    print("==========================================")
    print("      Demand Forecasting Model Report     ")
    print("==========================================")
    print(f"Total Records Trained : {len(df)}")
    print(f"Total Flower Types    : {len(le_flower.classes_)}")
    print(f"Flower Types List     : {list(le_flower.classes_)}")
    print(f"Mean Absolute Error   : {mae:.2f} bunches")
    print(f"Root Mean Sq. Error   : {rmse:.2f} bunches")
    print(f"R² Accuracy Score     : {r2:.4f}")
    print("==========================================")

    # 6. Save Model and Encoders
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "demand_forecasting_model.pkl")
    encoder_path = os.path.join(models_dir, "encoders.pkl")

    joblib.dump(model, model_path)
    joblib.dump({
        'flower_encoder': le_flower,
        'variety_encoder': le_variety,
        'color_encoder': le_color,
        'season_encoder': le_season,
        'feature_cols': feature_cols,
        'default_variety': 'Standard',
        'default_color': 'White'
    }, encoder_path)

    print(f"✅ Model saved to '{model_path}'")
    print(f"✅ Encoders saved to '{encoder_path}'")

if __name__ == "__main__":
    train_petalio_demand_model()
