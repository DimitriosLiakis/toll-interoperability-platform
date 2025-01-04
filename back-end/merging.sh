#!/bin/bash
# Merge stavros into testing, taking only newer files.

# Switch to the target branch
git checkout main || exit 1

# Merge with no commit
git merge --no-commit --no-ff testing || exit 1

# Loop through conflicted files and resolve based on timestamps
for file in $(git diff --name-only --diff-filter=U); do
    timestamp_main=$(git log -1 --pretty="%ct" main -- "$file" 2>/dev/null || echo 0)
    timestamp_testing=$(git log -1 --pretty="%ct" testing -- "$file" 2>/dev/null || echo 0)

    if [[ $timestamp_main -lt $timestamp_testing ]]; then
        echo "Taking newer version of $file from testing"
        git checkout testing -- "$file"
    else
        echo "Keeping current version of $file from main"
        git restore --source=HEAD --staged "$file"
    fi
    git add "$file"
done

# Commit the merge
git commit -m "Merged testing into main, keeping newer files" || exit 1