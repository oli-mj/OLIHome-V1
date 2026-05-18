# OLIHome — Developer Environment Guide

---

## Projects Overview

| Project | Location | Purpose |
|---------|----------|---------|
| `OLIHome-V1` | `Desktop/OLIHome-V1/` | Ionic/Angular mobile app (frontend) |

---

## 📱 OLIHome-V1

### Tech Stack
- **Framework:** Ionic 7 + Angular
- **Language:** TypeScript
- **Mobile Runtime:** Capacitor (Android / iOS)
- **Dev Server Port:** `http://localhost:8100`

### Prerequisites
```bash
node --version    
npm --version     
npx ionic --version
```

### Setup
```bash
cd Desktop/OLIHome-V1
npm install
npx ionic serve         # Starts dev server on http://localhost:8100
```

### Environment / API Config

All API URLs are controlled from:

```
src/environments/environment.ts          ← Development
src/environments/environment.prod.ts     ← Production
```

**`environment.ts` (Development)**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'   // ← Point to your local backend
};
```

**`environment.prod.ts` (Production)**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.olihome.com/api' // ← Replace with live server URL
};
```

> **For a new dev machine:** Only `environment.ts` needs to change.
> Update `apiUrl` to point to wherever your local backend is running.

### How API Calls Work

All HTTP calls go through the central API service:
- `src/app/services/api/api.service.ts`
- `src/app/core/services/api.service.ts`

Both read `environment.apiUrl` automatically — you do **not** need to change individual service files.

### Auth

The app uses HTTP interceptors to attach auth tokens to every request:
- `src/app/interceptors/auth.interceptor.ts`
- `src/app/core/interceptors/auth.interceptor.ts`

---

## Amenity Booking Process

### Overview

The booking workflow follows a strict **Verification-First** sequence:

```
1. User selects an amenity         → Calendar view
2. User selects a date             → Calendar view
3. User selects a time slot        → Time Slots Modal
4. User fills the booking form     → Uploads payment proof
5. Booking submitted               → Status: PENDING
6. Admin reviews payment proof     → Approves or Rejects
7. Status updated                  → APPROVED (green) or REJECTED
```

---

### Backend API Requirements

The backend must expose the following endpoint for the mobile app to call:

```
POST /api/bookings/with-attachment
Content-Type: multipart/form-data
```

**Request Body (FormData fields):**

| Field | Type | Description |
|-------|------|-------------|
| `amenityId` | string | ID of the selected amenity |
| `tenantId` | string | ID of the current logged-in user |
| `tenantName` | string | Full name of the current user |
| `date` | string | Selected date in `YYYY-MM-DD` format |
| `startTime` | string | Time slot start in `HH:mm` format |
| `endTime` | string | Time slot end in `HH:mm` format |
| `status` | string | Always `"PENDING"` on creation |
| `attachment` | File | Payment proof (multipart binary) |

**Expected Response (JSON):**
```json
{
  "id": "string",
  "amenityId": "string",
  "tenantId": "string",
  "tenantName": "string",
  "date": "YYYY-MM-DD",
  "startTime": "HH:mm",
  "endTime": "HH:mm",
  "status": "PENDING",
  "attachmentUrl": "https://...",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

**Server responsibilities:**
- Store the uploaded file in cloud storage or local file system
- Generate and return a public `attachmentUrl`
- Create the booking record with `PENDING` status
- (Optional) Send email notification to admin for review

---

### Integration Functions

#### Step 1 — Open Time Slots Modal

In `BookAmenityPage`, when the user taps a date on the calendar:

```typescript
async openTimeSlotsModal(date: string) {
  const modal = await this.modalController.create({
    component: TimeSlotsModalComponent,
    componentProps: {
      amenityId: this.selectedAmenity.id,
      selectedDate: date,
    },
  });

  modal.componentInstance.slotSelected.subscribe((slot: TimeSlotWithBooking) => {
    this.onTimeSlotSelected(slot);
    modal.dismiss();
  });

  await modal.present();
}
```

#### Step 2 — Navigate to Booking Form

After the user selects a slot, pass all necessary data through Angular Router state:

```typescript
proceedToBookingForm(slot: TimeSlotWithBooking) {
  this.router.navigate(
    ['/main/community-living/book-amenity/booking-form'],
    {
      state: {
        amenity: this.selectedAmenity,   // Full amenity object (includes pricePerSlot)
        selectedDate: this.selectedDate, // YYYY-MM-DD string
        timeSlot: slot,                  // { id, startTime, endTime }
      },
    }
  );
}
```

#### Step 3 — Wiring Authentication (Booking Form)

The booking form reads the current user from `AuthService` to populate `tenantId` and `tenantName`:

```typescript
import { AuthService } from './auth/auth.service';

export class BookingFormComponent {
  private authService = inject(AuthService);

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.tenantId   = currentUser.id;
    this.tenantName = currentUser.fullName || currentUser.name;
  }
}
```

#### Step 4 — Payment Amount Calculation

The payment amount is driven by `amenity.pricePerSlot` received from navigation state:

```typescript
calculatePaymentAmount() {
  this.paymentAmount = this.amenity?.pricePerSlot || 0;

  // Optional: dynamic pricing example
  // if (this.isHoliday(this.selectedDate)) {
  //   this.paymentAmount *= 1.5; // 50% surcharge on holidays
  // }
}
```

#### Step 5 — File Upload (from device gallery or camera)

**From file input (gallery/files):**

The form uses a hidden `<input type="file">` triggered by a styled upload area. Accepted types and size limits are validated client-side before the file is attached to the form submission.

**From device camera (optional, Capacitor):**

```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

async capturePaymentProof() {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Base64,
  });

  const file = new File(
    [this.base64toBlob(image.base64String || '')],
    'payment-proof.jpg',
    { type: 'image/jpeg' }
  );

  this.handleFileSelection(file);
}
```

**File validation rules (enforced client-side):**

| Rule | Value |
|------|-------|
| Max file size | 10 MB |
| Allowed types | PNG, JPG, JPEG, PDF |
| Required | Yes |

---

### Booking Status Flow

| Status | Meaning | Calendar Display |
|--------|---------|-----------------|
| `PENDING` | Submitted, waiting for admin review | Yellow / neutral |
| `APPROVED` | Admin confirmed the booking | Green badge |
| `REJECTED` | Payment proof rejected | Not shown on calendar |

---

### Error Handling Scenarios

| Scenario | HTTP Code | App Behavior |
|----------|-----------|--------------|
| File upload failure | — | Show error toast, keep form intact, allow retry |
| Network error | any | Show generic error toast, allow retry |
| Slot already booked | `409 Conflict` | Show message, reset form, navigate back to calendar |
| Amenity unavailable | `400 Bad Request` | Show message, navigate back to amenity list |

---

### Notes for Backend Integration

- Phone numbers and user IDs must match what is stored in the backend user system.
- The `attachmentUrl` returned by the backend must be publicly accessible (or use signed URLs).
- The backend should also enforce file type and size limits server-side — never trust client-side validation alone.
- For Android USB testing, replace `localhost` in `environment.ts` with your machine's local IP (e.g., `192.168.1.x:3000`).
