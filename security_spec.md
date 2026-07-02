# Security Specification & Test-Driven Design (TDD)

This document establishes the security specifications and invariants for the Firestore collections in the application.

## 1. Data Invariants

- **Memberships (`/memberships/{phone}`)**:
  - The document ID MUST match the `phone` field in the payload.
  - The record MUST contain all required fields (`name`, `phone`, `age`, `district`, `wingId`, `constituency`, `union`).
  - No client payload can inject phantom "Ghost Fields" like `isAdmin: true` or `role: "admin"`.
  - The `age` must be an integer between 18 and 120.

- **Officers (`/officers/{officerId}`)**:
  - The `level` field MUST be one of the specified enum values: `state`, `district`, `branch`, `wing`.
  - The document ID MUST match the specified `id` field.
  - The required fields (`id`, `name`, `name_en`, `role`, `role_en`, `district`, `district_en`, `level`) must exist and have valid sizes.

- **Officer History (`/officer_history/{historyId}`)**:
  - The `type` field MUST be either `added` or `removed`.
  - Must include a complete nested `officer` object that validates successfully.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads crafted to breach security, each of which must return `PERMISSION_DENIED` under our security rules.

### Payload 1: Document ID Hijack / Spoof (Memberships)
Attempt to write a membership record where the document ID does not match the inside `phone` attribute.
```json
// Path: /memberships/9876543210
{
  "name": "Jane Doe",
  "phone": "1234567890", // Mismatch with document ID
  "age": 30,
  "district": "Chennai",
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur"
}
```

### Payload 2: Ghost Field Injection (Memberships)
Attempt to register a member with arbitrary extra fields.
```json
// Path: /memberships/1234567890
{
  "name": "John Doe",
  "phone": "1234567890",
  "age": 30,
  "district": "Chennai",
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur",
  "isSuperAdmin": true, // Ghost field
  "bypassPayment": "yes"
}
```

### Payload 3: Invalid Type in Age Field (Memberships)
Attempting to write age as a string status instead of an integer.
```json
// Path: /memberships/1234567890
{
  "name": "John Doe",
  "phone": "1234567890",
  "age": "thirty", // Invalid type
  "district": "Chennai",
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur"
}
```

### Payload 4: Invalid Bounds in Age Field (Memberships)
Attempting to register a member under age 18.
```json
// Path: /memberships/1234567890
{
  "name": "Baby Doe",
  "phone": "1234567890",
  "age": 5, // Invalid boundary
  "district": "Chennai",
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur"
}
```

### Payload 5: Missing Required Fields during Creation (Memberships)
Attempting to create a membership without core properties like `district`.
```json
// Path: /memberships/1234567890
{
  "name": "John Doe",
  "phone": "1234567890",
  "age": 30,
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur"
  // Missing district
}
```

### Payload 6: Document ID Spoof (Officers)
Attempting to write an officer where the ID inside the payload does not match the document ID.
```json
// Path: /officers/o123
{
  "id": "o999", // Mismatch
  "name": "Prabakar",
  "name_en": "Prabakar",
  "role": "Leader",
  "role_en": "Leader",
  "district": "Chennai",
  "district_en": "Chennai",
  "level": "state"
}
```

### Payload 7: Invalid Enum value (Officers)
Attempting to write an officer with an invalid level.
```json
// Path: /officers/o123
{
  "id": "o123",
  "name": "Prabakar",
  "name_en": "Prabakar",
  "role": "Leader",
  "role_en": "Leader",
  "district": "Chennai",
  "district_en": "Chennai",
  "level": "galactic" // Invalid enum
}
```

### Payload 8: Extremely Large ID (Officers)
Denial of Wallet attack with a massive ID size.
```json
// Path: /officers/o1234567890_massive_id_attack_vector_overflow_test_overflow_test...
{
  "id": "o123...", // 1KB ID
  "name": "Prabakar",
  "name_en": "Prabakar",
  "role": "Leader",
  "role_en": "Leader",
  "district": "Chennai",
  "district_en": "Chennai",
  "level": "state"
}
```

### Payload 9: Invalid Action-Based Status Transition (Memberships)
Updating a membership to inject unauthorized keys during a status/wing swap.
```json
// Path: /memberships/1234567890
{
  "name": "Vandalized Name", // Non-permitted field during wing update
  "phone": "1234567890",
  "age": 30,
  "district": "Chennai",
  "wingId": "fishermen", // Only this can change
  "constituency": "Central",
  "union": "Alandur"
}
```

### Payload 10: Invalid Parent/Nested Reference Action (Officer History)
Attempting to log a history item where type is not `added` or `removed`.
```json
// Path: /officer_history/h123
{
  "id": "h123",
  "officer": {
    "id": "o123",
    "name": "Prabakar",
    "name_en": "Prabakar",
    "role": "Leader",
    "role_en": "Leader",
    "district": "Chennai",
    "district_en": "Chennai",
    "level": "state"
  },
  "type": "corrupted", // Invalid enum format
  "timestamp": "2026-06-22T23:13:59Z"
}
```

### Payload 11: Empty Key String (Memberships)
Attempting to write with an empty phone number.
```json
// Path: /memberships/
{
  "name": "Empty Phone",
  "phone": "",
  "age": 30,
  "district": "Chennai",
  "wingId": "youth",
  "constituency": "Central",
  "union": "Alandur"
}
```

### Payload 12: Sub-resource Poisoning (Officer History)
Attempting to post history item with missing nested officer properties.
```json
// Path: /officer_history/h123
{
  "id": "h123",
  "officer": {
    "id": "o123"
    // Missing other mandatory officer fields
  },
  "type": "added",
  "timestamp": "2026-06-22T23:13:59Z"
}
```

---

## 3. Test Cases (Declarative Logic)

Because we run in a clientside context where anonymous clients invoke writes (backed by administrative local credentials), our rules validate these structural requirements natively in `firestore.rules`.
