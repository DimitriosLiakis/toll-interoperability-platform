import argparse
import os
import pickle
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error

parser = argparse.ArgumentParser(description="Train a RandomForest model to predict peak hour for a specific company.")
parser.add_argument('--data_csv', required=True, help='Path to the data CSV file')
parser.add_argument('--company', required=True, help='Company identifier for dynamic output naming')
args = parser.parse_args()

data = pd.read_csv(args.data_csv)
data['passage_date'] = pd.to_datetime(data['passage_date'])
data['passage_date'] = data['passage_date'].astype(str)

data['day_of_week'] = data['passage_date'].dt.dayofweek
data['month'] = data['passage_date'].dt.month
data['year'] = data['passage_date'].dt.year

# Apply LabelEncoder to 'company' column and save the encoder
le = LabelEncoder()
data['company'] = le.fit_transform(data['company'])

X = data.drop(columns=['passage_date', 'company', 'hour_of_day'])
y = data['hour_of_day']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)

output_dir = os.path.join(os.path.dirname(__file__), '..', 'models_peak_hours')
os.makedirs(output_dir, exist_ok=True)

# Save the model
output_path = os.path.join(output_dir, f"model_{args.company}.pkl")
with open(output_path, 'wb') as model_file:
    pickle.dump(model, model_file)

# Save the LabelEncoder
le_output_path = os.path.join(output_dir, f"company_label_encoder_{args.company}.pkl")
with open(le_output_path, 'wb') as le_file:
    pickle.dump(le, le_file)
