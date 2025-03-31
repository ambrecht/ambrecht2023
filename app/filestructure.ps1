# Funktion: Gibt alle Dateipfade und deren Inhalt aus – ohne Schnickschnack
function Get-FlatFileDump {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $sb = [System.Text.StringBuilder]::new()

    $items = Get-ChildItem -Path $Path -Recurse -File -Force

    foreach ($file in $items) {
        $null = $sb.AppendLine($file.FullName)
        try {
            $content = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop
            if (-not [string]::IsNullOrWhiteSpace($content)) {
                $null = $sb.AppendLine($content)
            } else {
                $null = $sb.AppendLine("[Leer]")
            }
        }
        catch {
            $null = $sb.AppendLine("[Fehler beim Lesen: $_]")
        }
        $null = $sb.AppendLine("")  # Leerzeile zwischen Dateien
    }

    return $sb.ToString()
}

# Zielpfad hier anpassen
$targetPath = "E:\ambrecht2024\25092024\ambrecht2023\app\typewriter"

# Ergebnis erzeugen
$output = Get-FlatFileDump -Path $targetPath

# In Konsole anzeigen
Write-Host $output

# In Zwischenablage kopieren
$output | Set-Clipboard

Write-Host "`n✅ Alle Dateipfade mit Inhalt wurden in die Zwischenablage kopiert."
