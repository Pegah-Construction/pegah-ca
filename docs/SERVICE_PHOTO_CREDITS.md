# Service card photography

Stand-in photos for the four default services, shown by `components/ServiceImage.tsx`
when no photo has been uploaded for that card in the dashboard. They are generic
stock, **not** Pegah projects — don't caption or describe them as our own work, and
replace them with real site photography when we have it.

All four are from [Pexels](https://www.pexels.com/license/), free for commercial use
with no attribution required. Downloaded square-cropped at 1200×1200 (the cards
default to a square image shape and crop from the centre outwards).

| File | Service | Source |
| --- | --- | --- |
| `general-contracting.jpg` | General Contracting | https://www.pexels.com/photo/metal-beams-in-a-construction-site-3818947/ |
| `project-management.jpg` | Project Management | https://www.pexels.com/photo/a-man-and-a-woman-with-ppe-s-looking-at-a-blue-print-8961133/ |
| `design-build.jpg` | Design–Build | https://www.pexels.com/photo/man-holding-silver-ruler-6615193/ |
| `care-support.jpg` | Care & Support | https://www.pexels.com/photo/man-drilling-an-aircon-casing-5463581/ |

To refresh one, re-download at the same size and keep the filename — it has to match
the service's slug in `BUNDLED_ART`:

```
https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=1200
```
