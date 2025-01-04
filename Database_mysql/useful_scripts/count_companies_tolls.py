import pandas as pd

df = pd.read_csv('tollstations2024.csv') 

operator_counts = df['Operator'].value_counts()

# Print a custom message for each operator
for operator, count in operator_counts.items():
    print(f"Operator {operator} has {count} tolls.")

operator_counts.to_csv('operator_counts.csv', header=True)

