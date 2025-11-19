#!/usr/bin/env node
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../api/firebaseconfig.js';

// Resolve paths relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  const src = join(__dirname, 'Customer_records.json');
  let data;
  try {
    const raw = await fs.readFile(src, 'utf8');
    data = JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read or parse Customer_records.json:', err);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error('Customer_records.json does not contain an array');
    process.exit(1);
  }

  console.log(`Preparing to migrate ${data.length} records to Firestore (emulator endpoint should be running).`);

  let success = 0;
  let failed = 0;

  for (const rec of data) {
    try {
      // Each rec should have Name, Subscription, ID, Car, Notes
      // Use ID when available, otherwise sanitize Name to create a doc id
      let id = rec.ID ? String(rec.ID).trim() : '';
      if (!id) {
        // fallback id from name (lowercase, non-alnum replaced with _)
        const name = rec.Name ? String(rec.Name).trim() : '';
        id = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') : undefined;
      }

      // If still no id, let Firestore generate one by using setDoc with an auto-id
      let docRef;
      if (id) {
        docRef = doc(db, 'users', id);
      } else {
        // Use an auto-generated id
        // import doc and setDoc used with collection-less doc requires constructing with collection, but
        // easiest is to create a document with an auto id by calling doc(collection(db, 'users')).
        // To avoid extra imports, create a pseudo id using timestamp
        const autoId = `auto_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
        docRef = doc(db, 'users', autoId);
      }

      const payload = {
        name: rec.Name || '',
        subscription: rec.Subscription || '',
        car: rec.Car || '',
        notes: rec.Notes || ''
      };

      await setDoc(docRef, payload);
      success++;
    } catch (err) {
      failed++;
      console.error('Failed to write record:', rec, err && err.message ? err.message : err);
    }
  }

  console.log(`Migration complete. Success: ${success}, Failed: ${failed}`);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

