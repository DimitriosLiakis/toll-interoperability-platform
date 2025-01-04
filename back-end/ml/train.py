import argparse
import pandas as pd
import pickle
import os
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import LabelEncoder

# Argument parsing
parser = argparse.ArgumentParser(description="Train a RandomForest model using preprocessed data.")
parser.add_argument('--data_csv', required=True, help='Path to the preprocessed data CSV file')
parser.add_argument('--company', required=True, help='Company identifier for dynamic output naming')
args = parser.parse_args()

# Load data
data = pd.read_csv(args.data_csv)

# Sanitize column names
data.columns = data.columns.str.strip().str.replace('"', '')

# Convert 'date' to datetime
data['date'] = pd.to_datetime(data['date'])

# Extract date features
data['Year'] = data['date'].dt.year
data['Month'] = data['date'].dt.month
data['Day'] = data['date'].dt.day
data['DayOfYear'] = data['date'].dt.dayofyear

# Handle unseen labels by adding an "Unknown" category to the LabelEncoder
label_encoder = LabelEncoder()

# Fit the label encoder on the 'tollID' column
data['tollID'] = data['tollID'].astype(str)  # Ensure the 'tollID' column is a string
label_encoder.fit(data['tollID'])

# Add the 'Unknown' category to handle unseen labels
if 'Unknown' not in label_encoder.classes_:
    label_encoder.classes_ = list(label_encoder.classes_) + ['Unknown']

# Transform the 'tollID' column using the fitted label encoder
data['tollID'] = label_encoder.transform(data['tollID'])

# Drop unused columns
X = data.drop(columns=["total_passages", "date"])
y = data["total_passages"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
print(f'Model trained with MSE: {mse}')

# Ensure the output directory exists
output_dir = os.path.join(os.path.dirname(__file__), '..', 'models_passages')
os.makedirs(output_dir, exist_ok=True)  # Create the directory if it doesn't exist

# Save the model
model_path = os.path.join(output_dir, f"model_{args.company}.pkl")
with open(model_path, 'wb') as model_file:
    pickle.dump(model, model_file)
print(f'Model saved to {model_path}')

# Save the LabelEncoder
encoder_path = os.path.join(output_dir, f"company_label_encoder_{args.company}.pkl")
with open(encoder_path, 'wb') as le_file:
    pickle.dump(label_encoder, le_file)
print(f'LabelEncoder saved to {encoder_path}')
