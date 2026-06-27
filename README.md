# NeighborHub — NextDoor Clone

A full-stack neighborhood social network app targeting **Google Play Store** (APK/AAB) and **Apple App Store** (IPA), with separate **Customer** and **Admin** apps built on React Native + Expo.

---

## Project Structure

```
NeighborHub/
├── apps/
│   ├── customer/          # Customer-facing React Native app
│   └── admin/             # Admin management React Native app
├── backend/               # Node.js + Express + Prisma REST API
├── packages/
│   └── shared/            # Shared types, utils, constants
├── scripts/
│   └── version-bump.js    # Automated version bumping
└── .github/workflows/     # CI/CD — APK builds + store submissions
```

---

## Apps

### Customer App (`apps/customer`)
- Register / Login with JWT auth
- Address verification via GPS + OTP email → neighborhood assignment
- Neighborhood Feed with category filters (Safety, Events, Lost & Found, etc.)
- Events: browse, RSVP, create
- Marketplace: buy/sell listings with images
- Direct Messaging
- Safety Alerts with severity detection
- Neighbors Map (react-native-maps)
- Push Notifications + deep linking (`neighborhub://`)

### Admin App (`apps/admin`)
- Role-gated login (admin / moderator only)
- Dashboard with live stats and alert banners
- User Management: suspend / ban / reactivate
- Content Moderation: approve / remove / pin
- Reports Queue with status filters
- Analytics: 14-day charts, category distribution
- Push Notification broadcaster
- App Version Management with force-update control

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native, Expo SDK 51 |
| State | Redux Toolkit |
| Navigation | React Navigation v6 |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (access 15m + refresh 30d) |
| Email | Nodemailer / SendGrid |
| Push | Expo Notifications + expo-server-sdk |
| Build | EAS Build (Expo Application Services) |
| CI/CD | GitHub Actions |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL
- Expo account (free) at [expo.dev](https://expo.dev)

### 1. Clone the repository

```bash
git clone https://github.com/anilkumarkmys/NeighborHub.git
cd NeighborHub
npm install
```

### 2. Configure the backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database URL, JWT secrets, and SMTP credentials
cd backend
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. Start the customer app

```bash
cd apps/customer
npx expo start
```

### 4. Start the admin app

```bash
cd apps/admin
npx expo start
```

---

## Building APKs

### Cloud Build (EAS — recommended)

```bash
# Login to Expo
npx eas-cli login

# Initialize projects (first time only)
cd apps/customer && npx eas-cli init
cd ../admin   && npx eas-cli init

# Build customer APK
cd apps/customer
npx eas build --platform android --profile production-apk

# Build admin APK
cd apps/admin
npx eas build --platform android --profile production-apk
```

### Automated builds on release

Every version tag (`v1.0.1`, etc.) triggers GitHub Actions to build both APKs automatically.

```bash
npm run version:patch    # 1.0.0 → 1.0.1 + git tag
git push origin main --tags
```

Add `EXPO_TOKEN` (from expo.dev → Access Tokens) as a GitHub Actions secret.

---

## Build Profiles

| Profile | Output | Use case |
|---|---|---|
| `development` | APK | Local dev / testing |
| `preview` | APK | Internal distribution |
| `production` | AAB | Google Play Store |
| `production-apk` | APK | Direct APK distribution |

---

## Version Management

```bash
npm run version:patch    # 1.0.0 → 1.0.1
npm run version:minor    # 1.0.0 → 1.1.0
npm run version:major    # 1.0.0 → 2.0.0
```

Updates `VERSION`, both `app.json` files (version + buildNumber/versionCode), writes `CHANGELOG.md`, and creates a git tag.

---

## Environment Variables

See `backend/.env.example` for the full list. Key variables:

```
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
SMTP_HOST=smtp.sendgrid.net
SMTP_PASS=your-sendgrid-api-key
```

---

## License

MIT
