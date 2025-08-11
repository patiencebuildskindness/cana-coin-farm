// Plants API: Google Sheet CSV if provided; else local CSV
import fs from 'fs';
import path from 'path';

app.get('/api/plants', async (_req, res) => {
  try {
    const sheetUrl = process.env.SHEET_CSV_URL;
    if (sheetUrl) {
      // Fetch CSV from Google Sheets and parse with csvtojson
      const r = await fetch(sheetUrl);
      if (!r.ok) throw new Error('Sheet fetch failed');
      const csvText = await r.text();
      const csvtojson = (await import('csvtojson')).default;
      const plants = await csvtojson().fromString(csvText);
      return res.json({ ok: true, plants });
    }

    // Fallback: local CSV (data/game_plants.csv)
    const csvtojson = (await import('csvtojson')).default;
    const csvPath = path.join(process.cwd(), 'data', 'game_plants.csv');
    if (!fs.existsSync(csvPath)) return res.json({ ok: true, plants: [] });
    const plants = await csvtojson().fromFile(csvPath);
    return res.json({ ok: true, plants });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: 'Failed to load plants' });
  }
});
