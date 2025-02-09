import argparse
import pandas as pd
import pickle
import json
from sklearn.preprocessing import LabelEncoder

# Parse arguments
parser = argparse.ArgumentParser(description="Make predictions using a trained RandomForest model.")
parser.add_argument('--model_path', required=True, help='Path to the trained model file (Pickle format)')
parser.add_argument('--input_csv', required=True, help='Path to the input CSV file containing features for prediction')
parser.add_argument('--output_csv', required=True, help='Path to save the predictions as a CSV file')
parser.add_argument('--company', required=True, help='Company identifier for dynamic output naming')
args = parser.parse_args()

# Load the trained model
with open(args.model_path, 'rb') as model_file:
    model = pickle.load(model_file)

# Load input data
input_data = pd.read_csv(args.input_csv)

# Ensure 'date' column is in datetime format
input_data['date'] = pd.to_datetime(input_data['date'])

# Extract date features
input_data['Year'] = input_data['date'].dt.year
input_data['Month'] = input_data['date'].dt.month
input_data['Day'] = input_data['date'].dt.day
input_data['DayOfYear'] = input_data['date'].dt.dayofyear

# Encode 'tollID' column
label_encoder = LabelEncoder()

# Try to load saved LabelEncoder or fit a new one based on input data
try:
    # Attempt to load the LabelEncoder saved during training
    with open('label_encoder.pkl', 'rb') as le_file:
        label_encoder = pickle.load(le_file)
except FileNotFoundError:
    # If no saved encoder, fit it with the unique 'tollID' values from the input data
    categories = input_data['tollID'].unique()  # Ensure categories is a 1D array
    label_encoder.fit(categories)

input_data['tollID'] = label_encoder.transform(input_data['tollID'])

# Drop unused columns
columns_for_prediction = ['tollID', 'Year', 'Month', 'Day', 'DayOfYear']
input_data = input_data[columns_for_prediction]

# Ensure input data matches the model's expected feature count
if hasattr(model, "n_features_in_"):
    expected_features = model.n_features_in_
    if input_data.shape[1] != expected_features:
        raise ValueError(f"Expected {expected_features} features, but found {input_data.shape[1]} in the input CSV.")

# Make predictions
predictions = model.predict(input_data)

# Save predictions to a new CSV file with dynamic naming
output_file = f"{args.output_csv.rstrip('.csv')}_{args.company}.csv"
output_data = input_data.copy()
output_data['predictions'] = predictions
output_data.to_csv(output_file, index=False)

# Prepare the result as a dictionary for JSON output
result = {
    "message": f"Predictions saved to {output_file}",
    "predictions": predictions.tolist()  # Convert predictions to list for JSON compatibility
}

# Output the result as JSON
print(json.dumps(result))