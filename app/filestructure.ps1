# Zielverzeichnis
$basePath = "C:\Users\Ambrecht\Downloads\typewriter XXX\typewriter-improved\app\typewriter\components"

# Liste der veralteten Dateien (PascalCase)
$filesToDelete = @(
    "Button.tsx",
    "InputField.tsx",
    "ControlBar.tsx",
    "FullscreenExitButton.tsx",
    "LineBreakSettingsPanel.tsx",
    "SaveButton.tsx",
    "WritingArea.tsx"
)

# Löschen
foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $basePath $file
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force
        Write-Output "Datei gelöscht: $file"
    } else {
        Write-Output "Nicht gefunden (wurde evtl. schon entfernt): $file"
    }
}
