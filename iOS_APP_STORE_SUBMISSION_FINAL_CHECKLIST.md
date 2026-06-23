# iOS App Store Final Submission Checklist - NXQ RETAIL v1.0

**Status**: 3 blockers remain. Estimated time to finish: 15 minutes.

---

## STEP 1: Complete App Privacy Questionnaire (5 minutes)

1. Open the shared App Store Connect tab
2. Click **Distribution** → **App Store** → **App Privacy**
3. Click **Get Started** button
4. Answer the data collection questions:
   - **Does your app collect, use, or share user data?** Select: **YES**
   - **What data does your app collect?** Check these boxes:
     - ☑️ User ID
     - ☑️ Purchase History (customer transactions)
     - ☑️ Product Interaction (barcode scans, product views)
     - ☑️ Other Data (inventory, store settings)
   - **Is collected data linked to user identity?** Select: **NO** (app stores data locally, no account tracking)
   - **Data is deleted at user request?** Select: **YES** (via Data Manager export/clear)
   - **Does your app track users?** Select: **NO**
   - **Does your app serve ads?** Select: **NO**
5. Review the summary and click **Publish**
6. Wait for "Privacy details published" confirmation

---

## STEP 2: Upload Screenshots (5 minutes)

### iPhone Screenshots (Required - at least 3, recommended 5+)

1. Return to **Distribution** → **iOS App** → **1.0 Prepare for Submission**
2. Scroll to **Previews and Screenshots** section
3. Make sure **iPhone** tab is selected
4. Click **Choose File** button
5. Navigate to: `e:\webside\app\vape-tracker1.3\images\screenshots\`
6. Upload these images in order (use `NXQ RETAIL.png` or create app flow screenshots):
   - Screenshot 1: Dashboard (sales overview)
   - Screenshot 2: Inventory (product list)
   - Screenshot 3: Sales (checkout flow)
   - Screenshot 4: Barcode Scanner
   - Screenshot 5: Reports

**Valid iPhone sizes**: 1242 × 2688px, 1284 × 2778px, or 2688 × 1242px, 2778 × 1284px (landscape)

### iPad Screenshots (Recommended if app supports tablet)

1. Click the **iPad** tab
2. Click **Choose File**
3. Upload 2-3 iPad-sized screenshots if available
   - If using same images, Apple will auto-scale
   - If no iPad screenshots, leave empty (app will still work)

**Valid iPad sizes**: 2048 × 2732px or 2732 × 2048px (landscape)

---

## STEP 3: Finalize App Review Information (5 minutes)

### Sign-In Decision (Choose ONE):

**Option A: NO Login Required (RECOMMENDED for POS retail app)**
1. Scroll to **App Review Information**
2. Find **Sign-In Information** section
3. **UNCHECK** the checkbox next to "Sign-in required"
4. Leave username and password fields empty

**Option B: Login Required**
1. Keep checkbox **CHECKED**
2. Enter demo account credentials:
   - **Username**: `demo@nexaquantum.com`
   - **Password**: `DemoReview123!`
3. Scroll to **Notes** field and paste:
   ```
   This is a point-of-sale system for retail store operations. 
   The app works offline and does not require account login for basic functionality.
   For testing: access the app dashboard directly without login, 
   navigate through Inventory, Sales, and Reports using sample data pre-loaded in the app.
   ```

### Contact Information (Required)
1. Scroll to **Contact Information** section
2. Fill in:
   - **First name**: `Giony`
   - **Last name**: `Ortiz`
   - **Phone number**: Your contact phone (e.g., from your Apple Developer account)
   - **Email**: `gionyortiz@hotmail.com`

### Notes (Optional but recommended)
Add this text to **Notes** field:
```
NXQ RETAIL is a professional point-of-sale system for retail stores, 
specifically designed for vape and smoke shop operators.

Key features for review:
- Local data storage with no external API calls
- Barcode scanning support (camera-based on iOS)
- Receipt printing for thermal printers
- Offline-first operation with automatic data persistence
- Touch-optimized for iPad and iPhone tablets

The app collects minimal user data (only local transaction records) 
and does not require account login. All data remains on-device in browser localStorage.

Test flow:
1. Open app (no login required)
2. Navigate Dashboard → Inventory → Sales → Reports
3. Add a sample product (Inventory → Add Product)
4. Process a test transaction (Sales → Add to Cart → Complete)
5. Check data persists on refresh
```

---

## STEP 4: Save and Submit (2 minutes)

1. Scroll to top of page
2. Click **Save** button (should turn from gray to blue when changes are detected)
3. Wait for "Changes saved" notification
4. Click **Add for Review** button
5. Confirm submission in any popup dialog
6. You will see: "Submission details: https://expo.dev/...submitted to Apple"
7. Apple will process for 5-15 minutes
8. You'll receive email when processing completes

---

## Current Status Summary

| Section | Status | Blocker |
|---------|--------|---------|
| Metadata (Promo, Desc, Keywords) | ✅ DONE | None |
| Support/Marketing URLs | ✅ DONE | None |
| Build (iOS build 4, v1.0.0) | ✅ DONE | None |
| App Privacy Questionnaire | ❌ PENDING | **Needs answers to data Q's** |
| Screenshots | ❌ PENDING | **0 of 10 uploaded** |
| App Review Info | ❌ PENDING | **Sign-in + contact** |
| **SUBMISSION READY?** | 🔴 NO | **All 3 blockers must finish** |

---

## If Screenshots Fail (404 or missing dimensions)

The images at `e:\webside\app\vape-tracker1.3\images\screenshots\NXQ RETAIL.png` are 1254×1254 (square app icon, NOT suitable for screenshots).

**Fix**: Use these alternatives:
1. Take device screenshots from iPhone simulator or physical device
2. Or use your browser's "Inspect → Device Emulation" to simulate iPhone 14 Pro (1179×2556), then screenshot the app
3. Or create simple placeholder images at 1284×2778 with text labels (Dashboard, Inventory, Sales, etc.)

If blocked on this, upload ANY valid iPhone screenshots—Apple will review with what you have, and you can update after approval.

---

## Final Command (After all steps complete)

Once you click Add for Review and see confirmation:
```
Your build has been successfully submitted to App Store Connect!
It is now being processed by Apple - you will receive an email when processing finishes.
```

**Submission is complete.** Build 4 (NXQ RETAIL v1.0.0) is in review queue.

✅ **Congratulations!** Your iOS app is now in Apple's review pipeline.
