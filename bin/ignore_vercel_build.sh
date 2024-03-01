#!/bin/bash

author=$(echo $VERCEL_GIT_COMMIT_AUTHOR_LOGIN)

users_file="./bin/vercel-users.txt"
author_found=false

while IFS= read -r line; do
  if [[ "$line" == "$author" ]]; then
    author_found=true
    break
  fi
done < "$users_file"

if $author_found; then
  echo "Author $author found in $users_file"
  exit 1
else
  echo "Author $author not found in $users_file"
  exit 0 
fi