# Cleanup-Typewriter-Codebase.ps1
# PowerShell-Skript zur Bereinigung und Vereinheitlichung der Typewriter-Codebase

$rootPath = "E:\ambrecht2024\25092024\ambrecht2023\app\typewriter"
$backupFolder = "$rootPath\.backup_deleted_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# Liste veralteter/duplizierter Dateien (konsistente Schreibweise ist bereits in /components vorhanden)
$filesToDelete = @(
    "ControlBar.tsx",
    "FullscreenExitButton.tsx",
    "LineBreakSettingsPanel.tsx",
    "SaveButton.tsx",
    "WritingArea.tsx",
    "InputField.tsx",
    "lineBreakLogic.ts",
    "store.ts"
)

# Sicherungsordner anlegen
New-Item -ItemType Directory -Force -Path $backupFolder | Out-Null

# Lösche alte Dateien und sichere sie
foreach ($file in $filesToDelete) {
    $fullPath = Join-Path $rootPath $file
    if (Test-Path $fullPath) {
        Write-Host "Sichere und lösche: $file" -ForegroundColor Yellow
        Move-Item -Path $fullPath -Destination $backupFolder
    } else {
        Write-Host "Nicht gefunden (bereits gelöscht?): $file" -ForegroundColor DarkGray
    }
}

# Mapping inkonsistenter Importe => korrekte Schreibweise
$importRewrites = @{
    './components/Button'                   = './components/button'
    './components/InputField'               = './components/input-field'
    './components/SaveButton'               = './components/save-button'
    './components/ControlBar'               = './components/control-bar'
    './components/FullscreenExitButton'     = './components/fullscreen-exit-button'
    './components/LineBreakSettingsPanel'   = './components/line-break-settings-panel'
}

# Rekursiv alle .tsx-Dateien scannen und Importe korrigieren
Get-ChildItem -Path $rootPath -Recurse -Include *.tsx | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $originalContent = $content
    foreach ($key in $importRewrites.Keys) {
        $content = $content -replace [regex]::Escape($key), $importRewrites[$key]
    }

    if ($content -ne $originalContent) {
        Write-Host "Passe Importe an in: $($_.Name)" -ForegroundColor Green
        Set-Content -Path $_.FullName -Value $content -Encoding UTF8
    }
}

Write-Host "`n✅ Bereinigung abgeschlossen. Sicherungen unter:" -ForegroundColor Cyan
Write-Host $backupFolder -ForegroundColor Cyan
