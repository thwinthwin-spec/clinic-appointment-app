param(
  [string]$Output = "C:\Users\USER\Documents\Codex\2026-11-21\can-you-give-me-to-write\outputs\clinic-appointment-app.zip"
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$stage = Join-Path $env:TEMP 'clinic-appointment-app-zip-stage'

if (Test-Path -LiteralPath $stage) {
  Remove-Item -LiteralPath $stage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Get-ChildItem -LiteralPath $root -Recurse -File -Force | Where-Object {
  $full = $_.FullName
  $relative = $_.FullName.Substring($root.Length + 1)

  $excluded =
    $relative -match '(^|[\\/])\.git([\\/]|$)' -or
    $relative -match '(^|[\\/])node_modules([\\/]|$)' -or
    $relative -match '(^|[\\/])dist([\\/]|$)' -or
    $relative -match '(^|[\\/])build([\\/]|$)' -or
    $relative -match '(^|[\\/])\.env$' -or
    $relative -match '\.log$'

  -not $excluded
} | ForEach-Object {
  $relative = $_.FullName.Substring($root.Length + 1)
  $destination = Join-Path $stage $relative
  $parent = Split-Path -Parent $destination
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
  }
  Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
}

$outputDir = Split-Path -Parent $Output
if (-not (Test-Path -LiteralPath $outputDir)) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $Output -Force
Remove-Item -LiteralPath $stage -Recurse -Force

$files = (Get-ChildItem -LiteralPath $root -Recurse -File -Force | Where-Object {
  $relative = $_.FullName.Substring($root.Length + 1)
  -not ($relative -match '(^|[\\/])\.git([\\/]|$)' -or
         $relative -match '(^|[\\/])node_modules([\\/]|$)' -or
         $relative -match '(^|[\\/])dist([\\/]|$)' -or
         $relative -match '(^|[\\/])\.env$' -or
         $relative -match '\.log$')
}).Count

Write-Output "Created: $Output"
Write-Output "Source files: $files"
