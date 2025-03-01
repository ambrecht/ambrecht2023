# Setze den Pfad des zu untersuchenden Ordners
$folderPath = "E:\ambrecht2024\25092024\ambrecht2023\app"

# Setze den Dateipfad der Ausgabedatei als JSON mit Datum
$outputFile = "$([Environment]::GetFolderPath('Desktop'))\filestructure_$((Get-Date).ToString('yyyyMMdd')).json"

# Falls die Datei existiert, löschen
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# Optionale Filterung: Nur relevante Dateitypen einbeziehen
$fileExtensions = @(".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".css", ".scss")

# Liste für die Dateistruktur
$fileList = @()

# Funktion zum Einlesen von Datei-Inhalten
function Get-FileStructure {
    param (
        [string]$filePath
    )

    # Maximale Zeichenanzahl für den Inhalt (z. B. 10.000 Zeichen)
    $maxContentLength = 10000 

    # Lese den Dateiinhalt (Fehlertolerant)
    try {
        $fileContent = Get-Content -Path $filePath -Raw -ErrorAction Stop

        # Falls die Datei zu groß ist, kürzen
        if ($fileContent.Length -gt $maxContentLength) {
            $fileContent = $fileContent.Substring(0, $maxContentLength) + "`n... [Content Truncated]"
        }
    } catch {
        $fileContent = "[Error reading file]"
    }

    # Strukturierte Rückgabe als PowerShell-Objekt
    return [PSCustomObject]@{
        file    = $filePath
        content = $fileContent
    }
}

# Durchsuche alle relevanten Dateien im Ordner rekursiv
Get-ChildItem -Path $folderPath -File -Recurse | Where-Object { $_.Extension -in $fileExtensions } | ForEach-Object {
    $fileList += Get-FileStructure -filePath $_.FullName
}

# Konvertiere die Dateistruktur in JSON und speichere sie
$fileList | ConvertTo-Json -Depth 3 | Set-Content -Path $outputFile -Encoding UTF8

# Rückmeldung für den Benutzer
Write-Host "Die Dateistruktur wurde in $outputFile gespeichert."
