from PIL import Image, ImageDraw, ImageFont
import os

# Create a 16x16 image with transparent background
img = Image.new('RGBA', (16, 16), (255, 255, 255, 0))
draw = ImageDraw.Draw(img)

# AeC colors
dark_blue = (0, 90, 156)  # #005A9C
cyan = (0, 169, 206)  # #00A9CE

# Since we can't fit "aec" text clearly at 16x16, let's create a simple icon
# Draw a simple geometric representation
# Left part - dark blue
draw.rectangle([0, 4, 5, 12], fill=dark_blue)
# Middle part - cyan
draw.rectangle([6, 4, 10, 12], fill=cyan)
# Right part - dark blue
draw.rectangle([11, 4, 15, 12], fill=dark_blue)

# Save as PNG
output_path = r'c:\AeC SaaS\mapeamentodeperfilaec-main\public\favicon-16x16.png'
img.save(output_path, 'PNG')
print(f"Favicon saved to: {output_path}")

# Also create a 32x32 version for better quality
img32 = Image.new('RGBA', (32, 32), (255, 255, 255, 0))
draw32 = ImageDraw.Draw(img32)
draw32.rectangle([0, 8, 10, 24], fill=dark_blue)
draw32.rectangle([11, 8, 21, 24], fill=cyan)
draw32.rectangle([22, 8, 31, 24], fill=dark_blue)
output_path32 = r'c:\AeC SaaS\mapeamentodeperfilaec-main\public\favicon-32x32.png'
img32.save(output_path32, 'PNG')
print(f"32x32 Favicon saved to: {output_path32}")
