# Photo Selection & Processing Documentation

## Overview

The Photo Selection & Processing system automatically selects random photos from the user's library, processes them for optimal upload, and provides a user-friendly interface for review and approval before sharing with groups.

## Architecture

### Services

#### 1. Photo Selection Service (`src/services/photoSelection.ts`)

Handles random selection of photos from the device photo library.

**Key Functions:**
- `selectRandomPhoto()`: Randomly selects a single photo from the user's library
- `selectMultipleRandomPhotos(count)`: Selects multiple random photos
- `getPhotoById(id)`: Retrieves photo info by ID
- `getTotalPhotoCount()`: Gets total photo count in library

**Example:**
```typescript
import { photoSelection } from '@/services/photoSelection';

// Select random photo
const selection = await photoSelection.selectRandomPhoto();
if (selection) {
  console.log('Selected:', selection.photo.filename);
  console.log('Total photos:', selection.totalPhotos);
}
```

#### 2. Image Processing Service (`src/services/imageProcessing.ts`)

Handles EXIF stripping, compression, format conversion, and multi-resolution generation.

**Key Functions:**
- `stripEXIF(uri)`: Strips EXIF metadata from images
- `compressImage(uri, options)`: Compresses images with quality options
- `getAdaptiveQuality()`: Calculates quality based on network conditions
- `generateMultiResolution(uri)`: Generates thumbnail, medium, and full resolutions
- `convertToWebP(uri, quality)`: Converts images to WebP format

**Adaptive Quality:**
- **WiFi**: 90% quality
- **Ethernet**: 95% quality
- **Cellular**: 70% quality
- **Offline**: 50% quality (for caching)

**Resolution Sizes:**
- **Thumbnail**: 150x150 pixels, 70% quality
- **Medium**: 800x800 pixels, 80% quality
- **Full**: Original size with adaptive quality

**Example:**
```typescript
import { imageProcessing } from '@/services/imageProcessing';

// Generate all resolutions
const images = await imageProcessing.generateMultiResolution(photoUri);
if (images) {
  console.log('Thumbnail:', images.thumbnail.fileSize);
  console.log('Medium:', images.medium.fileSize);
  console.log('Full:', images.full.fileSize);
}

// Convert to WebP
const webp = await imageProcessing.convertToWebP(photoUri, 0.8);
```

#### 3. Photo Cache Service (`src/services/photoCache.ts`)

Secure local caching with automatic expiration and size management.

**Features:**
- 100MB max cache size
- 7-day default expiration
- Automatic cleanup of expired items
- LRU eviction when size limit exceeded

**Key Functions:**
- `cachePhoto(id, uri, resolution, expirationDays)`: Cache a photo
- `getCachedPhoto(id, resolution)`: Retrieve cached photo
- `deleteCachedPhoto(id, resolution)`: Delete cached photo
- `clearCache()`: Clear all cached photos
- `getCacheStats()`: Get cache statistics

**Example:**
```typescript
import { photoCache } from '@/services/photoCache';

// Initialize cache
await photoCache.initialize();

// Cache photo
await photoCache.cachePhoto('photo-123', uri, 'thumbnail', 7);

// Retrieve cached photo
const cachedUri = await photoCache.getCachedPhoto('photo-123', 'thumbnail');

// Get stats
const stats = await photoCache.getCacheStats();
console.log('Total size:', stats.totalSize);
```

#### 4. Photo Upload Service (`src/services/photoUpload.ts`)

Handles uploads with progress tracking and exponential backoff retry logic.

**Features:**
- Progress callbacks for real-time updates
- Automatic retry up to 3 times
- Exponential backoff (2s, 4s, 8s delays)
- Upload cancellation support
- Multi-resolution upload (thumbnail, medium, full)

**Key Functions:**
- `uploadPhoto(photoId, userId, groupId, images, caption)`: Upload all resolutions
- `subscribeToProgress(photoId, callback)`: Subscribe to upload progress
- `getProgress(photoId)`: Get current progress
- `cancelUpload(photoId)`: Cancel ongoing upload
- `clearCompletedUploads()`: Clean up memory

**Example:**
```typescript
import { photoUpload } from '@/services/photoUpload';

// Subscribe to progress
const unsubscribe = photoUpload.subscribeToProgress('photo-123', (progress) => {
  console.log(`Progress: ${progress.progress}%`);
  console.log(`Status: ${progress.status}`);
});

// Upload photo
const result = await photoUpload.uploadPhoto(
  'photo-123',
  userId,
  groupId,
  processedImages,
  'Optional caption'
);

if (result.success) {
  console.log('Uploaded!', result.urls);
}

unsubscribe();
```

### State Management

#### Photo Store (`src/store/photoStore.ts`)

Zustand store that orchestrates all photo services and manages UI state.

**State:**
```typescript
interface PhotoState {
  currentPhoto: PhotoInfo | null;
  currentSelection: SelectionResult | null;
  processedImages: MultiResolutionImages | null;
  showPreviewModal: boolean;
  isProcessing: boolean;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}
```

**Actions:**
- `selectRandomPhoto()`: Triggers random selection
- `processSelectedPhoto()`: Processes photo into multi-resolution
- `uploadPhoto(userId, groupId, caption)`: Uploads photo
- `clearSelection()`: Clears current selection
- `setShowPreviewModal(show)`: Controls modal visibility
- `clearError()`: Clears error state

**Example:**
```typescript
import { usePhotoStore } from '@/store/photoStore';

function MyComponent() {
  const {
    currentPhoto,
    showPreviewModal,
    isProcessing,
    selectRandomPhoto,
    uploadPhoto,
  } = usePhotoStore();

  const handleSelect = async () => {
    await selectRandomPhoto();
  };

  const handleUpload = async () => {
    await uploadPhoto(userId, groupId, 'My caption');
  };

  return (
    // Your component JSX
  );
}
```

### UI Components

#### PhotoPreviewModal (`src/components/PhotoPreviewModal.tsx`)

Modal that displays the randomly selected photo with action buttons.

**Props:**
```typescript
interface PhotoPreviewModalProps {
  visible: boolean;
  photo: PhotoInfo | null;
  onPush: (caption?: string) => void;
  onTryAgain: () => void;
  onRefuse: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  uploadProgress?: number;
}
```

**Actions:**
- **Push to Group** (🚀): Upload photo with optional caption
- **Try Again** (🎲): Select a different random photo
- **Refuse** (❌): Decline the selection

**Features:**
- Full-screen photo preview
- Optional caption input (500 character limit)
- Photo metadata display (dimensions, date)
- Upload progress bar
- Smooth animations

**Example:**
```typescript
<PhotoPreviewModal
  visible={showModal}
  photo={selectedPhoto}
  onPush={(caption) => handleUpload(caption)}
  onTryAgain={() => selectNewPhoto()}
  onRefuse={() => declinePhoto()}
  onClose={() => setShowModal(false)}
  isProcessing={isUploading}
  uploadProgress={progress}
/>
```

## User Flow

### Automatic Selection (Notification-Triggered)

1. **Trigger**: User receives push notification (daily or group-specific)
2. **Selection**: App automatically selects random photo from library
3. **Processing**: Photo is processed (EXIF strip, compress, multi-resolution)
4. **Preview**: User sees PhotoPreviewModal with selected photo
5. **Decision**: User chooses one of four actions:

#### Action Options:

**A. Push to Group (Approve)**
- User can optionally add caption
- Photo uploads with progress indicator
- All three resolutions uploaded
- Success notification shown
- Modal closes automatically

**B. Try Again (Re-roll)**
- New random photo selected
- Previous selection discarded
- Modal stays open with new photo
- Process repeats

**C. Refuse (Decline)**
- Selection discarded
- Modal closes
- No upload occurs
- User notified of decline

**D. Add Caption**
- User adds optional caption (up to 500 characters)
- Caption included with upload when pushing

### Manual Testing Flow

For development/testing, a "Test Random Selection" button triggers the same flow:

```typescript
// In home screen or any component
const handleTestSelection = async () => {
  await usePhotoStore.getState().selectRandomPhoto();
};

<TouchableOpacity onPress={handleTestSelection}>
  <Text>🎲 Test Random Selection</Text>
</TouchableOpacity>
```

## Security & Privacy

### EXIF Stripping

All photos have EXIF metadata stripped before upload to protect privacy:
- Location data removed
- Camera model removed
- Timestamps normalized
- All embedded metadata cleaned

### Encryption

Photos are encrypted before upload:
1. Client-side encryption using user's keys
2. Only group members can decrypt
3. Server never has access to unencrypted photos

### Storage

#### Local Cache:
- 100MB max size
- 7-day expiration
- Encrypted at rest
- Automatic cleanup

#### Remote Storage:
- Supabase Storage
- Public URLs generated after upload
- 30-day auto-deletion policy
- Encrypted in transit and at rest

## Performance Optimization

### Network-Aware Quality

Upload quality automatically adjusts based on network:
```typescript
WiFi: 90% quality → ~2MB full-size image
Cellular: 70% quality → ~800KB full-size image
Offline: 50% quality → ~400KB (cached only)
```

### Multi-Resolution Benefits

- **Thumbnail**: Fast loading in lists (150x150, ~10KB)
- **Medium**: Preview/feed display (800x800, ~200KB)
- **Full**: High-quality viewing (original size with compression)

### Caching Strategy

- Processed images cached locally
- Reduces re-processing on retry
- Faster "Try Again" experience
- Automatic cleanup prevents disk bloat

### Upload Optimization

- Exponential backoff retry
- Progress tracking
- Cancellation support
- Batch operations possible

## Error Handling

### Common Errors

**Permission Denied:**
```typescript
if (!hasPermission) {
  // Show permission request dialog
  // Redirect to settings if needed
}
```

**No Photos Found:**
```typescript
if (totalPhotos === 0) {
  // Show "No photos in library" message
  // Suggest adding photos
}
```

**Upload Failed:**
```typescript
if (!result.success) {
  // Show retry button
  // Display error message
  // Keep selection for retry
}
```

**Network Error:**
```typescript
if (!isConnected) {
  // Show offline message
  // Cache photo for later
  // Suggest connecting to WiFi
}
```

## Testing

### Test Photo Selection

```typescript
import { photoSelection } from '@/services/photoSelection';

// Test selection
const result = await photoSelection.selectRandomPhoto();
console.log('Selected:', result?.photo.filename);
```

### Test Processing

```typescript
import { imageProcessing } from '@/services/imageProcessing';

// Test compression
const compressed = await imageProcessing.compressImage(uri, {
  quality: 0.8,
  maxWidth: 800,
});
console.log('Compressed size:', compressed?.fileSize);

// Test multi-resolution
const images = await imageProcessing.generateMultiResolution(uri);
console.log('Resolutions:', {
  thumbnail: images?.thumbnail.fileSize,
  medium: images?.medium.fileSize,
  full: images?.full.fileSize,
});
```

### Test Upload

```typescript
import { photoUpload } from '@/services/photoUpload';

// Test upload with progress
photoUpload.subscribeToProgress('test-id', (progress) => {
  console.log(`Upload: ${progress.progress}%`);
});

const result = await photoUpload.uploadPhoto(
  'test-id',
  userId,
  groupId,
  images
);
console.log('Upload result:', result.success);
```

## Future Enhancements

### Planned Features

1. **AI-Powered Selection**
   - Favor photos with faces
   - Avoid blurry/dark photos
   - Variety algorithm (different dates/locations)

2. **Advanced Filtering**
   - Date range filtering
   - Album-specific selection
   - Exclude sensitive photos

3. **Batch Operations**
   - Multiple photo selection
   - Queue management
   - Scheduled uploads

4. **Enhanced Processing**
   - HDR processing
   - Auto-enhancement
   - Face detection blur (for privacy)

5. **Analytics**
   - Selection patterns
   - Upload success rates
   - Performance metrics

## Troubleshooting

### Photo not loading
- Check permissions
- Verify photo exists in library
- Check cache directory permissions

### Upload failing
- Check network connection
- Verify Supabase credentials
- Check storage bucket permissions
- Review retry logic

### High memory usage
- Clear cache regularly
- Limit cached resolutions
- Reduce quality for cellular

### Slow processing
- Check device performance
- Reduce quality settings
- Process in background

## Dependencies

```json
{
  "expo-media-library": "~16.0.0",
  "expo-image-manipulator": "~12.0.0",
  "expo-file-system": "~16.0.0",
  "@react-native-async-storage/async-storage": "^1.21.0",
  "@react-native-community/netinfo": "^11.3.1"
}
```

## Resources

- [Expo Media Library Docs](https://docs.expo.dev/versions/latest/sdk/media-library/)
- [Expo Image Manipulator Docs](https://docs.expo.dev/versions/latest/sdk/imagemanipulator/)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
