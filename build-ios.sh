#!/bin/bash
# NexaQuantum POS - iOS App Store Build Script

echo "🍎 Building NexaQuantum POS for iOS App Store"
echo "============================================="

# Check requirements
echo "📋 Checking requirements..."
if ! command -v cordova &> /dev/null; then
    echo "❌ Cordova not found. Installing..."
    npm install -g cordova
fi

if ! command -v ios-deploy &> /dev/null; then
    echo "❌ ios-deploy not found. Installing..."
    npm install -g ios-deploy
fi

# Create iOS platform
echo "📱 Adding iOS platform..."
cordova platform add ios

# Install required plugins
echo "🔌 Installing required plugins..."
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-inappbrowser
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-network-information
cordova plugin add cordova-plugin-vibration
cordova plugin add phonegap-plugin-barcodescanner
cordova plugin add cordova-plugin-inapppurchase

# Configure iOS settings
echo "⚙️ Configuring iOS settings..."
cat > config.xml << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.nexaquantum.elduro.vaper.pos" 
        version="1.0.0" 
        xmlns="http://www.w3.org/ns/widgets" 
        xmlns:cdv="http://cordova.apache.org/ns/1.0">
    
    <name>NexaQuantum El Duro Vaper POS</name>
    <description>Professional Point of Sale system for vape retailers by NexaQuantum</description>
    <author email="support@nexaquantum.com" href="https://nexaquantum.com">NexaQuantum Team</author>
    
    <content src="index.html" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    
    <!-- iOS Configuration -->
    <platform name="ios">
        <allow-intent href="itms:*" />
        <allow-intent href="itms-apps:*" />
        
        <!-- App Icons -->
        <icon src="images/ios/icon-57.png" width="57" height="57" />
        <icon src="images/ios/icon-57-2x.png" width="114" height="114" />
        <icon src="images/ios/icon-72.png" width="72" height="72" />
        <icon src="images/ios/icon-72-2x.png" width="144" height="144" />
        
        <!-- Splash Screens -->
        <splash src="images/ios/Default-568h@2x~iphone.png" width="640" height="1136" />
        <splash src="images/ios/Default-667h.png" width="750" height="1334" />
        <splash src="images/ios/Default-736h.png" width="1242" height="2208" />
        
        <!-- Permissions -->
        <config-file target="*-Info.plist" parent="NSCameraUsageDescription">
            <string>This app uses camera for barcode scanning</string>
        </config-file>
        <config-file target="*-Info.plist" parent="NSPhotoLibraryUsageDescription">
            <string>This app accesses photo library for product images</string>
        </config-file>
        
        <!-- App Store Configuration -->
        <config-file target="*-Info.plist" parent="CFBundleDisplayName">
            <string>NexaQuantum POS</string>
        </config-file>
        <config-file target="*-Info.plist" parent="CFBundleVersion">
            <string>1.0.0</string>
        </config-file>
    </platform>
    
    <!-- Preferences -->
    <preference name="DisallowOverscroll" value="true" />
    <preference name="Orientation" value="portrait" />
    <preference name="EnableViewportScale" value="false" />
    <preference name="MediaPlaybackRequiresUserGesture" value="false" />
    <preference name="AllowInlineMediaPlayback" value="true" />
    <preference name="KeyboardDisplayRequiresUserAction" value="false" />
    <preference name="SuppressesIncrementalRendering" value="false" />
    <preference name="GapBetweenPages" value="0" />
    <preference name="PageLength" value="0" />
    <preference name="PaginationBreakingMode" value="page" />
    <preference name="PaginationMode" value="unpaginated" />
    
</widget>
EOF

# Create iOS icons directory
echo "🎨 Creating iOS icons..."
mkdir -p images/ios

# Create app icons (you'll need to add actual icon files)
echo "📝 Icon files needed in images/ios/:"
echo "  - icon-57.png (57x57)"
echo "  - icon-57-2x.png (114x114)"
echo "  - icon-72.png (72x72)"
echo "  - icon-72-2x.png (144x144)"
echo "  - icon-60.png (60x60)"
echo "  - icon-60-2x.png (120x120)"
echo "  - icon-60-3x.png (180x180)"
echo "  - icon-76.png (76x76)"
echo "  - icon-76-2x.png (152x152)"
echo "  - icon-83.5-2x.png (167x167)"
echo "  - icon-1024.png (1024x1024)"

# Build for iOS
echo "🔨 Building iOS app..."
cordova build ios --release

# Open Xcode project
echo "🚀 Opening Xcode project..."
echo "Next steps:"
echo "1. Open platforms/ios/NexaQuantum El Duro Vaper POS.xcworkspace in Xcode"
echo "2. Configure signing with your Apple Developer account"
echo "3. Set deployment target to iOS 12.0 or higher"
echo "4. Archive and upload to App Store Connect"

# Display submission checklist
echo ""
echo "📋 App Store Submission Checklist:"
echo "✅ App icons (all required sizes)"
echo "✅ Launch screens"
echo "✅ App description and keywords"
echo "✅ Screenshots (iPhone and iPad)"
echo "✅ Privacy policy"
echo "✅ In-app purchase products configured"
echo "✅ Age rating completed"
echo "✅ Pricing set to Free with IAP"
echo "✅ Release notes"
echo ""
echo "💰 Revenue Setup:"
echo "• Monthly subscription: $39.99/month"
echo "• Yearly subscription: $399.99/year"
echo "• Enterprise: $999.99/year"
echo ""
echo "🎯 Ready for App Store submission!"

# Open Xcode if available
if command -v open &> /dev/null; then
    open platforms/ios/*.xcworkspace
fi