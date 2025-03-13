$codebaseFile = "C:\Users\Ambrecht\Downloads\codebase.txt"

# Sicherstellen, dass die Datei existiert
if (Test-Path -LiteralPath $codebaseFile) {
    Remove-Item -LiteralPath $codebaseFile -Force
}

# Pfade aus der Codebase extrahieren (Escaping von eckigen Klammern `[` und `]`)
$files = @(
    "E:\ambrecht2024\25092024\ambrecht2023\hooks\useEditorLogic.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorFooter.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorHeader.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\EditorTextarea.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\components\Editor\index.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\lib\context\SessionContext.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\app\type\page.tsx"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\session\[id]\route.ts" -replace "\[", "`[" -replace "\]", "`]"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\session\route.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\sessions\route.ts"
    "E:\ambrecht2024\25092024\ambrecht2023\app\api\sessions\[id]\route.ts" -replace "\[", "`[" -replace "\]", "`]"
)

# Neue Datei mit aktuellen Inhalten erstellen
foreach ($file in $files) {
    if (Test-Path -LiteralPath $file) {
        Add-Content -LiteralPath $codebaseFile -Value "Filepfad: $file"
        Add-Content -LiteralPath $codebaseFile -Value "Fileinhalt:`r`n"
        Get-Content -LiteralPath $file -Raw | Add-Content -LiteralPath $codebaseFile
        Add-Content -LiteralPath $codebaseFile -Value "`r`n-------------------------`r`n"
    } else {
        Add-Content -LiteralPath $codebaseFile -Value "Filepfad: $file (Datei nicht gefunden)`r`n"
        Add-Content -LiteralPath $codebaseFile -Value "-------------------------`r`n"
    }
}

Write-Host "Die Datei wurde erfolgreich aktualisiert: $codebaseFile"
