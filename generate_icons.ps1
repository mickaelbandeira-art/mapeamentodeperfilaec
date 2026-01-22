
Add-Type -AssemblyName System.Drawing

$sourcePath = "c:\AeC SaaS\mapeamentodeperfilaec-main\public\logo-source.png"
$destDir = "c:\AeC SaaS\mapeamentodeperfilaec-main\public"

$sizes = @(
    @{ w=32; h=32; name="favicon-32x32.png" },
    @{ w=16; h=16; name="favicon-16x16.png" },
    @{ w=180; h=180; name="apple-touch-icon.png" },
    @{ w=192; h=192; name="android-chrome-192x192.png" }
)

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($size in $sizes) {
    $rect = New-Object System.Drawing.Rectangle 0, 0, $size.w, $size.h
    $destImage = New-Object System.Drawing.Bitmap $size.w, $size.h
    $destImage.SetResolution($sourceImage.HorizontalResolution, $sourceImage.VerticalResolution)
    
    $graphics = [System.Drawing.Graphics]::FromImage($destImage)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $graphics.DrawImage($sourceImage, $rect)
    
    $destPath = Join-Path $destDir $size.name
    $destImage.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destImage.Dispose()
    Write-Host "Created $($size.name)"
}

$sourceImage.Dispose()
