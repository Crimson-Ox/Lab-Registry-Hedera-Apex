const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { anchorReport } = require("./index");

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function parseCsvLine(line) {
  const [idStr, patientName, patientAddress, testName, resultValue] =
    line.split(",");

  const id = Number(idStr);
  if (!Number.isFinite(id)) {
    throw new Error(`Invalid id in CSV: ${idStr}`);
  }

  return {
    id,
    patientName: patientName?.trim(),
    patientAddress: patientAddress?.trim(),
    testName: testName?.trim(),
    resultValue: resultValue?.trim(),
  };
}

function scrubLabRecord(record) {
  const hashedPatientId = hashValue(record.patientName || "unknown");

  const summary = `AI Analysis Placeholder for ${record.testName}: ${record.resultValue}`;

  return {
    id: record.id,
    resultSummary: summary,
    technicianName: process.env.LAB_REGISTRY_AGENT_NAME || "Uzumaki-AI-Agent",
    patientEvmAddress: record.patientAddress,
    hashedPatientId,
  };
}

async function processCsvFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);

  for (const line of lines) {
    try {
      const parsed = parseCsvLine(line);
      const scrubbed = scrubLabRecord(parsed);

      await anchorReport({
        id: scrubbed.id,
        resultSummary: scrubbed.resultSummary,
        technicianName: scrubbed.technicianName,
        patientEvmAddress: scrubbed.patientEvmAddress,
      });
    } catch (err) {
      console.error(`Failed to process line "${line}":`, err.message);
    }
  }
}

function startFolderListener(folderPath) {
  const watchPath = path.resolve(folderPath);

  if (!fs.existsSync(watchPath)) {
    fs.mkdirSync(watchPath, { recursive: true });
  }

  console.log(`Watching folder for lab files: ${watchPath}`);

  fs.watch(watchPath, async (eventType, filename) => {
    if (!filename || !filename.endsWith(".csv")) return;

    const fullPath = path.join(watchPath, filename);

    // Simple debounce: wait a moment for the write to finish.
    setTimeout(() => {
      processCsvFile(fullPath).catch((err) =>
        console.error("Error processing file:", err)
      );
    }, 500);
  });
}

module.exports = { startFolderListener, processCsvFile };

