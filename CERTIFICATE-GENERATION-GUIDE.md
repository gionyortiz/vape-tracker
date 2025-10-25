# 🔐 Certificate Generation Guide for App Store Deployment

## 🍎 iOS Certificates (Apple Developer Account Required - $99/year)

### Prerequisites
1. Apple Developer Account: https://developer.apple.com/account/
2. Xcode installed on macOS
3. Valid Apple ID

### Step-by-Step iOS Certificate Generation

#### 1. Create App Identifier
1. Log into Apple Developer Portal
2. Go to "Certificates, Identifiers & Profiles"
3. Select "Identifiers" → "App IDs"
4. Click "+" to create new App ID
5. Enter details:
   - **Description**: El Duro Vaper POS
   - **Bundle ID**: com.elduro.vaper.pos
   - **App Services**: Enable Camera, Push Notifications

#### 2. Create Distribution Certificate
1. In Developer Portal, go to "Certificates"
2. Click "+" to add certificate
3. Select "App Store and Ad Hoc" under Production
4. Follow instructions to create Certificate Signing Request (CSR)
5. Upload CSR and download certificate
6. Install certificate in Keychain Access

#### 3. Create Provisioning Profile
1. Go to "Profiles" in Developer Portal
2. Click "+" to create new profile
3. Select "App Store" under Distribution
4. Choose your App ID (com.elduro.vaper.pos)
5. Select your Distribution Certificate
6. Download and install provisioning profile

#### 4. Configure in Xcode
1. Open project: `platforms/ios/El Duro Vaper POS.xcworkspace`
2. Select project in navigator
3. Go to "Signing & Capabilities"
4. Select your Team and Provisioning Profile
5. Ensure Bundle Identifier matches: com.elduro.vaper.pos

## 🤖 Android Certificates (Free)

### Step-by-Step Android Keystore Generation

#### 1. Generate Keystore File
```bash
keytool -genkey -v -keystore elduro-vaper-pos.keystore -alias elduro-release -keyalg RSA -keysize 2048 -validity 10000
```

**Important Information to Enter:**
- **First and last name**: El Duro Vaper POS
- **Organizational unit**: Mobile Development
- **Organization**: El Duro Vaper
- **City/Locality**: [Your City]
- **State/Province**: [Your State]
- **Country code**: [Your Country Code]
- **Keystore password**: [Create strong password - SAVE THIS!]
- **Key password**: [Create strong password - SAVE THIS!]

#### 2. Store Keystore Information Securely
Create a secure file with:
```
Keystore file: elduro-vaper-pos.keystore
Keystore password: [YOUR_KEYSTORE_PASSWORD]
Key alias: elduro-release
Key password: [YOUR_KEY_PASSWORD]
```

#### 3. Sign APK for Release
```bash
# Build unsigned APK
cordova build android --release

# Sign the APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore elduro-vaper-pos.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk elduro-release

# Align the APK
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk elduro-vaper-pos-signed.apk
```

## 🛡️ Security Best Practices

### Certificate Storage
- ✅ Store certificates in secure, backed-up location
- ✅ Use strong passwords (minimum 12 characters)
- ✅ Document all certificate information
- ✅ Set calendar reminders for certificate renewal
- ❌ Never share certificates or passwords
- ❌ Don't store credentials in code repositories

### iOS Certificate Management
- Distribution certificates expire after 1 year
- Provisioning profiles expire after 1 year
- Set reminders 30 days before expiration
- Always create backup certificates

### Android Keystore Management
- Keystore files never expire (if validity period is long enough)
- **CRITICAL**: Never lose keystore file - you cannot update your app without it
- Create multiple backup copies stored securely
- Document all passwords in secure password manager

## 📋 Certificate Checklist

### iOS Deployment Checklist
- [ ] Apple Developer Account active
- [ ] App Identifier created (com.elduro.vaper.pos)
- [ ] Distribution Certificate generated and installed
- [ ] App Store Provisioning Profile created
- [ ] Xcode project configured with correct signing
- [ ] Test build created successfully
- [ ] App archived in Xcode
- [ ] Ready for App Store Connect upload

### Android Deployment Checklist
- [ ] Keystore file generated
- [ ] Keystore passwords documented securely
- [ ] Release APK built and signed
- [ ] APK aligned and optimized
- [ ] APK tested on device
- [ ] Google Play Developer account ready
- [ ] Ready for Play Console upload

## 🚨 Important Notes

### iOS Specific
- Requires macOS and Xcode for final build and submission
- Apple Developer membership must be active during submission
- App review process typically takes 24-48 hours
- Age verification features must comply with Apple guidelines

### Android Specific
- Can be built on Windows, macOS, or Linux
- Google Play Developer account fee is one-time $25
- App review process typically takes 1-3 days
- Ensure app complies with Google Play tobacco policies

### Legal Compliance
- Both platforms have strict tobacco/vaping app policies
- Age verification must be prominently displayed
- App description must clearly indicate 21+ age requirement
- Consider geographic restrictions for certain regions

## 🎯 Next Steps After Certificate Generation

1. **Build signed apps** using certificates
2. **Test thoroughly** on physical devices
3. **Create app store listings** with screenshots and descriptions
4. **Submit for review** following platform guidelines
5. **Monitor review status** and respond to feedback

## 📞 Support Resources

### iOS Support
- Apple Developer Documentation: https://developer.apple.com/documentation/
- iOS App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple Developer Forums: https://developer.apple.com/forums/

### Android Support
- Android Developer Documentation: https://developer.android.com/docs
- Google Play Policy Center: https://play.google.com/about/developer-content-policy/
- Android Developer Console Help: https://support.google.com/googleplay/android-developer/

---

**⚠️ CRITICAL REMINDER**: 
- **iOS**: Never lose your Distribution Certificate and Provisioning Profile
- **Android**: Never lose your Keystore file - you cannot update your app without it
- Always create secure backups of all certificates and credentials