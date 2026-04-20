# PC Heartbeat Script for Windows (PowerShell)
# Installer sur chaque PC Windows des employes
# Usage: .\heartbeat.ps1 -Matricule "ARIS-0001"

param(
    [Parameter(Mandatory=$true)]
    [string]$Matricule
)

$API_URL = "https://apiv2.aris-cc.com/api/pc-status/heartbeat"

Write-Host "PC Heartbeat started for $Matricule" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

while ($true) {
    try {
        $body = @{
            badge_code = $Matricule
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri $API_URL -Method Post -Body $body -ContentType "application/json" -TimeoutSec 10
        
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Heartbeat OK - PC marked as online" -ForegroundColor Green
    }
    catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Heartbeat failed: $_" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 60
}
