# Exporting the architecture diagram to PNG

Two easy ways to create a PNG from the SVG (choose one):

1) Using npx svgexport (recommended, quick):

```bash
# from project root
npx svgexport docs/ARCHITECTURE_DIAGRAM_POLISHED.svg docs/ARCHITECTURE_DIAGRAM_POLISHED.png 1400:900
```

- `npx svgexport` will install a small CLI and render the PNG. No global install needed.

2) Using Inkscape (if installed):

```bash
inkscape docs/ARCHITECTURE_DIAGRAM_POLISHED.svg --export-type=png --export-filename=docs/ARCHITECTURE_DIAGRAM_POLISHED.png --export-width=1400 --export-height=900
```

If you want, I can try to run the export here (it will use `npx svgexport`). Tell me to "export PNG now" and I'll attempt it and commit the generated PNG back to the repo. Note: this may temporarily download a small npm package via npx.
