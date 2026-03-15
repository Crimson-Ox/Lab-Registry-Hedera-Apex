const pinataSDK = require("@pinata/sdk");

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_API_SECRET
);

/**
 * Pins diagnostic JSON data to IPFS via Pinata.
 * @param {Object} data - The diagnostic report data.
 * @returns {Promise<string>} - The IPFS CID.
 */
async function pinDiagnosticToIPFS(data) {
  try {
    const options = {
      pinataMetadata: {
        name: `LabReport-${data.id || Date.now()}`,
        keyvalues: {
          test: data.testName || "Unknown",
          patient: data.hashedPatientId || "Unknown"
        }
      },
      pinataOptions: {
        cidVersion: 0
      }
    };

    const result = await pinata.pinJSONToIPFS(data, options);
    console.log(`[IPFS] Pinned CID: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (err) {
    console.error("[IPFS] Pinning failed:", err);
    throw new Error(`Failed to pin data to IPFS: ${err.message}`);
  }
}

module.exports = { pinDiagnosticToIPFS };
