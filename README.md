# Extract Localization Script for Cocos Creator

This Node.js script scans your **Cocos Creator 3.8.2** project for all `.scene`, `.prefab`, and `.fire` files, extracts every `cc.Label` and `cc.RichText` string, and outputs two files in a new `localization/` folder:

- **texts.json** — an array of objects with `{ type, text, path }`  
- **texts.csv** — the same data in CSV format (columns: `type,text,path`)

## 📦 Installation

1. Copy `extract-localization.js` into the **root** of your Cocos Creator project (next to the `assets/` folder):
   ```
   your-project/
   ├── assets/
   ├── extract-localization.js
   └── (other files/folders)
   ```
2. Install Node.js (if not already installed):  
   ```bash
   node --version
   ```

## 🚀 Usage

Run the script from your project root:
```bash
node extract-localization.js
```
- On success you’ll see:
  ```
  ✅ Extracted 123 entries → localization/texts.json and texts.csv
  ```
- The `localization/` folder will contain:
  - `texts.json`
  - `texts.csv`

## ⚙️ Configuration

- **File types**: To include other extensions, edit the regex in the `scanDirectory()` function.  
- **Output folder**: Change the `localization` folder name at the bottom of the script.  
- **Additional components**: In `traverse()`, add more `__type__` checks (e.g. `cc.LabelOutline`, `cc.TMPro`) to extract other text data.

## 🤝 Contributing

Feel free to open issues or pull requests.  
If you add new features or options, please update this README with instructions.

---
*Compatible with Cocos Creator 3.8.2*
