import os
import cv2
import numpy as np
from PIL import Image

def generate_transparent_master(src_jpg_path):
    bgr = cv2.imread(src_jpg_path)
    if bgr is None:
        raise FileNotFoundError(f"Could not load image: {src_jpg_path}")
    
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    cx, cy = 503.0, 501.5
    num_rays = 7200
    poly_pts = []
    
    for i in range(num_rays):
        deg = i * (360.0 / num_rays)
        rad = np.deg2rad(deg)
        cos_a, sin_a = np.cos(rad), np.sin(rad)
        
        edge_r = 428.0
        for r in np.arange(506.0, 420.0, -0.25):
            x = int(round(cx + r * cos_a))
            y = int(round(cy + r * sin_a))
            if 0 <= x < 1024 and 0 <= y < 1024:
                if gray[y, x] > 5:
                    edge_r = r
                    break
        # Slight margin (+0.75 px) to capture full gold antialiased edge
        poly_pts.append([cx + (edge_r + 0.75) * cos_a, cy + (edge_r + 0.75) * sin_a])

    scale = 4  # 4x supersampling for flawless subpixel edge smoothing
    mask_hi = np.zeros((1024 * scale, 1024 * scale), dtype=np.uint8)
    pts_hi = np.array([[int(round(p[0] * scale)), int(round(p[1] * scale))] for p in poly_pts], dtype=np.int32)
    cv2.fillPoly(mask_hi, [pts_hi], 255)

    mask_smooth = cv2.resize(mask_hi, (1024, 1024), interpolation=cv2.INTER_AREA)

    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    rgba = np.dstack([rgb, mask_smooth])
    master_img = Image.fromarray(rgba)

    # Crop to content and center symmetrically in a 1024x1024 canvas
    alpha_arr = np.array(master_img)[:, :, 3]
    ys, xs = np.where(alpha_arr > 0)
    bbox = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    cropped = master_img.crop(bbox)

    centered_1024 = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    offset_x = (1024 - cropped.width) // 2
    offset_y = (1024 - cropped.height) // 2
    centered_1024.paste(cropped, (offset_x, offset_y), cropped)
    return centered_1024

def make_splash(logo_img, target_width, target_height, logo_max_ratio=0.55):
    canvas = Image.new('RGBA', (target_width, target_height), (0, 0, 0, 0))
    max_logo_w = int(target_width * logo_max_ratio)
    max_logo_h = int(target_height * logo_max_ratio)
    logo_size = min(max_logo_w, max_logo_h, 512)
    
    resized_logo = logo_img.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    pos_x = (target_width - logo_size) // 2
    pos_y = (target_height - logo_size) // 2
    canvas.paste(resized_logo, (pos_x, pos_y), resized_logo)
    return canvas

def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    src_jpg = r'C:\Users\inria\.gemini\antigravity\brain\25332892-808f-4997-bb20-97d12c1e82c7\.user_uploaded\media_1790172595801.jpg'
    
    print("Extracting transparent emblem from:", src_jpg)
    master = generate_transparent_master(src_jpg)
    
    # 1. Update web assets
    icon_dir = os.path.join(repo_root, 'src', 'assets', 'icon')
    os.makedirs(icon_dir, exist_ok=True)
    
    last_codex_path = os.path.join(icon_dir, 'last_codex.png')
    favicon_path = os.path.join(icon_dir, 'favicon.png')
    
    # 512x512 high quality
    master_512 = master.resize((512, 512), Image.Resampling.LANCZOS)
    master_512.save(last_codex_path, 'PNG', optimize=True)
    master_512.save(favicon_path, 'PNG', optimize=True)
    print(f"Saved: {last_codex_path}")
    print(f"Saved: {favicon_path}")
    
    # Also save master 1024 in assets for reference if needed
    master_1024_path = os.path.join(icon_dir, 'last_codex_1024.png')
    master.save(master_1024_path, 'PNG', optimize=True)
    
    # 2. Update Android mipmap icons
    res_dir = os.path.join(repo_root, 'android', 'app', 'src', 'main', 'res')
    mipmap_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }
    
    for folder, size in mipmap_sizes.items():
        target_dir = os.path.join(res_dir, folder)
        if not os.path.exists(target_dir):
            continue
        
        # Standard launcher icon (fits full bounding box)
        icon_img = master.resize((size, size), Image.Resampling.LANCZOS)
        icon_img.save(os.path.join(target_dir, 'ic_launcher.png'), 'PNG')
        icon_img.save(os.path.join(target_dir, 'ic_launcher_round.png'), 'PNG')
        
        # Foreground icon for adaptive icons (fits safe zone ~75% of icon canvas)
        fg_canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        fg_size = int(size * 0.76)
        fg_resized = master.resize((fg_size, fg_size), Image.Resampling.LANCZOS)
        offset = (size - fg_size) // 2
        fg_canvas.paste(fg_resized, (offset, offset), fg_resized)
        fg_canvas.save(os.path.join(target_dir, 'ic_launcher_foreground.png'), 'PNG')
        print(f"Updated icons in {folder} ({size}x{size})")
        
    # 3. Update Android splash screens
    splash_targets = [
        ('drawable', 512, 512),
        ('drawable-land-hdpi', 800, 480),
        ('drawable-land-mdpi', 480, 320),
        ('drawable-land-xhdpi', 1280, 720),
        ('drawable-land-xxhdpi', 1600, 960),
        ('drawable-land-xxxhdpi', 1920, 1280),
        ('drawable-port-hdpi', 480, 800),
        ('drawable-port-mdpi', 320, 480),
        ('drawable-port-xhdpi', 720, 1280),
        ('drawable-port-xxhdpi', 960, 1600),
        ('drawable-port-xxxhdpi', 1280, 1920),
    ]
    
    for folder, w, h in splash_targets:
        target_dir = os.path.join(res_dir, folder)
        if not os.path.exists(target_dir):
            continue
        splash_file = os.path.join(target_dir, 'splash.png')
        splash_img = make_splash(master, w, h)
        splash_img.save(splash_file, 'PNG')
        print(f"Updated splash: {folder}/splash.png ({w}x{h})")

    # 4. Update adaptive icon background color
    bg_xml_path = os.path.join(res_dir, 'values', 'ic_launcher_background.xml')
    if os.path.exists(bg_xml_path):
        bg_xml_content = '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0b0e14</color>
</resources>
'''
        with open(bg_xml_path, 'w', encoding='utf-8') as f:
            f.write(bg_xml_content)
        print("Updated ic_launcher_background.xml to #0b0e14")
        
    print("\nAll icons and splash screens successfully generated!")

if __name__ == '__main__':
    main()
