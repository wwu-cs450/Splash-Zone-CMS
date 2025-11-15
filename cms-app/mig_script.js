import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import { createMember } from "./src/api/firebase-crud.js";

// Path to your CSV file
const csvFilePath = path.resolve("Customer_records.csv");

async function processCSV() {
  const fileStream = fs.createReadStream(csvFilePath);

  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineNumber = 0;

  for await (const line of rl) {
    lineNumber++;

    // Skip the first row (header)
    if (lineNumber === 1) continue;

    // Skip empty lines
    if (!line.trim()) continue;

    // Split CSV by commas while preserving empty columns
    const columns = line.split(",");

    // Ensure at least A B C D exist
    if (columns.length < 4) {
      console.warn(`⚠️ Skipping incomplete row ${lineNumber}:`, line);
      continue;
    }

    const id = columns[2]?.trim();        // Column C
    const car = columns[3]?.trim() || ""; // Column D (allow null)
    
    // Join everything after column D as notes
    const notesArray = columns.slice(4).map(c => c.trim());
    const notes = notesArray.join(" ").trim();

    // Skip if ID is missing
    if (!id) {
      console.warn(`Missing ID in row ${lineNumber}, skipping.`);
      continue;
    }

    try {
      console.log(`Creating member: ID=${id}, Car="${car}", Notes="${notes}"`);
      await createMember(id, car, true, notes);
      console.log(`Created member ${id}`);
    } catch (err) {
      console.error(`Failed to create member for row ${lineNumber}`, err);
    }
  }

  console.log("🎉 Migration complete!");
}

processCSV().catch(err => console.error("❌ Migration failed:", err));
