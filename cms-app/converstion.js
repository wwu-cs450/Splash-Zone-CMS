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

fs.readFile(file).then(res => {
  // res is a Buffer in Node.js; read it with XLSX as a 'buffer'
  let workbook = read(res, { type: "buffer" });
  let first_sheet_name = workbook.SheetNames[0];
  let worksheet = workbook.Sheets[first_sheet_name];
  let jsonData = utils.sheet_to_json(worksheet, { raw: false, defval: null });

  // derive output name from the file path (without extension)
  let fileName = basename(file, extname(file));

  let new_worksheet = utils.json_to_sheet(jsonData);
  let new_workbook = utils.book_new();
  utils.book_append_sheet(new_workbook, new_worksheet, "csv_sheet");

  // If you need to use getRandomRows, define it above; removed here to avoid runtime error
  // getRandomRows(jsonData);

  // write CSV next to this script to avoid writing to an unexpected working directory
  writeFile(new_workbook, join(__dirname, fileName + ".csv"));
}).catch(err => {
  console.error('Failed to read or convert file:', err);
});
