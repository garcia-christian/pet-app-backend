# API Contract — Pet Feeding Tracker

> **Purpose:** Single source of truth for frontend ↔ backend API alignment.
> Copy this file into the backend repo and reference it when implementing endpoints.

## Base URL

```
http://localhost:3000/api/v1
```

---

## Response Envelope

**All responses MUST be wrapped in this envelope.** The frontend parses every response through `APIResponse<T>` / `APIListResponse<T>`.

### Success (single object)
```json
{
  "success": true,
  "message": "descriptive message",
  "statusCode": 200,
  "data": { ... },
  "traceId": "optional-trace-id"
}
```

### Success (list)
```json
{
  "success": true,
  "message": "descriptive message",
  "statusCode": 200,
  "data": [ ... ],
  "traceId": "optional-trace-id"
}
```

### Error
```json
{
  "meta": {
    "message": "error description",
    "statusCode": 400,
    "traceId": "optional-trace-id"
  }
}
```

> **✅ RESOLVED:** Response wrapper middleware added. All responses are now wrapped in `{ success, message, statusCode, data }` envelope for success or `{ meta: { message, statusCode } }` for errors.

---

## Data Models

### Token
```json
{
  "token": "jwt-access-token",
  "refreshToken": "refresh-token-string"
}
```

### User
```json
{
  "id": "uuid",
  "name": "string",
  "image": "url-string",
  "householdId": "uuid | null"
}
```
> **✅ ALIGNED:** Backend uses `image` field and includes `householdId` (derived from `HouseholdMember` join table) in User responses.

### Household
```json
{
  "id": "uuid",
  "name": "string",
  "inviteCode": "string",
  "createdAt": "ISO-8601"
}
```
> **✅ ALIGNED:** Backend `Household` includes `inviteCode` field with auto-generation logic.

### Pet
```json
{
  "id": "uuid",
  "householdId": "uuid",
  "name": "string",
  "type": "DOG | CAT | OTHER"
}
```
> **✅ Aligned:** Both frontend and backend use the `PetType` enum with values `DOG`, `CAT`, `OTHER`.

### MealSchedule
```json
{
  "id": "uuid",
  "petId": "uuid",
  "mealName": "string",
  "scheduledTime": "HH:mm",
  "graceMinutes": 15
}
```
> **✅ ALIGNED:** Backend has `MealSchedule` model with all required fields. Endpoints implemented at `/api/v1/mealschedule/*` and `/api/v1/pet/:petId/mealschedules`.

### FeedingEvent
```json
{
  "id": "uuid",
  "petId": "uuid",
  "mealScheduleId": "uuid",
  "userId": "uuid",
  "fedAt": "ISO-8601",
  "remarks": "string | null",
  "createdAt": "ISO-8601"
}
```
> **✅ ALIGNED:** Backend has `FeedingEvent` model with fields: `id`, `petId`, `mealScheduleId`, `userId`, `fedAt`, `remarks`, `createdAt`. Multiple feeding events per meal per day are supported.

---

## Endpoints

### Authentication

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/auth/login` | `/auth/login` | ✅ Match (both use Basic Auth) |
| POST | `/auth/refresh` | `/auth/refresh` | ✅ Match |
| GET | `/auth/me` | `/auth/me` | ✅ Match |
| POST | `/auth/logout` | `/auth/logout` | ✅ Match |
| POST | — | `/auth/register` | ⚠ Backend has, frontend doesn't use yet |

#### POST `/auth/login`
- **Request:** `Authorization: Basic base64(email:password)`
- **Response:** `APIResponse<Token>`
```json
{ "success": true, "message": "Login successful", "statusCode": 200, "data": { "token": "...", "refreshToken": "..." } }
```

#### POST `/auth/refresh`
- **Request:** `{ "refreshToken": "..." }`
- **Response:** `APIResponse<Token>`

#### GET `/auth/me`
- **Request:** Bearer token in header
- **Response:** `APIResponse<User>`

#### POST `/auth/logout`
- **Request:** Bearer token in header
- **Response:** `APIResponse<bool>` (data: true)

---

### Households

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/household/create` | `/household/create` | ✅ Match |
| POST | `/household/join` | `/household/join` | ✅ Match |
| GET | `/household/{id}` | `/household/{id}` | ✅ Match |
| GET | `/household/{id}/members` | `/household/{id}/members` | ✅ Match |
| POST | `/household/{id}/leave` | `/household/{id}/leave` | ✅ Match |

#### POST `/household/create`
- **Request:** `{ "name": "My Household" }`
- **Response:** `APIResponse<Household>`

#### POST `/household/join`
- **Request:** `{ "inviteCode": "ABC123" }`
- **Response:** `APIResponse<User>` (updated user with householdId set)

#### GET `/household/{householdId}`
- **Response:** `APIResponse<Household>`

#### GET `/household/{householdId}/members`
- **Response:** `APIResponse<List<User>>`

#### POST `/household/{householdId}/leave`
- **Response:** `APIResponse<bool>`

---

### Pets

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/pet/create` | `/pet/create` | ✅ Match |
| PUT | `/pet/{id}` | `/pet/{id}` | ✅ Match |
| DELETE | `/pet/{id}` | `/pet/{id}` | ✅ Match |
| GET | `/pet/{id}` | `/pet/{id}` | ✅ Match |
| GET | `/household/{id}/pets` | `/household/{id}/pets` | ✅ Match |

#### POST `/pet/create`
- **Request:** `{ "householdId": "uuid", "name": "Buddy", "type": "DOG" }`
- **Response:** `APIResponse<Pet>`

#### GET `/household/{householdId}/pets`
- **Response:** `APIResponse<List<Pet>>`

---

### Meal Schedules

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/mealschedule/create` | `/mealschedule/create` | ✅ Match |
| PUT | `/mealschedule/{id}` | `/mealschedule/{id}` | ✅ Match |
| DELETE | `/mealschedule/{id}` | `/mealschedule/{id}` | ✅ Match |
| GET | `/pet/{petId}/mealschedules` | `/pet/{petId}/mealschedules` | ✅ Match |

---

### Feeding Events

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/feeding-events` | `/feeding-events` | ✅ Match |
| GET | `/feeding-events?petId={id}` | `/feeding-events?petId={id}` | ✅ Match |
| DELETE | `/feeding-events/{id}` | `/feeding-events/{id}` | ✅ Match |

---

## Summary of Backend Changes

### ✅ All Critical Issues Resolved

1. **Response wrapper middleware** — ✅ Implemented and registered
2. **GET `/auth/me`** — ✅ Returns current user from JWT with householdId
3. **POST `/auth/logout`** — ✅ Implemented (stateless JWT, no server-side invalidation)
4. **`inviteCode` on Household** — ✅ Field exists with generation logic
5. **POST `/household/join`** — ✅ Join household by invite code implemented
6. **`image` field on User** — ✅ Using `image` field (not `avatarUrl`)
7. **`householdId` on User response** — ✅ Derived from `HouseholdMember` and included

### ✅ Feature Parity Achieved

8. **MealSchedule model & endpoints** — ✅ Fully implemented
9. **FeedingEvent model & tracking** — ✅ Fully implemented with remarks support
10. **POST `/household/{id}/leave`** — ✅ Leave household endpoint implemented

### ✅ Path Alignment Complete

All endpoint paths now match the frontend expectations:
- `/household/create`, `/household/{id}`, `/household/{id}/members`, `/household/{id}/pets`, `/household/{id}/leave` ✅
- `/pet/create`, `/pet/{id}` ✅
- `/mealschedule/create`, `/mealschedule/{id}`, `/pet/{petId}/mealschedules` ✅
- `/feeding-events` ✅

---

## Decision Log

| # | Decision | Chosen | Date |
|---|----------|--------|------|
| 1 | Response envelope format | ✅ Wrapper middleware implemented | 2026-04-07 |
| 2 | Path convention (REST vs action-based) | ✅ Frontend-aligned paths (action-based) | 2026-04-07 |
| 3 | MealSchedule vs Task model | ✅ Dedicated MealSchedule model | 2026-04-07 |
| 4 | FeedingEvent vs TaskCompletion | ✅ Dedicated FeedingEvent model | 2026-04-07 |
| 5 | Pet type: enum vs free string | ✅ Enum (`DOG`, `CAT`, `OTHER`) — aligned | 2026-04-07 |
