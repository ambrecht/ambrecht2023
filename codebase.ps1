$codebaseFile = "C:\Users\Ambrecht\Downloads\codebase.txt"

# Sicherstellen, dass die Datei existiert
if (Test-Path $codebaseFile) {
    Remove-Item $codebaseFile -Force
}

# Pfade aus der Codebase extrahieren
$files = @(
    "E:\ambrecht2024\25092024\ambrecht2023\hooks\useEditorLogic.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorFooter.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorHeader.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorTextarea.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\index.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\lib\context\SessionContext.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\app\type\page.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\session\[id]\route.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\session\route.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\sessions\route.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\sessions\[id]\route.ts"

)

# Neue Datei mit aktuellen Inhalten erstellen
foreach ($file in $files) {
    if (Test-Path $file) {
        Add-Content -Path $codebaseFile -Value "Filepfad: $file"
        Add-Content -Path $codebaseFile -Value "Fileinhalt:`r`n"
        Get-Content -Path $file -Raw | Add-Content -Path $codebaseFile
        Add-Content -Path $codebaseFile -Value "`r`n-------------------------`r`n"
    } else {
        Add-Content -Path $codebaseFile -Value "Filepfad: $file (Datei nicht gefunden)`r`n"
        Add-Content -Path $codebaseFile -Value "-------------------------`r`n"
    }
}

Write-Host "Die Datei wurde erfolgreich aktualisiert: $codebaseFile"
