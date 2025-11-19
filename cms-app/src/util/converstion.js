// create a CSV file from an Excel file
// to use this script, ensure you have the 'xlsx' package installed:
// npm install xlsx --save

import { promises as fs } from 'fs';
import { basename, extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { read, utils, writeFile } from 'xlsx';

// resolve the Excel file path relative to this script file so the script works
// no matter what the current working directory is when you run `node`
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let file = join(__dirname, "Customer_records.xlsx");
const ext = extname(file).toLowerCase();

Promise.resolve().then(() => {
  if (ext === '.csv') {
    // already a CSV — nothing to convert here
    console.log(`${basename(file)} is already a CSV; skipping Excel-to-CSV conversion.`);
    return;
  }

  // assume Excel (.xlsx / .xls) otherwise
  return fs.readFile(file).then(res => {
    // res is a Buffer in Node.js; read it with XLSX as a 'buffer'
    let workbook = read(res, { type: "buffer" });
    let first_sheet_name = workbook.SheetNames[0];
    let worksheet = workbook.Sheets[first_sheet_name];
    let jsonData = utils.sheet_to_json(worksheet, { raw: false, defval: null });

    // derive output name from the file path (without extension)
    let fileName = basename(file, extname(file));

    // force header row to be exactly: Name,Subscription,ID,Car
    const headerRow = ['Name', 'Subscription', 'ID', 'Car'];

    // the row which name should overwrite should say "sticker starts with a"
    

    // create sheet from JSON and enforce header row (overwriting any existing header)
    let new_worksheet = utils.json_to_sheet(jsonData, { header: headerRow });

    // Overwrite the first row cells with headerRow (this replaces any existing first row,
    // rather than inserting new rows)
    for (let c = 0; c < headerRow.length; c++) {
      const addr = utils.encode_cell({ c, r: 0 });
      new_worksheet[addr] = { t: 's', v: headerRow[c] };
    }

    // Ensure the sheet range (!ref) is correct
    let range;
    if (new_worksheet['!ref']) {
      range = utils.decode_range(new_worksheet['!ref']);
      // force start row/col to 0 (A1)
      range.s.r = 0;
      range.s.c = 0;
      // ensure end column covers header length
      range.e.c = Math.max(range.e.c, headerRow.length - 1);
    } else {
      range = { s: { r: 0, c: 0 }, e: { r: jsonData.length, c: headerRow.length - 1 } };
    }
    new_worksheet['!ref'] = utils.encode_range(range);

    let new_workbook = utils.book_new();
    utils.book_append_sheet(new_workbook, new_worksheet, "csv_sheet");

    // write CSV next to this script to avoid writing to an unexpected working directory
    return writeFile(new_workbook, join(__dirname, fileName + ".csv"));
  });
}).catch(err => {
  console.error('Failed to read or convert file:', err);
});


// convert a CSV file to JSON
// to use this script, ensure you have the 'csvtojson' package installed:
// npm install csvtojson --save


import csv from 'csvtojson';

// wait a moment to ensure the CSV file is created before we try to read it
setTimeout(() => {
  const csvFilePath = join(__dirname, "Customer_records.csv");

  // Read the CSV without treating the first row as header so we can decide
  // which columns correspond to Name/Subscription/ID/Car/Notes (handles shifted columns).
  csv({ noheader: true, trim: true })
    .fromFile(csvFilePath)
    .then(rows => {
      if (!Array.isArray(rows) || rows.length === 0) {
        console.error('CSV appears empty or could not be parsed.');
        return;
      }

      // rows are objects with keys field1, field2, ...
      // Determine number of columns from the first row
      const firstRow = rows[0];
      const fieldKeys = Object.keys(firstRow).filter(k => k.startsWith('field'));
      const colCount = fieldKeys.length;

      // Find likely index for Name: choose first column in the first row whose value
      // is a non-empty string longer than 1 and not solely numeric (heuristic).
      let nameIndex = -1;
      for (let i = 0; i < colCount; i++) {
        const val = firstRow[`field${i + 1}`];
        if (val && typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed.length > 1 && /[A-Za-z]/.test(trimmed) && !/^\d+$/.test(trimmed)) {
            nameIndex = i;
            break;
          }
        }
      }

      // Fallback: if we didn't find a good candidate, assume names start at column 0
      if (nameIndex === -1) nameIndex = 0;

      // Build header array of length colCount and place our desired headers at the detected offset.
      const headers = new Array(colCount).fill(null);
      headers[nameIndex] = 'Name';
      if (nameIndex + 1 < colCount) headers[nameIndex + 1] = 'Subscription';
      if (nameIndex + 2 < colCount) headers[nameIndex + 2] = 'ID';
      if (nameIndex + 3 < colCount) headers[nameIndex + 3] = 'Car';
      if (nameIndex + 4 < colCount) headers[nameIndex + 4] = 'Notes';

      // Map rows into objects using our headers. Fold trailing fields into `Notes`,
      // then post-process `Notes` if it contains a concatenated "Name | Subscription | ID | Car"
      // pattern — split those back into separate fields. Also skip obvious header/meta rows.
      const result = rows.map(r => {
        const obj = { Name: '', Subscription: '', ID: '', Car: '', Notes: '' };

        // collect values according to headers
        for (let i = 0; i < colCount; i++) {
          const value = r[`field${i + 1}`] == null ? '' : String(r[`field${i + 1}`]).trim();
          const header = headers[i];
          if (!header) continue;
          if (header === 'Notes') {
            if (value) {
              if (obj.Notes) obj.Notes += ' | ' + value;
              else obj.Notes = value;
            }
            // append any subsequent extras to Notes
            for (let j = i + 1; j < colCount; j++) {
              const extra = r[`field${j + 1}`];
              if (extra && String(extra).trim()) {
                obj.Notes = obj.Notes ? obj.Notes + ' | ' + String(extra).trim() : String(extra).trim();
              }
            }
            break;
          } else {
            obj[header] = value;
          }
        }

        // Skip rows that appear to be the original header or metadata row
        const notesLower = (obj.Notes || '').toLowerCase();
        if (
          notesLower.includes('sticker starts with a') ||
          notesLower.includes('__empty') ||
          (obj.Name && obj.Name.toLowerCase() === 'name' && obj.Subscription && obj.Subscription.toLowerCase() === 'subscription')
        ) {
          return null;
        }

        // If main fields are empty but Notes contains concatenated values, split them
        if ((!obj.Name || !obj.Subscription || !obj.ID || !obj.Car) && obj.Notes && obj.Notes.includes(' | ')) {
          const parts = obj.Notes.split(' | ').map(s => s.trim()).filter(Boolean);
          // If first part looks like a name and Name is empty, set it
          if (!obj.Name && parts[0]) obj.Name = parts[0];
          if (!obj.Subscription && parts[1]) obj.Subscription = parts[1];
          if (!obj.ID && parts[2]) obj.ID = parts[2];
          if (!obj.Car && parts[3]) obj.Car = parts[3];

          // Any parts after index 3 are real notes — preserve them
          const extras = parts.slice(4);
          obj.Notes = extras.length ? extras.join(' | ') : '';
        }

        // If the row is entirely empty after processing, skip it
        if (!obj.Name && !obj.Subscription && !obj.ID && !obj.Car && !obj.Notes) return null;

        return obj;
      });

      // filter out any null rows we returned for headers/empty lines
      const filtered = result.filter(Boolean);

      // Write JSON output next to the CSV file
      const outPath = join(__dirname, 'Customer_records.json');
      return fs.writeFile(outPath, JSON.stringify(filtered, null, 2)).then(() => {
        console.log(`Wrote ${filtered.length} records to ${outPath}`);
      });
    })
    .catch(err => {
      console.error('Failed to convert CSV to JSON:', err);
    });

}, 1000);