from PIL import Image
import os

# Get all PNG files in current directory
png_files = [f for f in os.listdir('.') if f.lower().endswith('.png')]

for file in png_files:
    img = Image.open(file).convert("RGBA")
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        cropped = img.crop(bbox)
        cropped.save(file)  # overwrite original
        print(f"Cropped {file}")
    else:
        print(f"No content found in {file}")
