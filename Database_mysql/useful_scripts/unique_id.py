import pandas as pd

df = pd.read_csv('tollstations2024.csv') 

operator_counts = df['OpID'].value_counts()

# Print a custom message for each operator
for operator in operator_counts.items():
    print(f"Operator id is {operator}")
