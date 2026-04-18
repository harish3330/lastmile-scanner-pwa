# Git Branching Strategy — Smart Parcel Tracking & Delivery System

## Branch Overview

```
main
 └── develop
      ├── feature/member-1-pwa-service-worker
      ├── feature/member-2-ui-admin-dashboard   ← THIS BRANCH
      ├── feature/member-3-indexeddb-sync
      ├── feature/member-4-qr-scanner
      ├── feature/member-5-camera-delivery-proof
      ├── feature/member-6-gps-tracking
      ├── feature/member-7-geofencing
      ├── feature/member-8-backend-apis
      ├── feature/member-9-ml-detection
      └── feature/member-10-integrations
```

## Branch Descriptions

| Branch | Purpose | Who |
|--------|---------|-----|
| `main` | Stable production-ready code. Never commit directly. | All |
| `develop` | Integration branch. All features merge here first. | All |
| `feature/*` | One branch per member/feature. | Each member |
| `hotfix/*` | Urgent fixes to `main`. Merged to both `main` and `develop`. | Lead |
| `release/*` | Release preparation (v1, v2). Branched from `develop`. | Lead |

## Workflow

### Starting a Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/member-2-ui-admin-dashboard
```

### Daily Work
```bash
git add .
git commit -m "feat(ui): add delivery page with filter bar"
git push origin feature/member-2-ui-admin-dashboard
```

### Merging to Develop (via Pull Request)
1. Push your feature branch
2. Open a **Pull Request** from `feature/*` → `develop`
3. Get at least 1 reviewer approval
4. Merge using **Squash and Merge**

### Release Process
```bash
git checkout develop
git checkout -b release/v1
# Final testing and bug fixes
git merge release/v1  # into main
git tag v1.0.0
```

## Commit Message Convention

```
<type>(<scope>): <short description>

Types: feat | fix | docs | style | refactor | test | chore
```

### Examples
```
feat(scan): implement QR scanner with animated overlay
fix(payment): correct mismatch calculation for COD orders
docs(readme): add setup instructions
refactor(sidebar): extract NavLink to reusable component
```

## Versioning

| Tag | Description |
|-----|-------------|
| `v1` | Initial functional release — all core features |
| `v2` | Optimized release — ML integrated, full offline sync |

## Protection Rules (GitHub Settings)

- `main` → Require PR + 2 approvals + passing CI
- `develop` → Require PR + 1 approval
- Direct pushes to `main` and `develop` are **blocked**
