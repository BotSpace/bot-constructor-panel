const fs = require("fs");
const path = require("path");
const readline = require("readline");

// --- SOZLAMALAR ---
const OUTPUT_FILE = "project_analysis.md";
const IGNORE_LIST = [
  "node_modules",
  ".git",
  ".next",
  ".vscode",
  "public",
  "package-lock.json",
  OUTPUT_FILE,
  "analyze_project.js",
];
const ANALYZE_CONTENT_DIR = "constructor";

// --- YORDAMCHI FUNKSIYALAR ---
function analyzeDirectory(dir, prefix = "") {
  let structure = "";
  const collectedFiles = [];

  const entries = fs.readdirSync(dir);
  const filteredEntries = entries.filter(
    (entry) => !IGNORE_LIST.includes(entry)
  );

  for (let i = 0; i < filteredEntries.length; i++) {
    const entry = filteredEntries[i];
    const fullPath = path.join(dir, entry);
    const isLast = i === filteredEntries.length - 1;
    const connector = isLast ? "└── " : "├── ";

    structure += `${prefix}${connector}${entry}\n`;

    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        const result = analyzeDirectory(fullPath, newPrefix);
        structure += result.structure;
        collectedFiles.push(...result.files);
      } else if (stats.isFile()) {
        const relativePath = path.relative(dir, fullPath);
        if (
          relativePath.startsWith(path.normalize(ANALYZE_CONTENT_DIR)) &&
          (entry.endsWith(".ts") || entry.endsWith(".tsx"))
        ) {
          const content = fs.readFileSync(fullPath, "utf-8");
          collectedFiles.push({ path: relativePath, content });
        }
      }
    } catch (error) {
      structure += `${prefix}    (xatolik: ${entry} o'qilmadi)\n`;
    }
  }

  return { structure, files: collectedFiles };
}

// --- PAPKA TANLASH VA MAIN ---
function promptFolderSelection() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Qaysi papkani tahlil qilaylik? (standart: joriy papka)\n> `,
    function (inputPath) {
      const ROOT_DIR = inputPath.trim()
        ? path.resolve(inputPath.trim())
        : process.cwd();

      if (!fs.existsSync(ROOT_DIR)) {
        console.error("❌ Bunday papka mavjud emas:", ROOT_DIR);
        rl.close();
        return;
      }

      console.log("Loyihani tahlil qilish boshlandi...");

      let markdownContent = `# Loyiha Tahlili Hisoboti\n\nSana: ${new Date().toLocaleString()}\n\n`;

      const { structure, files } = analyzeDirectory(ROOT_DIR);

      markdownContent += "## 📁 Fayl Strukturasi\n\n";
      markdownContent += "```\n";
      markdownContent += `${path.basename(ROOT_DIR)}\n`;
      markdownContent += structure;
      markdownContent += "```\n\n";

      markdownContent += `## 📄 Muhim Fayllar Tarkibi (içidan: ${ANALYZE_CONTENT_DIR})\n\n`;

      if (files.length === 0) {
        markdownContent += `*Belgilangan \`${ANALYZE_CONTENT_DIR}\` papkasidan o'qiladigan fayllar topilmadi.*\n`;
      } else {
        files.forEach((file) => {
          const extension = path.extname(file.path).substring(1);
          markdownContent += `### 📄 ${file.path}\n\n`;
          markdownContent += `\`\`\`${extension}\n`;
          markdownContent += file.content;
          markdownContent += `\n\`\`\`\n\n`;
        });
      }

      fs.writeFileSync(path.join(ROOT_DIR, OUTPUT_FILE), markdownContent);

      console.log(`✅ Tahlil "${ROOT_DIR}" papkasida yakunlandi.`);
      console.log(`📄 Natija fayl: ${OUTPUT_FILE}`);
      rl.close();
    }
  );
}

// Skriptni ishga tushirish
promptFolderSelection();
