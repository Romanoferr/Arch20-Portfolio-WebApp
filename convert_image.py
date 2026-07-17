import os
import requests
from PIL import Image
from pillow_heif import register_heif_opener

register_heif_opener()
url = 'https://skgetxxliperptipaitk.supabase.co/storage/v1/object/sign/Arch20-Portfolio-Storage/Sobre/IMG_6006.HEIC?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iZWFiNDk3OC02MjZjLTQ3MWYtOGEzMC1kYjNlYWJlYTA2YWUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBcmNoMjAtUG9ydGZvbGlvLVN0b3JhZ2UvU29icmUvSU1HXzYwMDYuSEVJQyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODQzMjYyODAsImV4cCI6MjA5OTY4NjI4MH0.c4oKX3-0tnTqSr_p1OCvB0GPeDlKtkHvUQuUIvyuSZw'
out_dir = 'public/images'
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'sobre-perfil.jpg')
response = requests.get(url, timeout=60)
response.raise_for_status()
with open('tmp.heic', 'wb') as f:
    f.write(response.content)
img = Image.open('tmp.heic')
img = img.convert('RGB')
img.save(out_path, quality=90)
os.remove('tmp.heic')
print(out_path)
print(os.path.getsize(out_path))
