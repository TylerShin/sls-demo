import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mime from "mime";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";

dotenv.config();
const STAGE = process.env["NODE_ENV"] || "development";
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const ASSET_CONTAINER_NAME = process.env.ASSET_CONTAINER_NAME;
const VERSION = new Date().toISOString();

async function uploadStream(
  blockBlobClient: BlockBlobClient,
  localFilePath: string
) {
  const contentType = mime.getType(localFilePath) || "application/octet-stream";
  await blockBlobClient.uploadStream(
    fs.createReadStream(localFilePath),
    4 * 1024 * 1024,
    20,
    {
      onProgress: ev => console.log(ev),
      blobHTTPHeaders: { blobContentType: contentType }
    }
  );
  console.log("uploadStream succeeds");
}

try {
  (async () => {
    if (!AZURE_STORAGE_CONNECTION_STRING)
      throw new Error("No valid AZURE_STORAGE_CONNECTION_STRING");
    if (!ASSET_CONTAINER_NAME) throw new Error("No valid ASSET_CONTAINER_NAME");

    fs.writeFileSync(path.resolve(__dirname, "..", "dist", "version"), VERSION);

    const blobServiceClient = await BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );

    const containerClient = blobServiceClient.getContainerClient(
      ASSET_CONTAINER_NAME
    );

    const assetFileNames = fs.readdirSync(
      path.resolve(__dirname, "..", "dist", "assets")
    );

    await Promise.all(
      assetFileNames.map(name => {
        const blockBlobClient = containerClient.getBlockBlobClient(
          `${STAGE}/${VERSION}/${name}`
        );
        return uploadStream(
          blockBlobClient,
          path.resolve(__dirname, "..", "dist", "assets", name)
        );
      })
    );
  })();
} catch (err) {
  console.error(err);
  console.log(err.message);
  process.exit(1);
}
