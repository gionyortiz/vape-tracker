# NexaQuantum Vape - App Store Deployment Guide

## Quick Start - PWABuilder Method (EASIEST)

### Step 1: Generate App Packages
1. Go to **https://www.pwabuilder.com/**
2. Enter: `nexaquantumvape.com`
3. Click **"Start"**
4. Wait for analysis (score should show 35/44 or better)
5. Click **"Package For Stores"** button
6. Download packages for each platform:
   - **Android**: Download `.aab` file
   - **iOS**: Download iOS package
   - **Windows**: Download `.msixbundle` file

---

## Android Deployment (Google Play Store)

### Requirements
- Google Play Console account ($25 one-time fee)
- Android App Bundle (`.aab` file) from PWABuilder

### Steps
1. **Create Developer Account**
   - Go to: https://play.google.com/console
   - Pay $25 registration fee
   - Complete account setup

2. **Create New App**
   - Click "Create app"
   - App name: `NexaQuantum Vape`
   - Package name: `com.nexaquantum.vape.pos`
   - Category: Business
   - Select "Free" (unless you want paid app)

3. **Upload App Bundle**
   - Go to "Production" → "Create new release"
   - Upload the `.aab` file from PWABuilder
   - Fill in release notes

4. **Store Listing** (copy from `store-assets/android/play-store-listing.txt`)
   - Title: NexaQuantum Vape
   - Short description: Professional vape shop POS system
   - Full description: Complete inventory, sales tracking, and customer management
   - Screenshots: Use files from `images/screenshots/`
   - App icon: Use `images/icon-512.png`

5. **Content Rating**
   - Complete questionnaire (select "Business" app)
   - Most answers will be "No"

6. **Submit for Review**
   - Review takes 1-7 days
   - You'll get email notification when approved

---

## iOS Deployment (Apple App Store)

### Requirements
- Apple Developer Account ($99/year)
- Mac computer with Xcode
- iOS package from PWABuilder

### Steps
1. **Create Developer Account**
   - Go to: https://developer.apple.com/programs/
   - Enroll for $99/year
   - Complete account verification (can take 1-2 days)

2. **Prepare in Xcode**
   - Extract iOS package from PWABuilder
   - Open `.xcodeproj` file in Xcode
   - Update signing certificates
   - Set Bundle ID: `com.nexaquantum.vape.pos`

3. **App Store Connect**
   - Go to: https://appstoreconnect.apple.com/
   - Click "My Apps" → "+" → "New App"
   - Fill in app information
   - Use content from `store-assets/ios/app-store-listing.txt`

4. **Upload to App Store**
   - In Xcode: Product → Archive
   - Validate archive
   - Upload to App Store Connect
   - Submit for review

5. **Review Process**
   - Apple review takes 1-3 days typically
   - Be ready to respond to reviewer questions

---

## Windows Deployment (Microsoft Store)

### Requirements
- Microsoft Developer Account ($19/year)
- Windows package from PWABuilder

### Steps
1. **Create Developer Account**
   - Go to: https://partner.microsoft.com/dashboard
   - Register for $19/year

2. **Create App Submission**
   - Partner Center → "Create new app"
   - Reserve name: "NexaQuantum Vape"
   - Use content from `store-assets/windows/microsoft-store-listing.txt`

3. **Upload Package**
   - Upload `.msixbundle` from PWABuilder
   - Complete all required fields
   - Add screenshots from `images/screenshots/`

4. **Submit for Certification**
   - Review takes 1-3 days
   - App will be live when approved

---

## Alternative: Cordova Build (Advanced)

If PWABuilder doesn't work, you can build locally:

### Android
```powershell
# Initialize Cordova (if needed)
cordova platform add android

# Build release
cordova build android --release

# Sign the APK (requires keystore)
# Follow: CERTIFICATE-GENERATION-GUIDE.md
```

### iOS (Requires Mac)
```bash
cordova platform add ios
cordova build ios --release
```

---

## Post-Launch Checklist

- [ ] Test installed app on real device
- [ ] Verify all features work (inventory, sales, reports)
- [ ] Test offline functionality
- [ ] Verify bilingual support (EN/ES)
- [ ] Monitor app reviews
- [ ] Respond to user feedback
- [ ] Plan updates (bug fixes, new features)

---

## Support & Resources

- **Live App**: https://nexaquantumvape.com
- **PWABuilder**: https://www.pwabuilder.com/
- **Google Play Console**: https://play.google.com/console
- **Apple App Store Connect**: https://appstoreconnect.apple.com/
- **Microsoft Partner Center**: https://partner.microsoft.com/dashboard

---

## Costs Summary

| Platform | One-Time | Annual | Total Year 1 |
|----------|----------|--------|--------------|
| Android  | $25      | $0     | $25          |
| iOS      | $0       | $99    | $99          |
| Windows  | $0       | $19    | $19          |
| **Total**| **$25**  |**$118**| **$143**     |

---

## Timeline Estimate

- PWA packaging: **5-10 minutes**
- Android review: **1-7 days**
- iOS review: **1-3 days**
- Windows review: **1-3 days**

**Total time to all stores live**: ~2 weeks maximum

---

## Current Status

✅ PWA live at nexaquantumvape.com  
✅ Config updated with NexaQuantum branding  
⏳ Waiting for PWABuilder package generation  
⏳ Android store submission (pending)  
⏳ iOS store submission (pending)  
⏳ Windows store submission (pending)  

---

**Next Action**: Open PWABuilder and download your app packages!
