# iOS TestFlight CI/CD — setup

Workflow: `.github/workflows/ios-testflight.yml`  
Runs on push to `main` or manual **workflow_dispatch**.

---

## Overview — what you need

| Name | Type | Where it comes from |
|------|------|---------------------|
| `IOS_TEAM_ID` | **Variable or secret** | [Apple Developer](https://developer.apple.com/account) → Membership → Team ID |
| `APP_VERSION_NAME` | Variable (optional) | e.g. `1.0.0` (matches Android `APP_VERSION_NAME`) |
| `IOS_CERTIFICATE_P12_BASE64` | Secret | Distribution certificate exported as `.p12` |
| `IOS_CERTIFICATE_P12_PASSWORD` | Secret | Password used when exporting `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | Secret | App Store distribution profile for **`com.ahzarman`** |
| `GOOGLE_SERVICE_INFO_PLIST` | Secret | Full contents of `GoogleService-Info.plist` (Firebase iOS) |
| `APPSTORE_ISSUER_ID` | Secret | App Store Connect → Users and Access → Integrations → API |
| `APPSTORE_API_KEY_ID` | Secret | Same API key page (10-character Key ID) |
| `APPSTORE_API_PRIVATE_KEY` or `APPSTORE_API_PRIVATE_KEY_BASE64` | Secret | Download `.p8` once when creating the API key |

---

## App identifiers (must match everywhere)

| Setting | Value |
|---------|--------|
| Bundle ID | `com.ahzarman` |
| Xcode scheme | `ahzarman` |
| Workspace | `ios/ahzarman.xcworkspace` |

These must match: Xcode project, App Store Connect app, provisioning profile, and Firebase iOS app.

---

## Part 1 — Apple Developer setup

### 1. Register App ID

Apple Developer → **Certificates, Identifiers & Profiles** → **Identifiers** → **+** → App IDs → **`com.ahzarman`**

Enable capabilities you need (Push Notifications if used later).

### 2. Create App Store Connect app

[App Store Connect](https://appstoreconnect.apple.com) → **Apps** → **+** → iOS app with bundle ID **`com.ahzarman`**.

### 3. Distribution certificate (.p12)

1. Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority
2. Apple Developer → **Certificates** → **+** → **Apple Distribution**
3. Download and install in Keychain
4. Export as `.p12` with a password

Base64 for GitHub:

```bash
base64 -i YourDistribution.p12 | pbcopy
```

→ paste into secret `IOS_CERTIFICATE_P12_BASE64`  
→ password → `IOS_CERTIFICATE_P12_PASSWORD`

### 4. App Store provisioning profile

Apple Developer → **Profiles** → **+** → **App Store Connect** → App ID **`com.ahzarman`** → select your **Apple Distribution** cert → download.

Base64:

```bash
base64 -i Ahzarman_AppStore.mobileprovision | pbcopy
```

→ `IOS_PROVISIONING_PROFILE_BASE64`

Profile bundle ID must be exactly **`com.ahzarman`**.

---

## Part 2 — App Store Connect API (TestFlight upload)

1. App Store Connect → **Users and Access** → **Integrations** → **App Store Connect API**
2. **Generate API Key** — role **Admin** or **App Manager**
3. Download `.p8` (only once)
4. Add secrets:
   - `APPSTORE_ISSUER_ID` — Issuer ID on that page
   - `APPSTORE_API_KEY_ID` — Key ID (e.g. `AB12CD34EF`)
   - `APPSTORE_API_PRIVATE_KEY` — full `.p8` file text, **or**
   - `APPSTORE_API_PRIVATE_KEY_BASE64` — `base64 -i AuthKey_XXXX.p8 | pbcopy`

---

## Part 3 — Firebase iOS config

Download `GoogleService-Info.plist` from Firebase Console (iOS app with bundle ID **`com.ahzarman`**).

Add secret **`GOOGLE_SERVICE_INFO_PLIST`** = entire file contents (plain text).

---

## Part 4 — GitHub repository settings

**Settings → Secrets and variables → Actions**

### Variables (or secrets for `IOS_TEAM_ID`)

| Name | Example | Where |
|------|---------|--------|
| `IOS_TEAM_ID` | `ABCDE12345` | **Variables** tab *or* **Secrets** tab |
| `APP_VERSION_NAME` | `1.0.0` | **Variables** tab |

### Secrets
All items from the table at the top.

---

## Quick checklist

- [ ] App ID `com.ahzarman` registered in Apple Developer
- [ ] App created in App Store Connect with same bundle ID
- [ ] Distribution certificate + App Store profile created
- [ ] `IOS_TEAM_ID` set in GitHub (variable or secret)
- [ ] 3 signing secrets in GitHub (p12, p12 password, profile)
- [ ] 3 App Store Connect API secrets
- [ ] `GOOGLE_SERVICE_INFO_PLIST` secret (Firebase)
- [ ] Workflow pushed to `main`

---

## Common errors

| Error | Fix |
|-------|-----|
| Profile team does not match `IOS_TEAM_ID` | Set `IOS_TEAM_ID` to the **Team ID on your provisioning profile** (Apple Developer → Membership). Remove duplicate/wrong value from **Variables** if you also use **Secrets**. |
| Profile bundle does not match `IOS_BUNDLE_ID` | Profile must be for **`com.ahzarman`**; re-download after fixing Xcode bundle ID |
| Missing `IOS_TEAM_ID` | Add Team ID under **Variables** or **Secrets** (both work) |
| Missing `GOOGLE_SERVICE_INFO_PLIST` | Add Firebase plist contents as secret |
| API authentication failed (401) | Issuer ID, Key ID, and `.p8` must be from the **same** API key |
| Code Sign error / No profile | Distribution cert expired, wrong profile type, or profile not for `com.ahzarman` |
| Missing iPad icon `152x152` / `167x167` (90023) | Add iPad entries to `AppIcon.appiconset` (included in repo), or set `TARGETED_DEVICE_FAMILY = 1` for iPhone-only |
| `conflicting provisioning settings` / `automatically signed, but provisioning profile` | Release uses **Manual** signing in `project.pbxproj`; only pass simple `CODE_SIGN_*` flags in the workflow (no `[sdk=iphoneos*]` overrides) |
| `RCTSwiftUIWrapper does not support provisioning profiles` | Fixed in `Podfile` — pod targets disable code signing; only the `ahzarman` app target uses manual signing in CI |

---

## Version numbers

- **Build number** (`CURRENT_PROJECT_VERSION`): `github.run_number` (auto-increments each CI run)
- **Marketing version** (`MARKETING_VERSION`): GitHub variable `APP_VERSION_NAME` (default `1.0.0`)

Bump `APP_VERSION_NAME` when releasing a new user-visible version.
