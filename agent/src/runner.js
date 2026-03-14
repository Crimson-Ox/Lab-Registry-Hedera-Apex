require("dotenv").config();

const path = require("path");
const { startFolderListener } = require("./listener");

async function main() {
  const watchFolder =
    process.env.LAB_AGENT_WATCH_FOLDER ||
    path.join(__dirname, "..", "lab-input");

  startFolderListener(watchFolder);
}

if (require.main === module) {
  main();
}

