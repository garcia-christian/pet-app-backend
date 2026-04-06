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

> **⚠ MISMATCH:** Backend currently returns raw entities without the `success`/`message`/`statusCode`/`data` wrapper. Backend needs a response wrapper middleware.

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
> **⚠ MISMATCH:** Backend uses `avatarUrl` — frontend expects `image`. Backend `User` has no `householdId` field (membership is via `HouseholdMember` join table).

### Household
```json
{
  "id": "uuid",
  "name": "string",
  "inviteCode": "string",
  "createdAt": "ISO-8601"
}
```
> **⚠ MISMATCH:** Backend `Household` has no `inviteCode` field. This needs to be added to the backend schema.

### Pet
```json
{
  "id": "uuid",
  "householdId": "uuid",
  "name": "string",
  "type": "string"
}
```
> **Note:** Backend uses enum `DOG | CAT | OTHER`. Frontend treats `type` as a free string. Align on enum values or make backend accept arbitrary strings.

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
> **⚠ MISMATCH:** Backend has no `MealSchedule` model. It has `Task` with `taskType` (FEED/WALK/CLEAN/OTHER) and `scheduleType` (DAILY/ONCE). Either:
> - Backend adds a `MealSchedule` model, OR
> - Frontend adapts to use the `Task` model for feeding schedules

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
> **⚠ MISMATCH:** Backend has `TaskCompletion` instead, with fields: `taskId`, `completedByUserId`, `completedAt`, `date`. It lacks `remarks` and has a unique constraint on `(taskId, date)` — meaning only one completion per task per day. Frontend expects multiple feeding events per meal per day.

---

## Endpoints

### Authentication

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/auth/login` | `/auth/login` | ✅ Match (both use Basic Auth) |
| POST | `/auth/refresh` | `/auth/refresh` | ✅ Match |
| GET | `/auth/me` | — | ❌ **Missing in backend** |
| POST | `/auth/logout` | — | ❌ **Missing in backend** |
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
| POST | `/household/create` | `/households` | ⚠ **Path mismatch** |
| POST | `/household/join` | — | ❌ **Missing** (no invite code system) |
| GET | `/household/{id}` | `/households/{id}` | ⚠ **Path mismatch** |
| GET | `/household/{id}/members` | `/household-members?householdId={id}` | ⚠ **Path vs query param** |
| POST | `/household/{id}/leave` | `/household-members/{id}` (DELETE) | ⚠ **Different approach** |

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
| POST | `/pet/create` | `/pets` | ⚠ **Path mismatch** |
| PUT | `/pet/{id}` | `/pets/{id}` | ⚠ **Path mismatch** |
| DELETE | `/pet/{id}` | `/pets/{id}` | ⚠ **Path mismatch** |
| GET | `/pet/{id}` | `/pets/{id}` | ⚠ **Path mismatch** |
| GET | `/household/{id}/pets` | `/pets?householdId={id}` | ⚠ **Path vs query param** |

#### POST `/pet/create`
- **Request:** `{ "householdId": "uuid", "name": "Buddy", "type": "dog" }`
- **Response:** `APIResponse<Pet>`

#### GET `/household/{householdId}/pets`
- **Response:** `APIResponse<List<Pet>>`

---

### Meal Schedules

| Method | Frontend Expects | Backend Has | Status |
|--------|-----------------|-------------|--------|
| POST | `/mealschedule/create` | — | ❌ **Missing** |
| PUT | `/mealschedule/{id}` | — | ❌ **Missing** |
| DELETE | `/mealschedule/{id}` | — | ❌ **Missing** |
| GET | `/pet/{petId}/mealschedules` | — | ❌ **Missing** |

> Backend has `/tasks` which could serve a similar purpose but with different schema. See Data Models section above.

---

## Summary of Required Backend Changes

### Critical (blocking frontend integration)

1. **Response wrapper middleware** — Wrap all responses in `{ success, message, statusCode, data, traceId }` envelope
2. **GET `/auth/me`** — Return current user from JWT
3. **POST `/auth/logout`** — Invalidate refresh token
4. **`inviteCode` on Household** — Add field + generation logic
5. **POST `/household/join`** — Join household by invite code
6. **`image` field on User** — Rename `avatarUrl` → `image` OR add alias
7. **`householdId` on User response** — Derive from `HouseholdMember` and include in User JSON

### Important (feature parity)

8. **MealSchedule endpoints** — Either add dedicated model or adapt Task model
9. **FeedingEvent tracking** — Either add dedicated model or adapt TaskCompletion (remove unique-per-day constraint, add remarks)
10. **POST `/household/{id}/leave`** — Leave household endpoint

### Path Alignment (pick one side)

Option A: **Backend adapts to frontend paths** (recommended — less Flutter code to change)
- `/households` → `/household/create`, `/household/{id}`
- `/pets` → `/pet/create`, `/pet/{id}`
- `/household-members` → `/household/{id}/members`
- `/pets?householdId=X` → `/household/{id}/pets`

Option B: **Frontend adapts to backend paths**
- Update all endpoint constants in repository implementations

---

## Decision Log

| # | Decision | Chosen | Date |
|---|----------|--------|------|
| 1 | Response envelope format | TBD — frontend uses wrapper, backend doesn't | |
| 2 | Path convention (REST vs action-based) | TBD | |
| 3 | MealSchedule vs Task model | TBD | |
| 4 | FeedingEvent vs TaskCompletion | TBD | |
| 5 | Pet type: enum vs free string | TBD | |
