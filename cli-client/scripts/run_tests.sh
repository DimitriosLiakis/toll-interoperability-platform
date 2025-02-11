#!/usr/bin/env bash

# This script will run all numbered .sh test files (1.sh, 2.sh, ... , 60.sh).
# For each test file, it will:
#   - Read each non-empty, non-comment line as a command.
#   - Log the command and its output to a log file named test_<n>.log.
#   - Determine "success" by checking if the output does NOT contain certain error strings
#     (e.g., "Error", "error", "failed", "Failed", or "Access Denied").
#   - Keep track of how many commands succeed vs fail.
#   - At the end of each log file, print a summary with the success percentage
#     and any failed commands.

for i in {1..60}; do
  test_file="${i}.sh"
  log_file="test_${i}.log"

  if [ ! -f "$test_file" ]; then
    echo "Warning: ${test_file} does not exist, skipping..."
    continue
  fi

  # Counters
  success_count=0
  total_commands=0
  failed_commands=()

  # Clear or create the log file for this test
  echo "Starting test for ${test_file}" > "$log_file"
  echo "--------------------------------------" >> "$log_file"

  # Read each line of the test file
  while IFS= read -r line; do
    # Skip empty or comment lines
    if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
      continue
    fi

    ((total_commands++))
    echo "Command: $line" >> "$log_file"

    # Execute the command and capture output (stdout + stderr)
    output=$(eval "$line" 2>&1)

    # Log the output
    echo "Output:" >> "$log_file"
    echo "$output" >> "$log_file"
    echo "--------------------------------------" >> "$log_file"

    # Check for error strings in the output
    # If we detect "Error", "error", "failed", "Failed", or "Access Denied", consider it a failure
    if echo "$output" | grep -iqE "error|failed|access denied"; then
      failed_commands+=( "$line" )
    else
      ((success_count++))
    fi
  done < "$test_file"

  # Summary
  echo "Summary for ${test_file}:" >> "$log_file"
  echo "Total commands: $total_commands" >> "$log_file"
  echo "Successful commands: $success_count" >> "$log_file"

  if [ $total_commands -gt 0 ]; then
    success_percentage=$(awk "BEGIN { printf \"%.2f\", ($success_count/$total_commands)*100 }")
  else
    success_percentage="0.00"
  fi

  echo "Success percentage: $success_percentage%" >> "$log_file"

  if [ ${#failed_commands[@]} -gt 0 ]; then
    echo "Failed commands:" >> "$log_file"
    for cmd in "${failed_commands[@]}"; do
      echo "  - $cmd" >> "$log_file"
    done
  else
    echo "No failed commands" >> "$log_file"
  fi

  echo "========================================" >> "$log_file"
done
