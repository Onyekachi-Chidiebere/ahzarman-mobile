# Google Play CI/CD — setup from scratch

You already created the app (`com.ahzarman`) and finished the store listing.  
This guide explains **where every GitHub secret and variable comes from**.

---

## Overview — what you need

| Name | Type | Where it comes from |
|------|------|---------------------|
| `ANDROID_KEYSTORE_BASE64` | Secret | You **create** a keystore file on your Mac |
| `ANDROID_KEYSTORE_PASSWORD` | Secret | Password you chose when creating the keystore |
| `ANDROID_KEY_ALIAS` | Secret | Alias you chose (e.g. `ahzarman`) |
| `ANDROID_KEY_PASSWORD` | Secret | Key password you chose (often same as keystore password) |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` | Secret | Google Cloud Console → download JSON key |
| `APP_VERSION_NAME` | Variable (optional) | You choose (e.g. `1.0.0`) |
| `PLAY_STORE_TRACK` | Variable (optional) | You choose: `internal`, `alpha`, `beta`, or `production` |

**Play Console does not give you the keystore or service account** — you create both yourself.

---

## Part 1 — Upload keystore (4 secrets)

Google Play uses **two keys**:

1. **App signing key** — Google holds this (Play App Signing).
2. **Upload key** — **you** create this; CI signs the AAB with it before upload.

### Step 1: Generate the keystore (on your Mac)

Open Terminal and run (replace passwords with your own — **save them somewhere safe**):

```bash
cd ~/Desktop
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore ahzarman-upload.keystore \
  -alias ahzarman \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be asked:

- **Keystore password** → becomes `ANDROID_KEYSTORE_PASSWORD`
- **Key password** → becomes `ANDROID_KEY_PASSWORD` (press Enter to use same as keystore)
- Name, org, etc. → fill in reasonably; they are embedded in the cert only

You now have a file: `~/Desktop/ahzarman-upload.keystore`

> **Back this file up** (1Password, encrypted drive). If you lose it, updating the app on Play becomes very difficult.

### Step 2: Register upload key in Play Console (one-time)

Google moved this page. It is **not** under Setup → App signing anymore.

**How to find it (2024+ Play Console):**

1. Open [Play Console](https://play.google.com/console) → select **Ahzarman**
2. In the **left sidebar**, look for **Protected with Play**
3. Open **Play Store protection** (expand if collapsed)
4. Click **Manage Play App Signing**

**Can’t find “Protected with Play”?**

- Use the **search box at the top** of Play Console and type: `Play App Signing`
- Or try: **Test and release** → look for **App integrity** / **App signing** (some accounts still show this)

**If you have never uploaded an AAB/APK yet:**

You may only see “Opt in to Play App Signing” or no upload key section until your **first release upload**. That is normal. You can still:

1. Create the keystore on your Mac now (Step 1)
2. Upload your first build via CI (or manually) — Google will prompt you to enroll in Play App Signing
3. Then return to **Manage Play App Signing** to confirm your upload key certificate

**If you already have an upload key registered**, export and compare (optional):

```bash
keytool -export -rfc \
  -keystore ~/Desktop/ahzarman-upload.keystore \
  -alias ahzarman \
  -file upload_certificate.pem
```

On **Manage Play App Signing**, check the **Upload key certificate** section — SHA-1 should match your keystore if already registered.

To register a **new** upload key certificate, use the options on that same page (or it may register automatically when you upload an AAB signed with that key for the first time).

### Step 3: Base64-encode the keystore for GitHub

```bash
base64 -i ~/Desktop/ahzarman-upload.keystore | pbcopy
```

This copies the encoded string to your clipboard → paste into GitHub secret `ANDROID_KEYSTORE_BASE64`.

### Step 4: Add the 4 keystore secrets in GitHub

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** for each:

| Secret name | Value |
|-------------|--------|
| `ANDROID_KEYSTORE_BASE64` | Output of `base64 -i ...` (entire string) |
| `ANDROID_KEYSTORE_PASSWORD` | Password from Step 1 |
| `ANDROID_KEY_ALIAS` | `ahzarman` (or whatever alias you used) |
| `ANDROID_KEY_PASSWORD` | Key password from Step 1 |

---

## Part 2 — Google Play service account (1 secret)

This lets GitHub **upload** builds without you logging into Play Console.

### Step 1: Enable the API

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Use the same Google account as Play Console (or one that has Play access)
3. Create a project (e.g. `ahzarman-ci`) or pick an existing one
4. **APIs & Services** → **Library** → search **Google Play Android Developer API** → **Enable**

### Step 2: Create service account + JSON key

1. **IAM & Admin** → **Service Accounts** → **Create service account**
   - Name: `github-play-deploy`
2. Skip granting GCP roles (not needed) → **Done**
3. Click the new service account → **Keys** tab → **Add key** → **Create new key** → **JSON** → **Create**
4. A `.json` file downloads — this is your `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

Copy the **entire file contents** (open in TextEdit/VS Code, select all) into GitHub secret:

`GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### Step 3: Link service account in Play Console

1. Play Console → use the **top search bar** and type **API access**, or go to **Setup** → **API access** (location varies by account)
2. If asked, **Link** your Google Cloud project
3. Under **Service accounts**, find `github-play-deploy@....iam.gserviceaccount.com`
4. **Grant access** (or **Invite user**)
5. Permissions — for automated uploads, enable at least:
   - **Release apps to testing tracks** (internal/alpha/beta)
   - When ready for production: **Release to production, exclude devices, and use Play App Signing**

Save. It can take a few minutes for permissions to apply.

---

## Part 3 — GitHub variables (optional)

**Settings** → **Secrets and variables** → **Actions** → **Variables** tab

| Variable | Suggested first value | Meaning |
|----------|----------------------|---------|
| `APP_VERSION_NAME` | `1.0.0` | Shown to users as version name |
| `PLAY_STORE_TRACK` | `internal` | Where pushes to `main` deploy |

**Tracks explained:**

- `internal` — testers only, fastest to validate CI (start here)
- `alpha` / `beta` — wider test groups
- `production` — public Play Store release

---

## Part 4 — Push and run

1. Commit `.github/workflows/android-playstore.yml` to your repo
2. Push to branch `main`
3. GitHub → **Actions** → watch **Deploy Android to Google Play**

Or run manually: **Actions** → workflow → **Run workflow** → pick track.

---

## versionCode note

CI sets `versionCode` = GitHub **run number** (1, 2, 3…). Play requires each upload to have a **higher** versionCode than the last.

If you already published `versionCode 1` manually, either:

- Let CI run until `run_number` > 1, or
- In the workflow, temporarily use `VERSION_CODE: ${{ github.run_number + 10 }}`

---

## Quick checklist

- [ ] Keystore created and backed up
- [ ] Upload certificate registered in Play Console → App signing
- [ ] 4 keystore secrets in GitHub
- [ ] Play Android Developer API enabled in Cloud Console
- [ ] Service account JSON downloaded
- [ ] Service account granted access in Play Console → API access
- [ ] `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` secret in GitHub
- [ ] `PLAY_STORE_TRACK` = `internal` for first test
- [ ] Workflow pushed to `main`

---

## Common errors

| Error | Fix |
|-------|-----|
| `Missing secret: ANDROID_KEYSTORE_BASE64` | Add all 4 keystore secrets |
| `403` / permission denied on upload | Service account not granted in Play Console API access |
| `Version code X has already been used` | Bump versionCode in workflow |
| Signing failed | Wrong keystore password or alias |
| App not found | Package must be exactly `com.ahzarman` |
