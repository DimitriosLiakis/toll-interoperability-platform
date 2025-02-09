import argparse
import os
import pickle
import pandas as pd
import json
from sklearn.preprocessing import LabelEncoder

parser = argparse.ArgumentParser(description="Make predictions using a trained RandomForest model.")
parser.add_argument('--model_path', required=True, help='Path to the trained model file (Pickle format)')
parser.add_argument('--input_csv', required=True, help='Path to the input CSV file containing features for prediction')
parser.add_argument('--output_csv', required=True, help='Path to save the predictions as a CSV file')
parser.add_argument('--company', required=True, help='Company identifier for dynamic output naming')
args = parser.parse_args()

# Load the trained model
with open(args.model_path, 'rb') as model_file:
    model = pickle.load(model_file)

# Load the LabelEncoder
le_path = os.path.join(os.path.dirname(args.model_path), f"company_label_encoder_{args.company}.pkl")
with open(le_path, 'rb') as le_file:
    le = pickle.load(le_file)

# Load the input CSV data
data = pd.read_csv(args.input_csv)

# Preprocessing the input data to add additional features
data['passage_date'] = pd.to_datetime(data['passage_date'])
data['day_of_week'] = data['passage_date'].dt.dayofweek
data['month'] = data['passage_date'].dt.month
data['year'] = data['passage_date'].dt.year

# Check if 'company' column exists in input data
if 'company' not in data.columns:
    raise ValueError("'company' column is missing from the input CSV data.")

# Apply the same LabelEncoder used during training
data['company'] = le.transform(data['company'])

# Prepare the features for prediction
# X = data[['company', 'day_of_week', 'month', 'year']]
X = data.drop(columns=['passage_date', 'company'])


# Make predictions
predictions = model.predict(X)

# Add the predictions to the dataframe
data['predicted_hour'] = predictions

# Convert datetime columns to strings before dumping to JSON
data['passage_date'] = data['passage_date'].dt.strftime('%Y-%m-%d %H:%M:%S')

# Reverse the encoding of the 'company' column using inverse_transform
data['company'] = le.inverse_transform(data['company'])

# Save the predictions to the specified output path
data.to_csv(args.output_csv, index=False)

# Print the result in JSON format
print(json.dumps(data.to_dict(orient='records')))
