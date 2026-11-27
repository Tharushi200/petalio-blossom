const pool = require('./db');

async function updateFlowerImages() {
  try {
    console.log("Connecting to MySQL petalio_blossom to update flower images...");

    const flowerImageUpdates = [
      { id: 1, name: "Rose", url: "http://localhost:5000/images/rose.jpg" },
      { id: 2, name: "Orchid", url: "http://localhost:5000/images/orchid.jpg" },
      { id: 3, name: "Lily", url: "http://localhost:5000/images/lily.jpg" },
      { id: 4, name: "Carnation", url: "http://localhost:5000/images/carnation.jpg" },
      { id: 5, name: "Chrysanthemum", url: "http://localhost:5000/images/chrysanthemum.jpg" },
      { id: 6, name: "Gerbera", url: "http://localhost:5000/images/gerbera.jpg" }, // Fixed from /daisies.jpg
      { id: 7, name: "Lisianthus", url: "http://localhost:5000/images/lisianthus.jpg" },
      { id: 8, name: "Lavender", url: "http://localhost:5000/images/lavender.jpg" }, // Fixed from /sea_lavenders.jpg
      { id: 9, name: "Baby's Breath", url: "http://localhost:5000/images/baby_breath.jpg" },
      { id: 10, name: "Sunflower", url: "http://localhost:5000/images/sunflower.jpg" },
      { id: 11, name: "Tulip", url: "http://localhost:5000/images/tulip.jpg" },
      { id: 12, name: "Hydrangea", url: "http://localhost:5000/images/hydrangea.jpg" },
      { id: 13, name: "Peony", url: "http://localhost:5000/images/peony.jpg" },
      { id: 14, name: "Freesia", url: "http://localhost:5000/images/freesia.jpg" },
      { id: 15, name: "Bird of Paradise", url: "http://localhost:5000/images/bird_paradise.jpg" },
      { id: 16, name: "Ranunculus", url: "http://localhost:5000/images/ranunculus.jpg" },
      { id: 17, name: "Tuberose", url: "http://localhost:5000/images/tuberose.jpg" },
      { id: 18, name: "Eucalyptus", url: "http://localhost:5000/images/eucalyptus.jpg" },
      { id: 19, name: "Alstroemeria", url: "http://localhost:5000/images/alstroemeria.jpg" }
    ];

    for (const flower of flowerImageUpdates) {
      await pool.query(
        'UPDATE flowers SET image_url = ? WHERE flower_id = ? OR LOWER(name) = LOWER(?)',
        [flower.url, flower.id, flower.name]
      );
      console.log(`Updated ${flower.name} (ID: ${flower.id}) -> ${flower.url}`);
    }

    // Check if Anthurium exists, if not insert it
    const [anthuriumRows] = await pool.query("SELECT flower_id FROM flowers WHERE LOWER(name) = 'anthurium'");
    if (anthuriumRows.length === 0) {
      const [insAnth] = await pool.query(
        "INSERT INTO flowers (name, category, color, unit_price, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Anthurium",
          "Exotic",
          "Red",
          320.00,
          "http://localhost:5000/images/anthurium.jpg",
          "Vibrant tropical heart-shaped red anthuriums cultivated in shaded mountain green houses."
        ]
      );
      await pool.query(
        "INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, ?)",
        [insAnth.insertId, 60, 20]
      );
      console.log(`Inserted Anthurium (ID: ${insAnth.insertId})`);
    } else {
      await pool.query("UPDATE flowers SET image_url = 'http://localhost:5000/images/anthurium.jpg' WHERE LOWER(name) = 'anthurium'");
    }

    // Check if Jasmine exists, if not insert it
    const [jasmineRows] = await pool.query("SELECT flower_id FROM flowers WHERE LOWER(name) = 'jasmine'");
    if (jasmineRows.length === 0) {
      const [insJasm] = await pool.query(
        "INSERT INTO flowers (name, category, color, unit_price, image_url, description) VALUES (?, ?, ?, ?, ?, ?)",
        [
          "Jasmine",
          "Traditional",
          "White",
          180.00,
          "http://localhost:5000/images/jasmine.jpg",
          "Freshly hand-picked sweet fragrant white jasmine blooms for temple offerings & decor."
        ]
      );
      await pool.query(
        "INSERT INTO inventory (flower_id, stock_quantity, reorder_level) VALUES (?, ?, ?)",
        [insJasm.insertId, 150, 30]
      );
      console.log(`Inserted Jasmine (ID: ${insJasm.insertId})`);
    } else {
      await pool.query("UPDATE flowers SET image_url = 'http://localhost:5000/images/jasmine.jpg' WHERE LOWER(name) = 'jasmine'");
    }

    console.log("\nAll flower images updated in database successfully!");

    const [allFlowers] = await pool.query("SELECT flower_id, name, category, unit_price, image_url FROM flowers ORDER BY flower_id ASC");
    console.log(JSON.stringify(allFlowers, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error updating flower images:", error);
    process.exit(1);
  }
}

updateFlowerImages();

