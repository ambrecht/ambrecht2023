# Test-LastSessionAPI.ps1

# API-Endpunkt
$apiUrl = "https://api.ambrecht.de/api/typewriter/last"

# Dein API-Key (bitte anpassen)
$apiKey = "6daab3d925b627db58939ee135031fdf4910be7a68a723e389ed7f85c94391a1"

# Anfrage senden mit Header "x-api-key"
try {
    Write-Host "`n[Sende Anfrage an API...]"

    $response = Invoke-RestMethod -Uri $apiUrl -Method GET -Headers @{
        "x-api-key" = $apiKey
    }

    Write-Host "`n[Antwort erhalten:]"
    $response | ConvertTo-Json -Depth 5
}
catch {
    Write-Host "`n[Fehler beim Abrufen der letzten Session:]"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "HTTP Status: $($_.Exception.Response.StatusCode)"
        Write-Host "Antwort:"
        Write-Host $body
    } else {
        Write-Host "Fehler: $($_.Exception.Message)"
    }
}
