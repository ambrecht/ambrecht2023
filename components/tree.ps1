# Funktion, die einen Ordner rekursiv abläuft und eine Baumstruktur als Hashtable erzeugt
function Get-DirectoryTree {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    # Erstellen eines neuen Objekts für den aktuellen Pfad
    $node = [ordered]@{
        Name     = Split-Path -Path $Path -Leaf
        FullPath = (Resolve-Path $Path).Path
    }

    # Prüfen, ob es sich um ein Verzeichnis handelt
    if (Test-Path $Path -PathType Container) {
        $node.Type = "Directory"
        $children = Get-ChildItem -Path $Path -Force | Sort-Object Name
        $node.Children = @()

        foreach ($child in $children) {
            $childTree = Get-DirectoryTree -Path $child.FullName
            $node.Children += $childTree
        }
    }
    else {
        $node.Type = "File"
        # Optional: Erweiterungsinformation, falls erwünscht
        $node.Extension = [System.IO.Path]::GetExtension($Path)
    }

    return $node
}

# Pfad zur Codebase anpassen
$codeBasePath = "E:\ambrecht2024\25092024\ambrecht2023"

# Erzeugen der Baumstruktur und Ausgabe als JSON
$treeStructure = Get-DirectoryTree -Path $codeBasePath
$treeStructure | ConvertTo-Json -Depth 10
