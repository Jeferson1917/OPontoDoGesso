// src/app/components/GallerySection.tsx
import fs from 'node:fs';
import path from 'node:path';
import { galleryItems } from '../data/gallery';
import { Gallery } from './Gallery';

// Roda no servidor (no build, já que a página é estática): só passa adiante as fotos
// que existem em public/. Assim um arquivo faltando vira placeholder, não imagem quebrada.
export function GallerySection() {
  const items = galleryItems.map((item) => ({
    ...item,
    image: item.image && fs.existsSync(path.join(process.cwd(), 'public', item.image)) ? item.image : null,
  }));

  return <Gallery items={items} />;
}
