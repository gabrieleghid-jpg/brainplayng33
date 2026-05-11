/**
 * Script per rimuovere la maschera bianca dal cappello
 * Mantiene solo il cappello rosso con sfondo trasparente
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
    
    // Crea un nuovo buffer per l'immagine modificata
    const newData = Buffer.from(data);
    
    // Scorri tutti i pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        
        // Se il pixel è bianco o molto chiaro (maschera della testa)
        // e NON è rosso (il cappello), rendilo trasparente
        const isWhite = r > 240 && g > 240 && b > 240;
        const isLightGray = r > 200 && g > 200 && b > 200 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
        const isRed = r > 150 && g < 100 && b < 100; // Il cappello è rosso
        
        if ((isWhite || isLightGray) && !isRed) {
          // Rendi trasparente
          newData[idx + 3] = 0; // Alpha = 0
        }
      }
    }
    
    // Salva l'immagine modificata
    await sharp(newData, { raw: { width, height, channels } })
      .png()
      .toFile(outputPath);
    
    console.log('✅ Immagine cappello sistemata!');
    console.log(`📁 Salvata in: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Errore:', error.message);
  }
}

fixCapImage();
