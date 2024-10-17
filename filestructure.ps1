# Setze den Pfad des zu untersuchenden Ordners
$folderPath = "E:\ambrecht2024\25092024\ambrecht2023\app\heizlast"

# Setze den Dateipfad der Ausgabedatei auf dem Desktop mit dem aktuellen Datum
$outputFile = "$([Environment]::GetFolderPath('Desktop'))\filestructure_$((Get-Date).ToString('yyyyMMdd')).txt"

# Lösche die Ausgabedatei, falls sie bereits existiert
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}

# Funktion, um die Datei-Inhalte zu schreiben
function Write-FileStructure {
    param (
        [string]$filePath
    )

    # Lese den Dateiinhalt
    $fileContent = Get-Content -Path $filePath -Raw

    # Füge den Dateipfad und den Inhalt zur Ausgabedatei hinzu
    Add-Content -Path $outputFile -Value "file: $filePath"
    Add-Content -Path $outputFile -Value "content:"
    Add-Content -Path $outputFile -Value $fileContent
    Add-Content -Path $outputFile -Value "`n`n" # Leere Zeilen als Trennung
}

# Durchsuche alle Dateien im Ordner rekursiv
Get-ChildItem -Path $folderPath -File -Recurse | ForEach-Object {
    Write-FileStructure -filePath $_.FullName
}

# Rückmeldung für den Benutzer
Write-Host "Die Dateistruktur wurde in $outputFile gespeichert."
