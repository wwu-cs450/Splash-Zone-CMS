# 🛠️ Utility Functions Documentation (`excel-upload.js`)

This file contains helper functions for reading data from Excel spreadsheets, primarily focusing on identifying row status based on cell coloring and mapping the spreadsheet data columns to the Firebase `createMember` function for bulk upload.

---

## 🎨 Color Helper Functions

These helpers are used to interpret visual cues (cell fill colors) in the Excel file as boolean flags for member status.

### `hasFillColor(cell, colorType)`

Checks if a specific Excel cell has a defined fill color pattern, primarily used for identifying 'gray' (inactive) and 'yellow' (payment needed) status.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `cell` | `Object` | An ExcelJS cell object. |
| `colorType` | `string` | The color to check for ('gray' or 'yellow'). |

#### Returns
* `boolean`: `true` if the cell has the specified color; `false` otherwise.

### `rowHasColor(row, colorType)`

Checks if any of the key data cells (columns 1 through 4: ID, Name, Car) in a given row have the specified fill color.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `row` | `Object` | An ExcelJS row object. |
| `colorType` | `string` | The color to check for ('gray' or 'yellow'). |

#### Returns
* `boolean`: `true` if any cell in columns 1-4 has the specified color; `false` otherwise.

---

## ⬆️ Excel Upload Functions

These are the primary functions for parsing an Excel file and executing the batch upload.

### `uploadCustomerRecordsFromFile(file, createMember)`

This is the **browser-based** entry point for Excel uploading, designed to work with a standard HTML `File` object from an input element.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `file` | `File` | The File object selected by the user. |
| `createMember` | `Function` | The function used to write the record to Firebase (e.g., from `useMembers`). |

#### Data Mapping Logic
The function iterates through the first worksheet, skipping the header row (row 1), and maps columns to the `createMember` arguments as follows:

| Database Field | Excel Column | Derivation |
| :--- | :--- | :--- |
| `name` | Column A | Cell value (string). |
| `id` | Columns B & C | Concatenated: `Column B + Column C`. |
| `car` | Column D | Cell value (string). |
| `isActive` | Row Color | `!rowHasColor(row, 'gray')`. |
| `validPayment` | Row Color | `!rowHasColor(row, 'yellow')`. |
| `notes` | N/A | Defaulted to an empty string (`''`). |

#### Returns
* `Promise<Object>`: A promise that resolves with an object summarizing the upload process:
    ```javascript
    {
      total: number,      // Total rows attempted
      successful: number, // Total successful creates
      failed: number,     // Total failed creates
      errors: Array<{row: number, error: string}> // List of row-specific errors
    }
    ```

### `uploadCustomerRecords(filePath, createMember)`

This is the **Node.js-based** entry point, designed for back-end scripts or serverless functions where the Excel file is referenced by a file system path.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `filePath` | `string` | The full path to the Excel file on the file system. |
| `createMember` | `Function` | The function used to write the record to Firebase. |

* **Logic:** The data mapping and result structure are identical to `uploadCustomerRecordsFromFile`.
* **Key Difference:** It uses `workbook.xlsx.readFile(filePath)` instead of consuming a browser `File` object.