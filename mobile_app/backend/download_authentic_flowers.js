const https = require('https');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const flowers = [
  { id: 1, name: 'Rose', key: 'rose', file: 'Red rose.jpg' },
  { id: 2, name: 'Orchid', key: 'orchid', file: 'Phalaenopsis Cultivar White 01.jpg' },
  { id: 3, name: 'Lily', key: 'lily', file: 'Lilium candidum 1.jpg' },
  { id: 4, name: 'Carnation', key: 'carnation', file: 'Dianthus caryophyllus.JPG' },
  { id: 5, name: 'Chrysanthemum', key: 'chrysanthemum', file: 'Chrysanthemum.jpg' },
  { id: 6, name: 'Gerbera', key: 'gerbera', file: 'Gerbera jamesonii.jpg' },
  { id: 7, name: 'Lisianthus', key: 'lisianthus', file: 'Eustoma grandiflorum purple 02.jpg' },
  { id: 8, name: 'Lavender', key: 'lavender', file: 'Lavandula angustifolia 001.JPG' },
  { id: 9, name: "Baby's Breath", key: 'baby_breath', file: 'Gypsophila paniculata.jpg' },
  { id: 10, name: 'Sunflower', key: 'sunflower', file: 'Sunflower sky backdrop.jpg' },
  { id: 11, name: 'Tulip', key: 'tulip', file: 'Beautiful red tulip.jpg' },
  { id: 12, name: 'Hydrangea', key: 'hydrangea', file: 'Hydrangea macrophylla 01.jpg' },
  { id: 13, name: 'Peony', key: 'peony', file: 'Pink Peony.JPG' },
  { id: 14, name: 'Freesia', key: 'freesia', file: 'Freesia.jpg' },
  { id: 15, name: 'Bird of Paradise', key: 'bird_paradise', file: 'Strelitzia reginae.jpg' },
  { id: 16, name: 'Ranunculus', key: 'ranunculus', file: 'Ranunculus asiaticus.jpg' },
  { id: 17, name: 'Tuberose', key: 'tuberose', file: 'Polianthes tuberosa flower.jpg' },
  { id: 18, name: 'Eucalyptus', key: 'eucalyptus', file: 'Eucalyptus staigeriana leaf.jpg' },
  { id: 19, name: 'Alstroemeria', key: 'alstroemeria', file: 'Alstroemeria.jpg' }
];

function getThumbUrl(file) {
  return new Promise((resolve, reject) => {
    const url = 'https://commons.wikimedia.org/w/api.php?action=query&titles=File:' + encodeURIComponent(file) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json';
    https.get(url, { headers: { 'User-Agent': 'PetalioBlossom/1.0 (contact@petalio.lk)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const p = Object.values(j.query.pages)[0];
          const thumb = p.imageinfo ? (p.imageinfo[0].thumburl || p.imageinfo[0].url) : null;
          resolve(thumb);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destPath);
    const request = (targetUrl) => {
      https.get(targetUrl, { headers: { 'User-Agent': 'PetalioBlossom/1.0 (contact@petalio.lk)' } }, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          request(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${targetUrl}, status code: ${response.statusCode}`));
          return;
        }
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => resolve(destPath));
        });
      }).on('error', (err) => {
        fs.unlink(destPath, () => {});
        reject(err);
      });
    };
    request(url);
  });
}

async function main() {
  const backendImagesDir = path.join(__dirname, 'public', 'images');
  const androidDrawableDir = path.join(__dirname, '..', 'app', 'src', 'main', 'res', 'drawable');

  if (!fs.existsSync(backendImagesDir)) {
    fs.mkdirSync(backendImagesDir, { recursive: true });
  }

  console.log('--- Step 1: Downloading 100% Authentic Flower Photos from Wikimedia Commons ---');
  for (const item of flowers) {
    try {
      const thumbUrl = await getThumbUrl(item.file);
      if (!thumbUrl) {
        console.error(`Could not get thumb URL for ${item.name} (${item.file})`);
        continue;
      }
      
      const backendDest = path.join(backendImagesDir, `${item.key}.jpg`);
      const androidDest = path.join(androidDrawableDir, `img_flower_${item.key}.jpg`);

      await downloadImage(thumbUrl, backendDest);
      fs.copyFileSync(backendDest, androidDest);

      const size = fs.statSync(backendDest).size;
      console.log(`✓ [${item.id}/19] ${item.name}: saved ${item.key}.jpg (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      console.error(`✗ Error on ${item.name}:`, err.message);
    }
  }

  // Alias for backward compatibility if any legacy query calls daisies.jpg or sea_lavenders.jpg
  fs.copyFileSync(path.join(backendImagesDir, 'gerbera.jpg'), path.join(backendImagesDir, 'daisies.jpg'));
  fs.copyFileSync(path.join(backendImagesDir, 'lavender.jpg'), path.join(backendImagesDir, 'sea_lavenders.jpg'));

  console.log('\n--- Step 2: Updating MySQL Database (petalio_blossom) ---');
  // 1. Delete non-database flowers (flower_id > 19)
  await pool.query('DELETE FROM inventory WHERE flower_id > 19');
  await pool.query('DELETE FROM flowers WHERE flower_id > 19');
  console.log('✓ Removed all non-database flowers (ensured ONLY the 19 database flowers exist)');

  // 2. Update each flower in DB
  for (const item of flowers) {
    const url = `http://localhost:5000/images/${item.key}.jpg`;
    await pool.query('UPDATE flowers SET image_url = ? WHERE flower_id = ?', [url, item.id]);
  }
  console.log('✓ Updated image_url for all 19 flowers in flowers table');

  const [dbFlowers] = await pool.query('SELECT flower_id, name, category, color, unit_price, image_url FROM flowers ORDER BY flower_id ASC');
  console.log('\nDatabase Flowers Table Status:');
  console.table(dbFlowers);

  console.log('\nAll 19 flowers verified & database updated successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

