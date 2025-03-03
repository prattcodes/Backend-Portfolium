const { Cloudflare } = require('cloudflare');

// Initialize Cloudflare client
const cloudflare = new Cloudflare({
  token: process.env.CLOUDFLARE_API_TOKEN
});

// Account ID from environment variables
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

// Configure Cloudflare Images client
const configureCloudflareImages = () => {
  return {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
    imagesToken: process.env.CLOUDFLARE_IMAGES_TOKEN,
    deliveryUrl: process.env.CLOUDFLARE_IMAGES_DELIVERY_URL
  };
};

// Configure Cloudflare R2 Storage client
const configureCloudflareR2 = () => {
  return {
    endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME
  };
};

module.exports = {
  cloudflare,
  accountId,
  configureCloudflareImages,
  configureCloudflareR2
};