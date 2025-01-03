#!/bin/bash
# Merge stavros into testing, taking only newer files.

# Switch to the target branch
git checkout testing || exit 1

# Merge with no commit
git merge --no-commit --no-ff stavros || exit 1

# Loop through conflicted files and resolve based on timestamps
for file in $(git diff --name-only --diff-filter=U); do
    timestamp_testing=$(git log -1 --pretty="%ct" testing -- "$file" 2>/dev/null || echo 0)
    timestamp_stavros=$(git log -1 --pretty="%ct" stavros -- "$file" 2>/dev/null || echo 0)

    if [[ $timestamp_testing -lt $timestamp_stavros ]]; then
        echo "Taking newer version of $file from stavros"
        git checkout stavros -- "$file"
    else
        echo "Keeping current version of $file from testing"
        git restore --source=HEAD --staged "$file"
    fi
    git add "$file"
done

# Commit the merge
git commit -m "Merged stavros into testing, keeping newer files" || exit 1