/**
 * Script per rimuovere la maschera bianca dal cappello - Versione 2
 * Mantiene SOLO il cappello rosso, rimuove faccia e corpo
 */

const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));

const inputPath = path.join(__dirname, 'src/assets/avatar/cap_red.png');
const outputPath = path.join(__dirname, 'src/assets/avatar/cap_red_fixed.png');

async function fixCapImage() {
  try {
    // Carica l'immagine
    const image = sharp(inputPath);
    const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    // Crea un nuovo buffer
    const newData = Buffer.from(data);
    
    // Scorri tutti i pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        // Calcola la "rossità" - il cappello è ROSSO (R alto, G e B bassi)
        const isRedCap = r > 140 && g < 120 && b < 120 && (r - g) > 40;
        
        // La faccia/corpo ha colori simili (pelle)
        const isSkinTone = r > 200 && g > 180 && b > 160 && Math.abs(r - g) < 40 && Math.abs(g - b) < 40;
        
        // Bianco/grigio chiaro (sfondo/testa)
        const isLight = r > 200 && g > 200 && b > 200;
        
        // Se NON è il cappello rosso, rendilo trasparente
        if (!isRedCap) {
          newData[idx + 3] = 0; // Alpha = 0 (trasparente)
        }
      }
    }
    
    // Salva
    await sharp(newData, { raw: { width, height, channels } })
      .png()
      .toFile(outputPath);
    
    console.log('✅ Immagine cappello sistemata (v2)!');
    console.log(`📁 Salvata in: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

fixCapImage();
