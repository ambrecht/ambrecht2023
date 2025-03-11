mkdir -p codebase  # Sicherstellen, dass der Ordner existiert
OUTPUT_FILE="codebase/changes.txt"

# Überschrift schreiben
echo "======================" > "$OUTPUT_FILE"
echo " CODEBASE ÄNDERUNGEN" >> "$OUTPUT_FILE"
echo "======================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "📂 Geänderte & neue Dateien:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Liste der Dateien sammeln
FILE_LIST=$({
    git diff --name-only --diff-filter=AM;
    git ls-files --others --exclude-standard;
} | sort -u)

# Dateiliste in die Ausgabe schreiben
for file in $FILE_LIST; do
    if [[ -f "$file" ]]; then
        echo "- $file" >> "$OUTPUT_FILE"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "======================" >> "$OUTPUT_FILE"
echo " DATEIINHALTE" >> "$OUTPUT_FILE"
echo "======================" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Inhalte der Dateien einfügen
for file in $FILE_LIST; do
    if [[ -f "$file" ]]; then
        echo "--------------------------------------" >> "$OUTPUT_FILE"
        echo "📄 Datei: $file" >> "$OUTPUT_FILE"
        echo "--------------------------------------" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

echo "✅ Änderungen gespeichert in $OUTPUT_FILE"
