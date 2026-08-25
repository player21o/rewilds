find . \
    \( -name "node_modules" -o -name ".git" -o -name "dist" -o -name "public" \) -prune \
    -o -name "output.txt" \
    -o -type f -print0 | while IFS= read -r -d '' f; do
    echo "$f"
    cat "$f"
    echo ""
done > output.txt