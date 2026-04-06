# Pet Feeding Tracker — Product Requirements Document

## Problem Statement

Multiple cousins share the same household with different work schedules. They don't meet or communicate often throughout the day. When arriving home, there's no way to know if someone already fed the cats and dogs. This leads to pets being double-fed or not fed at all.

## Solution

A mobile app that tracks pet feeding schedules and notifies household members when a pet has been fed or when a meal is overdue.

---

## Core Concepts

### Household

- Users belong to a household via an **invite code** system.
- One user creates a household and receives a 6-character invite code.
- Other users join by entering the code.
- Each household has its own pet list, schedules, and feeding log.

### Pets

- Each pet has: **id, householdId, name, type** (freeform — cat, dog, rabbit, etc.).
- No photo upload — instead, a **generated cute avatar/artwork** based on the pet type.

### Meal Schedules

- Each pet has **per-pet meal schedules** (e.g., Breakfast at 7AM, Dinner at 6PM).
- Each meal schedule has: **id, petId, mealName, scheduledTime, graceMinutes**.
- Managing schedules (add/edit/delete) **requires internet connectivity**.

### Feeding Events

- A feeding event records: **id, petId, mealScheduleId, userId, fedAt, remarks (optional), isSynced**.
- **Remarks** capture observations (e.g., "pet didn't eat", "only ate half", "seemed lethargic"). Visible in feeding history only — no dashboard surfacing for now.
- Feeding events can be **undone/deleted**.

### Meal Status Logic

Each meal for each pet has one of three statuses:

| Status      | Condition                                         | Visual    |
| ----------- | ------------------------------------------------- | --------- |
| **Fed**     | A feeding event exists for this meal today         | Green     |
| **Due**     | Current time >= scheduled time, no feeding logged  | Warning   |
| **Overdue** | Current time >= scheduled time + grace minutes     | Red       |

---

## Features

### Authentication

- Login with username/password (existing).
- JWT-based with access + refresh tokens (existing).

### Onboarding

- After login, if user has no household:
  - **Create Household** — enter name, receive invite code.
  - **Join Household** — enter invite code.

### Dashboard

- List of pet cards showing:
  - Generated pet avatar (based on type)
  - Pet name and type
  - Per-meal status (fed / due / overdue)
  - "Feed" button per meal
- Pull to refresh.
- Real-time updates via WebSocket (polling as fallback).

### Feed Action Flow

1. Tap "Feed" button on a meal.
2. Confirmation dialog appears with an **optional remarks text field**.
3. Confirm → feeding event is created.
4. Snackbar with **undo** option appears briefly.

### Pet Detail Screen

- Pet info (name, type, avatar).
- Full meal schedule.
- Feeding history with remarks.

### Add/Edit Pet Screen

- Name, type (freeform).
- Meal schedules: add multiple meals with name, time, and grace period.
- **Requires internet connectivity.**

### Household Settings

- View household members.
- View/share invite code.
- Leave household.

---

## Notifications (Push)

Requires **Firebase Cloud Messaging** (to be set up).

Two notification types:

1. **Pet was fed** — When someone marks a meal as fed, all other household members receive a push notification (e.g., "Jay fed Mingming — Dinner").
2. **Meal overdue** — When a meal passes its grace period and no one has logged a feeding event (e.g., "Bantay's dinner is overdue — no one has fed him").

---

## Offline-First Strategy

### Scope

- **Offline-capable:** Recording feeding events only.
- **Online-required:** Pet CRUD, schedule management, household management, authentication.

### Local Storage

- **SQLite via Drift** for local database.
- Cache the full dashboard state locally:
  - Pet list and schedules
  - Recent feeding events
  - User session/token (via Flutter Secure Storage — existing)
- Dashboard renders from local cache when offline, showing last-known state plus any offline-logged feeds.

### Sync Mechanism

- **Automatic on connectivity restore** — App detects network availability and immediately pushes queued feeding events.
- **Periodic background sync** — Background task runs every N minutes as a safety net (handles app-killed scenarios).
- Offline feeding events are stored with `isSynced: false` and updated on successful sync.

### Conflict Resolution

- **Keep both events.** If two users independently log the same meal while offline, both feeding events are stored.
- Dashboard shows the earliest feeding event as the one that counts for status.
- Feeding history shows all events (reflects reality).

---

## Real-Time Updates

- **WebSocket** for live dashboard updates when connected.
- **Polling** as fallback when WebSocket disconnects.
- Push notifications provide awareness even when app is closed.

---

## Tech Stack

### Flutter (Frontend)

- **Architecture:** Clean Architecture (existing)
- **State Management:** BLoC/Cubit (existing)
- **Navigation:** GoRouter (existing)
- **DI:** GetIt (existing)
- **Local DB:** Drift (SQLite) — new
- **HTTP:** Dio (existing)
- **Push Notifications:** Firebase Cloud Messaging — new
- **WebSocket:** TBD

### Backend (Separate Project)

- **Runtime:** Node.js
- **Framework:** Fastify
- **To be built** using the API contract derived from this PRD.

---

## Data Model

```
Household
  - id: String
  - name: String
  - inviteCode: String (6 characters)
  - createdAt: DateTime

User
  - id: String
  - name: String
  - image: String?
  - householdId: String

Pet
  - id: String
  - householdId: String
  - name: String
  - type: String (freeform: cat, dog, rabbit, etc.)

MealSchedule
  - id: String
  - petId: String
  - mealName: String (e.g., "Breakfast", "Dinner")
  - scheduledTime: TimeOfDay
  - graceMinutes: int

FeedingEvent
  - id: String
  - petId: String
  - mealScheduleId: String
  - userId: String
  - fedAt: DateTime
  - remarks: String? (optional)
  - isSynced: bool
  - createdAt: DateTime

Device (for push notifications)
  - id: String
  - userId: String
  - fcmToken: String
  - platform: String (ios/android)
```

---

## Screens Summary

| Screen               | Connectivity | Description                                      |
| -------------------- | ------------ | ------------------------------------------------ |
| Login                | Required     | Username/password auth                           |
| Create Household     | Required     | Name → generates invite code                     |
| Join Household       | Required     | Enter invite code                                |
| Dashboard            | Offline OK   | Pet cards with meal status, feed buttons         |
| Pet Detail           | Offline OK   | Pet info, schedule, feeding history              |
| Add/Edit Pet         | Required     | Pet name, type, meal schedules                   |
| Household Settings   | Required     | Members, invite code, leave                      |

---

## Removed Features

- **Notes/Todos module** — Removed. Unrelated to pet care.
- **Payroll module** — Removed. Was already being deleted.

---

## Future Considerations (Out of Scope)

- Pet photo upload
- Health tracking / alerting based on remarks patterns
- Dashboard surfacing of remarks/health observations
- Multi-household support per user
- Pet sharing across households
