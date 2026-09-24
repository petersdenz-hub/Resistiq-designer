# Resistiq Designer

Standalone clothing design studio.

This is **not** the Resistiq webshop. It has its own repository, its own future database, and its own authentication. It must not connect to webshop products, orders, cart, checkout, Stripe, or login.

## Current milestone

A user can:

1. Open a T-shirt
2. Switch Front / Back without losing elements
3. Add structured text (content, font, size, weight, italic, color, tracking, align)
4. Add a vector graphic (position, size, rotation, opacity, color, shape)
5. Change layer order (forward, backward, front, back)
6. Place work on a specific panel (body, sleeves, collar) and see its safe / print area
7. Change garment color with a color picker
8. Undo and redo those changes

The **Design Document** is the source of truth. The canvas is only a picture of that document. Designs are not saved as one flattened image.

Elements are stored on **garment panels** (front body, back body, sleeves, collar). Their position is relative to that panel, not to the browser window. That is how the same design can later map to other sizes and production documents.

Each major panel has a **safe area** (chest print, back print, sleeve print). It is visible while editing and is not part of the garment.

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
- In-memory design state (lost on refresh)
- One garment type: T-shirt, with front and back
- Structured design elements (graphic and text are editable; logo and image types exist but cannot be added yet)
- Undo / redo
- Zoom

Save, preview, export, login, and the database are **not** implemented yet. Those buttons are visible and disabled on purpose.

## Canvas choice

No drawing library was added (no Konva, no Fabric).

The editor uses **SVG** and our own Design Document:

- Selection, drag, resize, and rotate update the document directly
- Layers are the document’s `zIndex` order
- Text and future images can use normal SVG features
- Export and tech packs can read the same document later

A library can still be added later if we hit a real limit.

## Planned later (not built)

- Other garments (hoodie, jacket, pants, shorts, leggings, ski/snowboard)
- Logo and image uploads
- Materials
- Durable save (this project’s own Supabase, when we decide to)
- Preview rendering and export
- Tech packs
- AI assistance
- Anything connected to the Resistiq webshop

## Project shape

```text
src/
  app/           App shell
  studio/        Designer layout (top bar, sidebars, canvas)
  design/        Design Document types and in-memory editing
  garments/      Garment definitions and renderers (T-shirt first)
  canvas/        SVG stage, selection, transform
  persistence/   Storage adapters (memory now, Supabase later)
  export/        Future export pipelines
  ui/            Shared controls
  assets/        Future garment artwork
```
