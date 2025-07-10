const fs = require("fs");
const path = require("path");

// --- SOZLAMALAR ---
// Skript ishga tushiriladigan asosiy papka
const ROOT_DIR = process.cwd();
// Tahlil natijalari saqlanadigan fayl nomi
const OUTPUT_FILE = "project_analysis.md";
// E'tibor berilmaydigan papka va fayllar ro'yxati
const IGNORE_LIST = [
  "node_modules",
  ".git",
  ".next",
  ".vscode",
  "public",
  "package-lock.json",
  OUTPUT_FILE, // Skript o'zini o'zi o'qimasligi uchun
  "analyze_project.js", // Skript o'zini o'zi o'qimasligi uchun
];
// Aynan qaysi papka ichidagi fayllarning tarkibini o'qish kerak
const ANALYZE_CONTENT_DIR = "constructor";

// --- YORDAMCHI FUNKSIYALAR ---

/**
 * Fayl strukturasini daraxtsimon ko'rinishda yaratadi va muhim fayllar tarkibini yig'adi
 * @param {string} dir - Joriy papka yo'li
 * @param {string} prefix - Daraxt uchun prefiks
 * @returns {{structure: string, files: Array<{path: string, content: string}>}}
 */
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
        // Agar fayl ANALYZE_CONTENT_DIR ichida bo'lsa va kengaytmasi .ts yoki .tsx bo'lsa
        const relativePath = path.relative(ROOT_DIR, fullPath);
        if (
          relativePath.startsWith(path.normalize(ANALYZE_CONTENT_DIR)) &&
          (entry.endsWith(".ts") || entry.endsWith(".tsx"))
        ) {
          const content = fs.readFileSync(fullPath, "utf-8");
          collectedFiles.push({ path: relativePath, content });
        }
      }
    } catch (error) {
      // Ba'zi tizim fayllariga kirishda xatolik bo'lishi mumkin
      structure += `${prefix}    (xatolik: ${entry} o'qilmadi)\n`;
    }
  }

  return { structure, files: collectedFiles };
}

// --- ASOSIY MANTIQ ---

function main() {
  console.log("Loyihani tahlil qilish boshlandi...");

  let markdownContent = `# Loyiha Tahlili Hisoboti\n\nSana: ${new Date().toLocaleString()}\n\n`;

  const { structure, files } = analyzeDirectory(ROOT_DIR);

  // 1. Fayl strukturasi
  markdownContent += "## 📁 Fayl Strukturasi\n\n";
  markdownContent += "```\n";
  markdownContent += `${path.basename(ROOT_DIR)}\n`;
  markdownContent += structure;
  markdownContent += "```\n\n";

  // 2. Muhim fayllar tarkibi
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

  // Natijani faylga yozish
  fs.writeFileSync(OUTPUT_FILE, markdownContent);

  console.log(
    `✅ Tahlil muvaffaqiyatli yakunlandi! Natijalar "${OUTPUT_FILE}" fayliga saqlandi.`
  );
}

// Skriptni ishga tushirish
main();
