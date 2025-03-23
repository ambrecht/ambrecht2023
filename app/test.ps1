# API-URL und API-Schlüssel
$apiUrl = "http://api.ambrecht.de:3001/api/typewriter/save"
$apiKey = "6daab3d925b627db58939ee135031fdf4910be7a68a723e389ed7f85c94391a1"  # Ersetze dies durch deinen API-Schlüssel

# Request-Body (JSON-Daten)
$body = @{
    text = "Dies ist ein Testtext"
    wordCount = 5
    letterCount = 17
} | ConvertTo-Json

# Header (API-Schlüssel und Content-Type)
$headers = @{
    "Content-Type" = "application/json"
    "x-api-key" = $apiKey
}

# POST-Anfrage senden
try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $body
    Write-Host "✅ Erfolgreich: Text wurde gespeichert." -ForegroundColor Green
    Write-Host "Antwort der API:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Fehler beim Senden der Anfrage:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}