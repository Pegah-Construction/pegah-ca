# Affiliation / partner logos

These logos appear in the "Memberships & Affiliations" section of the Tenders
page (`/tenders`). Drop the image files here with these **exact filenames**:

| File                 | Organization                                   | Link              |
| -------------------- | ---------------------------------------------- | ----------------- |
| `ogca.png`           | Ontario General Contractors Association        | ogca.ca           |
| `ihsa.png`           | IHSA — COR health & safety certification       | ihsa.ca/cor-home  |
| `smartbid.png`       | Smartbid (bid-invitation platform)             | smartbid.co       |
| `procore.png`        | Procore (project management)                   | procore.com       |
| `format-group.png`   | Format Group                                   | formatgroup.ca    |

Notes:
- Filenames must match exactly (they're referenced in `lib/site.ts` →
  `affiliations`). To use a different name/format (e.g. `.svg`, `.webp`),
  update the `logo` path there too.
- Any logo whose file is missing automatically falls back to a text badge,
  so the section always looks intact.
- Prefer transparent-background PNG or SVG. They render ~40px tall,
  desaturated, and colorize on hover.
- To add/remove/reorder affiliations, edit the `affiliations` array in
  `lib/site.ts`.
