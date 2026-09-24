# Resistiq Designer

Standalone clothing design studio.

This is **not** the Resistiq webshop. It has its own repository, its own future database, and its own authentication. It must not connect to webshop products, orders, cart, checkout, Stripe, or login.

## Current milestone

A user can:

1. Create a named design on a T-shirt, hoodie, jacket, pants, or shorts
2. See saved designs on a Designs screen
3. Open a design and keep editing
4. Preview front/back without editor controls
5. Duplicate or delete a saved design
6. Place structured text, graphics, and uploaded images on garment panels
7. Select a garment panel and give it its own color (falls back to body color)
8. Switch Front / Back without losing elements
9. Undo and redo editor changes

Save is explicit. There is no autosave.

The **Design Document** is the source of truth. The canvas is only a picture of that document. Designs are not saved as one flattened image.

Elements are stored on **garment panels**. Their position is relative to that panel, not to the browser window. Garment structure (hood, zipper, cuffs, waistband) is not a design element.

Each major panel has a **safe area**. It is visible while editing and is not part of the garment.

## How to run

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

Other commands:

```bash
npm run build
npm run preview
```

## What this first version does

- React + TypeScript + Vite + Tailwind CSS
- Saved designs in this browser (Design Document library in localStorage, image files in IndexedDB)
- Designs dashboard: open, duplicate, delete
- Preview (not an export)
- Garment registry: T-shirt, hoodie, jacket, pants, shorts (front and back)
- Per-panel colors on the Design Document (body color is the fallback)
- Structured design elements (graphic, text, image, and logo)
- Undo / redo
- Zoom

Export, login, and the database are **not** implemented yet.

## Canvas choice

No drawing library was added (no Konva, no Fabric).

The editor uses **SVG** and our own Design Document:

- Selection, drag, resize, and rotate update the document directly
- Layers are the document’s `zIndex` order
- Text and future images can use normal SVG features
- Export and tech packs can read the same document later

A library can still be added later if we hit a real limit.

## Planned later (not built)

- More garments (leggings, ski/snowboard) and garment details (pockets, materials, lining)
- Materials
- Durable save (this project’s own Supabase, when we decide to)
- Export
- Tech packs
- AI assistance
- Anything connected to the Resistiq webshop

## Project shape

```text
src/
  app/           App shell
  studio/        Designer layout (top bar, sidebars, canvas)
  designs/       Saved-design dashboard
  preview/       Editor-free garment preview
  design/        Design Document types and in-memory editing
  garments/      Garment registry, definitions, and renderers
  canvas/        SVG stage, selection, transform
  persistence/   Local design repository + asset store (replaceable later)
  export/        Future export pipelines
  ui/            Shared controls
  assets/        Future garment artwork
```
