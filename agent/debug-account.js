import {
  Client,
  AccountId,
  PrivateKey,
  TokenAssociateTransaction
} from "@hashgraph/sdk";

const accountId = "0.0.8182742";
const privateKey = PrivateKey.fromStringECDSA("private_key");

const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

const tokenId = "0.0.8138959";

const tx = await new TokenAssociateTransaction()
  .setAccountId(accountId)
  .setTokenIds([tokenId])
  .execute(client);

const receipt = await tx.getReceipt(client);

console.log("Association status:", receipt.status.toString());