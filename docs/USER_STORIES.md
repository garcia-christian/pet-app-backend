# Pet Feeding Tracker (Backend) — User Stories

> Reference: [PRD](./PRD.md)
> Status legend: `[x]` Done | `[ ]` To Do

---

## Epic 1: Authentication

### 1.1 Core Auth
- [x] **US-1.1.1** — As a user, I want to register with email and password so I can create an account.
- [x] **US-1.1.2** — As a user, I want to log in with email and password so I can access the app securely.
- [x] **US-1.1.3** — As a developer, I want JWT-based access tokens (15m expiry) and refresh tokens (7d expiry) so sessions are secure and stateless.
- [x] **US-1.1.4** — As a user, I want to refresh my access token so I stay logged in without re-entering credentials.
- [x] **US-1.1.5** — As a user, I want to log out so my session is invalidated.
- [x] **US-1.1.6** — As a user, I want to retrieve my profile via `GET /auth/me` so I can see my account info.

### 1.2 Auth Guards
- [ ] **US-1.2.1** — As a developer, I want all household, pet, meal-schedule, and feeding-event endpoints to require JWT authentication so only authenticated users can access data.
- [ ] **US-1.2.2** — As a developer, I want unauthenticated requests to return `401 Unauthorized` with a consistent error body so the frontend can handle auth failures uniformly.

### 1.3 Profile Management
- [x] **US-1.3.1** — As a user, I want to update my name and image via `PUT /auth/me` so my profile stays current.

---

## Epic 2: Households

### 2.1 Household CRUD
- [x] **US-2.1.1** — As a user, I want to create a household with a name so I can set up my family group.
- [x] **US-2.1.2** — As a developer, I want household creation to auto-generate a 6-character invite code so other users can join.
- [x] **US-2.1.3** — As a user, I want to view household details (name, invite code, members) so I can manage my household.
- [x] **US-2.1.4** — As a user, I want to update the household name so I can correct it later.
- [x] **US-2.1.5** — As a user, I want to delete a household so I can remove it when no longer needed.

### 2.2 Join & Leave
- [x] **US-2.2.1** — As a user, I want to join a household by entering an invite code so I can collaborate with my family.
- [x] **US-2.2.2** — As a user, I want to leave a household so I can remove myself from a group.

### 2.3 Member Management
- [x] **US-2.3.1** — As a developer, I want a `HouseholdMember` model (id, userId, householdId, role) with roles OWNER and MEMBER so access control is possible.
- [x] **US-2.3.2** — As a user, I want to list members of my household so I can see who's in the group.
- [x] **US-2.3.3** — As a user, I want to view a specific member's details so I can see their role.
- [x] **US-2.3.4** — As a household owner, I want to update a member's role so I can promote or demote members.
- [x] **US-2.3.5** — As a household owner, I want to remove a member so I can manage who has access.

### 2.4 Household-Scoped Authorization
- [ ] **US-2.4.1** — As a developer, I want all resource queries (pets, meals, feeding events) to be scoped to the user's household so data is properly isolated.
- [ ] **US-2.4.2** — As a developer, I want requests to resources outside the user's household to return `403 Forbidden` so unauthorized access is blocked.
- [ ] **US-2.4.3** — As a developer, I want only OWNER role to be able to delete a household or change member roles so permissions are enforced.

---

## Epic 3: Pets

### 3.1 Pet CRUD
- [x] **US-3.1.1** — As a developer, I want a `Pet` model (id, householdId, name, type) where type is freeform (string) so any animal can be represented.
- [x] **US-3.1.2** — As a user, I want to add a pet to my household so I can start tracking its care.
- [x] **US-3.1.3** — As a user, I want to view a pet's details so I can see its profile.
- [x] **US-3.1.4** — As a user, I want to update a pet's name or type so I can correct mistakes.
- [x] **US-3.1.5** — As a user, I want to delete a pet so I can remove it from the household.
- [x] **US-3.1.6** — As a user, I want to list all pets in my household so I can see all tracked animals.

### 3.2 Pet Type Migration
- [ ] **US-3.2.1** — As a developer, I want to migrate the `Pet.type` field from enum (DOG, CAT, OTHER) to a freeform string so users can enter any animal type (cat, dog, rabbit, hamster, etc.) as specified in the PRD.

---

## Epic 4: Meal Schedules

### 4.1 Meal Schedule CRUD
- [x] **US-4.1.1** — As a developer, I want a `MealSchedule` model (id, petId, mealName, scheduledTime, graceMinutes) so feeding times can be defined per pet.
- [x] **US-4.1.2** — As a user, I want to create a meal schedule for a pet (e.g., "Breakfast" at 07:00, 15-minute grace) so feeding times are consistent.
- [x] **US-4.1.3** — As a user, I want to view a meal schedule's details so I can check the configured times.
- [x] **US-4.1.4** — As a user, I want to list all meal schedules for a pet so I can see the full feeding plan.
- [x] **US-4.1.5** — As a user, I want to update a meal schedule so I can adjust times or grace periods.
- [x] **US-4.1.6** — As a user, I want to delete a meal schedule so I can remove outdated feeding times.

---

## Epic 5: Feeding Events

### 5.1 Feeding Event CRUD
- [x] **US-5.1.1** — As a developer, I want a `FeedingEvent` model (id, petId, mealScheduleId, userId, fedAt, remarks, createdAt) so feeding actions are recorded.
- [x] **US-5.1.2** — As a user, I want to record a feeding event with optional remarks so others know a pet has been fed.
- [x] **US-5.1.3** — As a user, I want to list feeding events for a pet or meal schedule so I can see feeding history.
- [x] **US-5.1.4** — As a user, I want to delete a feeding event so I can undo an accidental entry.

### 5.2 Feeding Event Enhancements
- [ ] **US-5.2.1** — As a developer, I want to add a `GET /feeding-events/:id` endpoint so individual feeding events can be retrieved by ID.
- [ ] **US-5.2.2** — As a developer, I want to add an `isSynced` (boolean, default true) field to the `FeedingEvent` model so the frontend can track offline sync status.

---

## Epic 6: Meal Status & Dashboard

### 6.1 Meal Status Logic
- [ ] **US-6.1.1** — As a developer, I want a meal status computation endpoint that returns each meal's status (Fed, Due, Overdue) based on today's feeding events, scheduled time, and grace minutes so the dashboard can display real-time status.
- [ ] **US-6.1.2** — As a user, I want to call `GET /household/:householdId/dashboard` and receive a list of pets with per-meal statuses so I can see at a glance who needs to be fed.

### 6.2 Dashboard Data
- [ ] **US-6.2.1** — As a developer, I want the dashboard endpoint to return pet name, type, meal schedules, meal status, and latest feeding event per meal so the frontend has all data needed to render pet cards.

---

## Epic 7: Real-Time Updates

### 7.1 WebSocket Support
- [ ] **US-7.1.1** — As a developer, I want to integrate `@fastify/websocket` so the server can maintain persistent connections with clients.
- [ ] **US-7.1.2** — As a developer, I want WebSocket connections to be authenticated via JWT so only authorized users receive updates.
- [ ] **US-7.1.3** — As a developer, I want WebSocket connections to be scoped to a household so users only receive updates for their household.

### 7.2 Real-Time Events
- [ ] **US-7.2.1** — As a user, I want to receive a real-time update when someone logs a feeding event so the dashboard updates without manual refresh.
- [ ] **US-7.2.2** — As a user, I want to receive a real-time update when a meal becomes overdue so I'm alerted immediately.
- [ ] **US-7.2.3** — As a developer, I want a polling fallback endpoint (`GET /household/:householdId/dashboard`) so clients can poll when WebSocket is unavailable.

---

## Epic 8: Push Notifications

### 8.1 Device Registration
- [ ] **US-8.1.1** — As a developer, I want a `Device` model (id, userId, fcmToken, platform) so push notification tokens can be stored.
- [ ] **US-8.1.2** — As a user, I want to register my device token via `POST /devices` so I can receive push notifications.
- [ ] **US-8.1.3** — As a user, I want to remove my device token via `DELETE /devices/:id` so I can opt out of notifications.

### 8.2 Notification Triggers
- [ ] **US-8.2.1** — As a developer, I want to integrate Firebase Admin SDK so the server can send FCM push notifications.
- [ ] **US-8.2.2** — As a user, I want to receive a push notification when someone feeds a pet (e.g., "Jay fed Mingming — Dinner") so I know the pet has been fed even when the app is closed.
- [ ] **US-8.2.3** — As a user, I want to receive a push notification when a meal is overdue (e.g., "Bantay's dinner is overdue") so I'm reminded to feed the pet.
- [ ] **US-8.2.4** — As a developer, I want notifications to be sent to all household members except the actor so users don't get notified of their own actions.

---

## Epic 9: Quality & Developer Experience

### 9.1 API Consistency
- [ ] **US-9.1.1** — As a developer, I want consistent route naming conventions across all features so the API is predictable.
- [ ] **US-9.1.2** — As a developer, I want all use cases to have corresponding routes so no implemented logic is inaccessible.

### 9.2 Integration Tests
- [ ] **US-9.2.1** — As a developer, I want integration tests for the authentication flow (register, login, refresh, logout) so auth changes can be deployed with confidence.
- [ ] **US-9.2.2** — As a developer, I want integration tests for household CRUD and join/leave so household logic is verified end-to-end.
- [ ] **US-9.2.3** — As a developer, I want integration tests for pet CRUD so pet management is verified end-to-end.
- [ ] **US-9.2.4** — As a developer, I want integration tests for meal schedule CRUD and feeding event flow so the core feeding feature is verified end-to-end.
