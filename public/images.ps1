# Pfad zum Bilder-Verzeichnis und zur generierten JS-Datei
$imageDir = ".\public\images"
$outputFile = "\app"

# Leeren Sie die Ausgabedatei, falls sie bereits existiert
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# Schreiben Sie den Anfang des JavaScript-Arrays in die Ausgabedatei
Add-Content -Path $outputFile -Value "const data = ["

# Abrufen der Bilddateien
$files = Get-ChildItem -Path $imageDir

# Iterieren durch die Dateien und schreiben der Objekte in die JS-Datei
for ($i=0; $i -lt $files.Length; $i++) {
    $file = $files[$i]
    $filename = $file.Name
    $nameWithoutExtension = [System.IO.Path]::GetFileNameWithoutExtension($filename)
    $item = @"
    {
        id: $i,
        name: '$nameWithoutExtension',
        hasCalled: false,
        image: '/images/$filename',
        slug: '$nameWithoutExtension',
        text: ''
    }
"@
    # Wenn es nicht die letzte Datei ist, fügen Sie ein Komma hinzu
    if ($i -lt $files.Length - 1) {
        $item += ","
    }
    Add-Content -Path $outputFile -Value $item
}

# Schließen des JavaScript-Arrays
Add-Content -Path $outputFile -Value "];`nexport default data;"

# Script beendet, informieren Sie den Benutzer
Write-Host "JavaScript data file has been generated."
