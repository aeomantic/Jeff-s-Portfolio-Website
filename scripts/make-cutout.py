"""Cut the spinning cat out of its flat grey background.

Usage: python -I cutout.py <src.png> <out.png> <preview_dir>

Approach (background is a single flat colour, ~#DDDDDD):
  1. Flood-fill background from the borders using colour distance.
  2. Keep the largest foreground blob, fill holes.
  3. Near the silhouette, estimate true alpha by projecting each pixel onto the
     line between the background colour and the nearest "solid" fur colour.
     This keeps fine fur/whisker edges and removes the grey fringe.
  4. Replace edge RGB with nearby solid fur colour (colour decontamination).
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out, preview_dir = sys.argv[1], sys.argv[2], sys.argv[3]

img = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
h, w, _ = img.shape

border = np.concatenate([img[0], img[-1], img[:, 0], img[:, -1]])
bg = np.median(border, axis=0)
print("background colour", bg)

dist = np.sqrt(((img - bg) ** 2).sum(-1))

# 1. background = low-distance pixels connected to the border
cand = dist < 13
lab, _ = ndi.label(cand)
edge_labels = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
edge_labels = edge_labels[edge_labels != 0]
bgmask = np.isin(lab, edge_labels)
fg = ~bgmask

# 2. largest component, fill holes, remove specks
fg = ndi.binary_opening(fg, iterations=1)
lab2, n2 = ndi.label(fg)
sizes = ndi.sum(fg, lab2, range(1, n2 + 1))
fg = lab2 == (1 + int(np.argmax(sizes)))
fg = ndi.binary_fill_holes(fg)
print("foreground pixels", int(fg.sum()))

# 3. alpha estimation in a band around the silhouette
inner = ndi.binary_erosion(fg, iterations=3)
_, (iy, ix) = ndi.distance_transform_edt(~inner, return_indices=True)
solid = img[iy, ix]  # nearest solid fur colour for every pixel

fb = solid - bg
ib = img - bg
denom = (fb ** 2).sum(-1)
proj = np.where(denom > 1, (ib * fb).sum(-1) / np.maximum(denom, 1), 0.0)
proj = np.clip(proj, 0, 1)

# smooth fallback alpha from the hard mask (for low-contrast edges)
soft = ndi.gaussian_filter(fg.astype(np.float32), 0.9)
soft = np.clip((soft - 0.3) / 0.5, 0, 1)

band_out = ndi.binary_dilation(fg, iterations=2) & ~inner
reliable = np.sqrt(denom) > 45  # fur colour clearly different from bg
alpha = np.where(inner, 1.0, 0.0)
band_alpha = np.where(reliable, np.maximum(proj, soft * 0.85), soft)
alpha = np.where(band_out, band_alpha, alpha)
# light smoothing of the alpha edge to kill stair-steps
alpha = np.clip(ndi.gaussian_filter(alpha, 0.45), 0, 1)
alpha[alpha < 0.03] = 0

# 4. colour decontamination on the edge band
rgb = np.where(band_out[..., None], solid, img)

# crop to content with padding
ys, xs = np.nonzero(alpha > 0.02)
pad = 10
y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + pad + 1)
x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + pad + 1)
rgba = np.dstack([rgb, alpha * 255]).clip(0, 255).astype(np.uint8)[y0:y1, x0:x1]
print("crop box", (x0, y0, x1, y1), "size", rgba.shape[1], "x", rgba.shape[0])

cut = Image.fromarray(rgba, "RGBA")
cut.save(out, optimize=True)

# previews on rave-ish and coffee-ish backgrounds, scaled 2x to inspect edges
for name, col in [("dark", (24, 8, 40)), ("pink", (255, 60, 170)), ("cream", (255, 246, 236))]:
    base = Image.new("RGBA", cut.size, col + (255,))
    base.alpha_composite(cut)
    base = base.resize((cut.width * 2, cut.height * 2), Image.LANCZOS)
    base.convert("RGB").save(f"{preview_dir}/preview_{name}.png")
