# codebase.ps1
# Valider JSONL-Export, stabil in Windows PowerShell 5.1

$RootPath = "E:\ambrecht2024\ambrecht\components\SessionView"
$OutFile  = "E:\ambrecht2024\ambrecht\components\SessionView\codebase.export.jsonl"
$ErrLog   = "E:\ambrecht2024\ambrecht\components\SessionView\codebase.export.errors.log"

$Extensions = @(
  ".ts",".tsx",".js",".jsx",".mjs",".cjs",
  ".css",".scss",".sass",".less",
  ".html",".md",".mdx",
  ".json",".yml",".yaml",".toml",
  ".env",".graphql",".gql",
  ".txt"
)

$ExcludeDirNames = @(
  "node_modules",".git",".next","dist","build","out","coverage",
  ".turbo",".vercel",".cache"
)

# Stabilitätsbremsen
$MaxBytesPerFile = 256KB     # 0 = aus
$SkipMinified    = $true     # *.min.js / *.min.css skippen
$MaxFiles        = 0         # 0 = kein Limit

$ProgressPreference = "SilentlyContinue"

function Write-Err {
  param([string]$msg)
  $ts = (Get-Date).ToString("o")
  Add-Content -LiteralPath $ErrLog -Encoding utf8 -Value ("[$ts] " + $msg)
}

function Should-ExcludeDirName {
  param([string]$name)
  foreach ($d in $ExcludeDirNames) {
    if ($name -ieq $d) { return $true }
  }
  return $false
}

function Is-ReparsePoint {
  param([System.IO.DirectoryInfo]$dir)
  try { return (($dir.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) }
  catch { return $true }
}

function Get-RelativePathCompat {
  param([string]$BasePath, [string]$FullPath)

  $base = (Resolve-Path -LiteralPath $BasePath).Path
  $full = (Resolve-Path -LiteralPath $FullPath).Path

  if (-not $base.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
    $base = $base + [System.IO.Path]::DirectorySeparatorChar
  }

  $rel = ([Uri]$base).MakeRelativeUri([Uri]$full).ToString()
  $rel = [Uri]::UnescapeDataString($rel) -replace '/', '\'
  return $rel
}

function Get-LanguageFromExtension {
  param([string]$Ext)
  switch ($Ext.ToLowerInvariant()) {
    ".ts"   { "typescript" }
    ".tsx"  { "typescriptreact" }
    ".js"   { "javascript" }
    ".jsx"  { "javascriptreact" }
    ".mjs"  { "javascript" }
    ".cjs"  { "javascript" }
    ".css"  { "css" }
    ".scss" { "scss" }
    ".sass" { "sass" }
    ".less" { "less" }
    ".html" { "html" }
    ".md"   { "markdown" }
    ".mdx"  { "mdx" }
    ".json" { "json" }
    ".yml"  { "yaml" }
    ".yaml" { "yaml" }
    ".toml" { "toml" }
    ".env"  { "dotenv" }
    ".graphql" { "graphql" }
    ".gql"     { "graphql" }
    default { "text" }
  }
}

function Read-FileTextSafe {
  param([string]$FullPath)

  try {
    $utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
    return [System.IO.File]::ReadAllText($FullPath, $utf8Strict)
  } catch {
    try { return [System.IO.File]::ReadAllText($FullPath, [System.Text.Encoding]::Default) }
    catch { return $null }
  }
}

# Serializer (sauberes JSON escaping)
Add-Type -AssemblyName System.Web.Extensions
$ser = New-Object System.Web.Script.Serialization.JavaScriptSerializer
$ser.MaxJsonLength = [int]::MaxValue

# Output vorbereiten
$dir = Split-Path -Parent $OutFile
if (-not (Test-Path -LiteralPath $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
Remove-Item -LiteralPath $ErrLog -ErrorAction SilentlyContinue

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$sw = New-Object System.IO.StreamWriter($OutFile, $false, $utf8NoBom)

$exported = 0
$skipped  = 0

try {
  # Header
  $header = @{
    _type       = "codebase_header"
    rootPath    = $RootPath
    generatedAt = (Get-Date).ToString("o")
    format      = "jsonl"
    maxBytesPerFile = [int]$MaxBytesPerFile
    skipMinified    = [bool]$SkipMinified
  }
  $sw.WriteLine($ser.Serialize($header))

  # DFS ohne Junction-Loops
  $stack = New-Object System.Collections.Generic.Stack[System.IO.DirectoryInfo]
  $stack.Push((New-Object System.IO.DirectoryInfo($RootPath)))

  while ($stack.Count -gt 0) {
    $dirInfo = $stack.Pop()

    if (Should-ExcludeDirName $dirInfo.Name) { continue }
    if (Is-ReparsePoint $dirInfo) { continue }

    $subDirs = @()
    try { $subDirs = $dirInfo.EnumerateDirectories() } catch { Write-Err "DIR ENUM FAIL: $($dirInfo.FullName) :: $($_.Exception.Message)" }
    foreach ($sd in $subDirs) {
      if (-not (Should-ExcludeDirName $sd.Name) -and -not (Is-ReparsePoint $sd)) {
        $stack.Push($sd)
      }
    }

    $dirFiles = @()
    try { $dirFiles = $dirInfo.EnumerateFiles() } catch { Write-Err "FILE ENUM FAIL: $($dirInfo.FullName) :: $($_.Exception.Message)" }

    foreach ($f in $dirFiles) {
      if ($MaxFiles -gt 0 -and $exported -ge $MaxFiles) { break }

      $ext = $f.Extension.ToLowerInvariant()
      if (-not ($Extensions -contains $ext)) { continue }

      if ($SkipMinified -and $f.Name -match '\.min\.(js|css)$') { $skipped++; continue }
      if ($MaxBytesPerFile -gt 0 -and $f.Length -gt $MaxBytesPerFile) { $skipped++; continue }

      $content = Read-FileTextSafe -FullPath $f.FullName
      if ($null -eq $content) { $skipped++; Write-Err "READ FAIL: $($f.FullName)"; continue }

      $relPath = $f.FullName
      try { $relPath = Get-RelativePathCompat -BasePath $RootPath -FullPath $f.FullName } catch { }

      $hash = $null
      try { $hash = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash } catch { $hash = $null }

      $lineCount = 0
      if ($content.Length -gt 0) { $lineCount = ([regex]::Matches($content, "`n")).Count + 1 }

      $obj = @{
        _type         = "file"
        relativePath  = $relPath
        filePath      = $f.FullName
        fileName      = $f.Name
        extension     = $f.Extension
        language      = (Get-LanguageFromExtension -Ext $f.Extension)
        sizeBytes     = [long]$f.Length
        lastWriteTime = $f.LastWriteTime.ToString("o")
        sha256        = $hash
        lineCount     = [int]$lineCount
        content       = $content
      }

      $sw.WriteLine($ser.Serialize($obj))
      $exported++

      if (($exported % 25) -eq 0) { $sw.Flush() }
    }

    if ($MaxFiles -gt 0 -and $exported -ge $MaxFiles) { break }
  }

  # Footer
  $footer = @{
    _type      = "codebase_footer"
    fileCount  = [int]$exported
    skipped    = [int]$skipped
    finishedAt = (Get-Date).ToString("o")
  }
  $sw.WriteLine($ser.Serialize($footer))
}
finally {
  $sw.Flush()
  $sw.Close()
}

Write-Host "Fertig."
Write-Host ("Exportiert: " + $exported)
Write-Host ("Übersprungen: " + $skipped)
Write-Host ("Ziel: " + $OutFile)
Write-Host ("Fehlerlog: " + $ErrLog)
