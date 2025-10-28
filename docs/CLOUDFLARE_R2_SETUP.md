# CloudFlare R2 Storage Setup Guide

CloudFlare R2 is used for cost-effective image and media storage with no egress fees. This guide covers setup and configuration.

## Why CloudFlare R2?

- **Zero egress fees**: Unlike S3, R2 doesn't charge for bandwidth
- **S3 Compatible API**: Easy migration and familiar interface
- **Global CDN**: Built-in CloudFlare CDN for fast delivery
- **Cost-effective**: ~$0.015/GB/month for storage (vs S3's $0.023/GB/month)

## Prerequisites

- A CloudFlare account (sign up at https://cloudflare.com)
- CloudFlare Workers enabled (free tier available)

## Step 1: Enable R2

1. Log in to your CloudFlare dashboard
2. Go to **R2** in the sidebar
3. Click **Enable R2** (you may need to verify payment method, but free tier is available)

## Step 2: Create R2 Buckets

Create the following buckets:

### Production Bucket
```bash
Bucket name: privacy-social-uploads-prod
Location: Automatic (or choose based on your users)
```

### Staging Bucket
```bash
Bucket name: privacy-social-uploads-staging
Location: Automatic
```

### Development Bucket
```bash
Bucket name: privacy-social-uploads-dev
Location: Automatic
```

## Step 3: Generate API Tokens

1. Go to **R2** → **Manage R2 API Tokens**
2. Click **Create API Token**
3. Configure token:
   - **Token name**: privacy-social-app
   - **Permissions**:
     - Object Read & Write
     - Bucket Read
   - **Buckets**: Select the buckets you created
4. Click **Create API Token**
5. **Save these credentials** (they won't be shown again):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL

## Step 4: Configure CORS

For each bucket, configure CORS to allow your app domains:

1. Select your bucket
2. Go to **Settings** → **CORS Policy**
3. Add the following policy:

```json
[
  {
    "AllowedOrigins": [
      "https://your-app-domain.com",
      "https://*.vercel.app",
      "http://localhost:8081",
      "exp://*"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3600
  }
]
```

## Step 5: Set Up Public Access (Optional)

For public read access (thumbnails, avatars):

1. Go to **Bucket Settings**
2. Enable **Public Access**
3. Configure custom domain (optional but recommended):
   - Go to **R2** → **Custom Domains**
   - Add: `cdn.your-domain.com`
   - Configure DNS as instructed

## Step 6: Configure Environment Variables

Add to your `.env` file:

```env
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=privacy-social-uploads-prod
CLOUDFLARE_R2_PUBLIC_URL=https://your-bucket-url.r2.dev
```

To find your Account ID:
1. Go to CloudFlare dashboard
2. Look at the URL: `dash.cloudflare.com/{ACCOUNT_ID}/r2`

## Step 7: Set Up Lifecycle Rules

Configure automatic deletion for expired content:

1. Go to bucket settings
2. Add lifecycle rule:
   - **Rule name**: auto-delete-expired
   - **Filter**: All objects
   - **Expiration**: 30 days after creation
   - Apply to all objects in bucket

## Step 8: Configure CloudFlare CDN (Optional but Recommended)

1. Create a CloudFlare Worker for image optimization:

```javascript
// worker.js - Image optimization worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1);

    // Get object from R2
    const object = await env.BUCKET.get(key);

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    // Set cache headers
    const headers = new Headers();
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Content-Type', object.httpMetadata.contentType);

    return new Response(object.body, { headers });
  }
};
```

2. Deploy the worker:
```bash
wrangler publish
```

## Storage Structure

Organize files in R2 with the following structure:

```
/users/{user_id}/avatar/{filename}
/shares/{share_id}/original/{filename}
/shares/{share_id}/medium/{filename}
/shares/{share_id}/thumbnail/{filename}
/temp/{upload_id}/{filename}
```

## Cost Optimization Strategies

1. **Multi-resolution storage**: Store 3 sizes to avoid on-the-fly resizing
2. **WebP format**: Use WebP for 30-50% size reduction
3. **Aggressive compression**: Optimize images before upload
4. **Lifecycle policies**: Automatic deletion after 30 days
5. **Deduplication**: Hash-based storage to avoid duplicates

## Security Best Practices

1. **Never expose Secret Access Key** in client apps
2. **Use signed URLs** for upload authorization
3. **Validate file types** before upload
4. **Implement rate limiting** on uploads
5. **Scan uploads** for malicious content
6. **Encrypt sensitive images** before storage

## Integration Code

Create an R2 service in your app:

```typescript
// src/services/r2Storage.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export const uploadToR2 = async (file: Buffer, key: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'image/webp',
  });

  return r2Client.send(command);
};
```

## Monitoring

Track R2 usage in CloudFlare dashboard:
- **Storage Used**: Monitor storage consumption
- **Operations**: Track read/write operations
- **Bandwidth**: Monitor data transfer (free with R2!)

## Cost Example

For 1M daily active users:
- Storage: 16.5TB → ~$247.50/month
- Class A operations (writes): 1M/day → ~$4.50/month
- Class B operations (reads): 10M/day → ~$0.36/month
- **Total: ~$252/month** (vs S3: ~$500+/month with egress)

## Troubleshooting

### Upload Failures
- Check API credentials are correct
- Verify CORS policy includes your domain
- Ensure file size doesn't exceed limits
- Check bucket permissions

### Access Denied
- Verify API token has correct permissions
- Check bucket name is correct
- Ensure token hasn't expired

### Slow Performance
- Use custom domain with CloudFlare CDN
- Implement image optimization worker
- Cache frequently accessed images
- Use appropriate image sizes

## Resources

- [CloudFlare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/)
- [Workers with R2](https://developers.cloudflare.com/r2/api/workers/)
