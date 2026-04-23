---
title: QR Code System & Guest Flow
inclusion: manual
---

# QR Code System & Guest Experience

## Overview
QR codes provide frictionless access for guests to submit reviews and track their experience without requiring login.

## QR Code Flow

```
Operator creates event 
  → System generates unique QR code
  → Operator prints/shares QR
  → Guest scans QR
  → Opens review page
  → Guest submits review
  → Wrap auto-generated
  → Guest receives wrap link
```

## Database Schema

### `qr_codes` table
```sql
CREATE TABLE qr_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE, -- Short code like "ABC123"
  qr_image_url TEXT, -- Generated QR code image
  scans_count INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_event_id ON qr_codes(event_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code);
```

## QR Code Generation

### Generate Short Code
```typescript
// lib/qr-generator.ts
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

export function generateShortCode(): string {
  return nanoid(); // e.g., "ABC123XY"
}
```

### Generate QR Image
```typescript
import QRCode from 'qrcode';

export async function generateQRImage(url: string): Promise<string> {
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 512,
    margin: 2,
    color: {
      dark: '#1B4D3E', // Forest green
      light: '#FCFAF5', // Parchment
    },
  });
  
  // Upload to Supabase Storage
  const fileName = `qr-codes/${Date.now()}.png`;
  const { data } = await supabase.storage
    .from('safariwrap-assets')
    .upload(fileName, dataURLtoBlob(qrDataUrl));
  
  return data.publicUrl;
}
```

### Create QR for Event
```typescript
// app/api/events/[eventId]/qr/route.ts
export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const eventId = params.eventId;
  const shortCode = generateShortCode();
  const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/review/${shortCode}`;
  const qrImageUrl = await generateQRImage(reviewUrl);
  
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      event_id: eventId,
      code: shortCode,
      qr_image_url: qrImageUrl,
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return Response.json(data);
}
```

## Review Page Routes

### Dynamic Route: `/review/[code]`
```typescript
// app/review/[code]/page.tsx
export default async function ReviewPage({
  params,
}: {
  params: { code: string };
}) {
  const code = params.code;
  
  // Get event from QR code
  const { data: qrCode } = await supabase
    .from('qr_codes')
    .select('*, events(*)')
    .eq('code', code)
    .single();
  
  if (!qrCode || !qrCode.active) {
    return <NotFound />;
  }
  
  // Track scan
  await trackQRScan(qrCode.id);
  
  return <ReviewForm event={qrCode.events} />;
}
```

### Track QR Scans
```typescript
async function trackQRScan(qrCodeId: string) {
  await supabase
    .from('qr_codes')
    .update({
      scans_count: supabase.raw('scans_count + 1'),
      last_scanned_at: new Date().toISOString(),
    })
    .eq('id', qrCodeId);
}
```

## Guest Review Form

### Mobile-First Design
```tsx
// components/ReviewForm.tsx
export function ReviewForm({ event }: { event: Event }) {
  const [step, setStep] = useState(1);
  
  return (
    <div className="review-form mobile-optimized">
      <ProgressBar current={step} total={5} />
      
      {step === 1 && <BasicInfoStep />}
      {step === 2 && <RatingStep />}
      {step === 3 && <ExperienceStep />}
      {step === 4 && <PhotoUploadStep />}
      {step === 5 && <ConsentStep />}
      
      <NavigationButtons
        onNext={() => setStep(step + 1)}
        onBack={() => setStep(step - 1)}
      />
    </div>
  );
}
```

### Step 1: Basic Info
```tsx
<div className="step">
  <h2>Welcome! 👋</h2>
  <p>Tell us about your experience</p>
  <Input
    name="guest_name"
    label="Your Name"
    placeholder="John Doe"
    required
  />
  <Input
    name="email"
    label="Email (optional)"
    type="email"
    placeholder="john@example.com"
  />
</div>
```

### Step 2: Rating
```tsx
<div className="step">
  <h2>How was your experience?</h2>
  <StarRating
    value={rating}
    onChange={setRating}
    size="large"
  />
  <Textarea
    name="review_text"
    label="Share your thoughts"
    placeholder="What made this experience special?"
    rows={4}
  />
</div>
```

### Step 3: Experience Details (Safari)
```tsx
<div className="step">
  <h2>What did you see? 🦁</h2>
  
  <AnimalSelector
    label="Big Five"
    options={BigFive}
    selected={bigFiveSeen}
    onChange={setBigFiveSeen}
  />
  
  <AnimalSelector
    label="Other Animals"
    options={OtherAnimals}
    selected={otherAnimals}
    onChange={setOtherAnimals}
  />
  
  <Select
    name="safari_duration"
    label="Safari Duration"
    options={SafariDurations}
  />
  
  <Select
    name="best_time"
    label="Best Time for Wildlife"
    options={WildlifeTimings}
  />
</div>
```

### Step 4: Photo Upload
```tsx
<div className="step">
  <h2>Share your photos 📸</h2>
  <p>Upload up to 3 photos</p>
  
  <PhotoUploader
    maxFiles={3}
    onUpload={handlePhotoUpload}
    accept="image/*"
    capture="environment" // Use camera on mobile
  />
  
  <div className="photo-preview">
    {photos.map((photo, i) => (
      <PhotoPreview
        key={i}
        src={photo}
        onRemove={() => removePhoto(i)}
      />
    ))}
  </div>
</div>
```

### Step 5: Consent
```tsx
<div className="step">
  <h2>Almost done! ✅</h2>
  
  <Checkbox
    name="data_consent"
    label="I consent to my review being used in the wrap"
    required
  />
  
  <Checkbox
    name="marketing_consent"
    label="I'd like to receive updates about future safaris"
  />
  
  <Button type="submit" size="large">
    Submit Review
  </Button>
</div>
```

## Photo Upload Flow

### Client-Side Upload
```typescript
async function uploadPhoto(file: File, reviewId: string, index: number) {
  // Compress image
  const compressed = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
  });
  
  // Generate filename
  const ext = file.name.split('.').pop();
  const fileName = `reviews/${reviewId}/photo_${index}.${ext}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('safariwrap-assets')
    .upload(fileName, compressed, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('safariwrap-assets')
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}
```

## Post-Submission Flow

### Success Page
```tsx
// app/review/[code]/success/page.tsx
export default function ReviewSuccess({ searchParams }: any) {
  const wrapId = searchParams.wrap;
  
  return (
    <div className="success-page">
      <h1>Thank you! 🎉</h1>
      <p>Your review has been submitted</p>
      
      <div className="wrap-preview">
        <h2>Your SafariWrap is ready!</h2>
        <Button href={`/wrap/${wrapId}`}>
          View Your Wrap
        </Button>
      </div>
      
      <ShareButtons wrapUrl={`/wrap/${wrapId}`} />
    </div>
  );
}
```

### Auto-Generate Wrap
```typescript
// After review submission
const review = await createReview(reviewData);

// Trigger wrap generation
const wrap = await generateWrap(review.trip_id);

// Redirect to success page with wrap ID
redirect(`/review/${code}/success?wrap=${wrap.id}`);
```

## QR Code Display (Operator Dashboard)

### QR Card Component
```tsx
<QRCodeCard event={event}>
  <img src={qrCode.qr_image_url} alt="QR Code" />
  <p className="short-code">{qrCode.code}</p>
  <p className="url">{reviewUrl}</p>
  
  <div className="stats">
    <Stat label="Scans" value={qrCode.scans_count} />
    <Stat label="Reviews" value={reviewCount} />
  </div>
  
  <ButtonGroup>
    <Button onClick={downloadQR}>Download QR</Button>
    <Button onClick={copyLink}>Copy Link</Button>
    <Button onClick={shareQR}>Share</Button>
  </ButtonGroup>
</QRCodeCard>
```

### Download QR Code
```typescript
function downloadQR(qrImageUrl: string, eventName: string) {
  const link = document.createElement('a');
  link.href = qrImageUrl;
  link.download = `${eventName}-qr-code.png`;
  link.click();
}
```

### Print-Ready QR
```tsx
// Generate printable QR with branding
<div className="qr-printable">
  <div className="header">
    <img src={operator.logo} />
    <h2>{event.title}</h2>
  </div>
  
  <div className="qr-container">
    <img src={qrCode.qr_image_url} />
  </div>
  
  <div className="instructions">
    <h3>Share Your Experience</h3>
    <p>Scan to leave a review</p>
    <p className="url">{reviewUrl}</p>
  </div>
  
  <div className="footer">
    <p>Powered by SafariWrap</p>
  </div>
</div>
```

## Analytics

### Track QR Performance
```typescript
interface QRAnalytics {
  total_scans: number;
  unique_scans: number; // Based on IP/device
  conversion_rate: number; // Scans → Reviews
  avg_time_to_review: number; // Minutes
  peak_scan_times: string[];
}
```

## Security Considerations

1. **Rate Limiting**: Prevent QR code abuse
2. **Expiration**: Optional QR expiry dates
3. **Single Use**: Option for one-time QR codes
4. **Validation**: Verify QR code is active before showing form
5. **Spam Protection**: Captcha for review submission

## Future Enhancements

1. **Dynamic QR Codes**: Update destination without reprinting
2. **Personalized QR**: Unique QR per guest
3. **NFC Support**: Tap-to-review with NFC tags
4. **Offline Mode**: Cache review form for offline submission
5. **Multi-Language**: Detect language from QR scan location
