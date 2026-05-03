# Executive State CAD System — Firestore Data Schema

## Overview

- **Auth:** Discord OAuth2 (guild membership verified on every session)
- **Departments:** LSPD · SAST · SAFD · SAMS · DISPATCH
- **User flow:** Discord login → Civilian account → Optional department join (badge number) → Clock in → Access CAD

---

## Collections

---

### `users/{userId}`
> `userId` = Discord Snowflake ID. Created on first OAuth2 login.

| Field | Type | Notes |
|---|---|---|
| `discordId` | `string` | Discord snowflake |
| `discordUsername` | `string` | e.g. `dom#0001` |
| `discordDisplayName` | `string` | Guild nickname if set |
| `discordAvatar` | `string` | Avatar URL |
| `guildMember` | `boolean` | Re-verified each login via bot |
| `guildRoles` | `string[]` | Discord role IDs in guild |
| `role` | `string` | `civilian` · `officer` · `dispatcher` · `admin` |
| `civilianId` | `string \| null` | Ref → `civilians` |
| `officerId` | `string \| null` | Ref → `officers` (if joined a dept) |
| `banned` | `boolean` | CAD ban flag |
| `banReason` | `string \| null` | |
| `createdAt` | `timestamp` | |
| `lastLogin` | `timestamp` | |

---

### `civilians/{civilianId}`
> One civilian profile per user. Required before joining any department.

| Field | Type | Notes |
|---|---|---|
| `userId` | `string` | Ref → `users` |
| `firstName` | `string` | |
| `lastName` | `string` | |
| `dateOfBirth` | `timestamp` | |
| `gender` | `string` | `male` · `female` · `other` |
| `ethnicity` | `string` | |
| `height` | `string` | e.g. `5'11"` |
| `weight` | `string` | e.g. `180 lbs` |
| `eyeColor` | `string` | |
| `hairColor` | `string` | |
| `address` | `string` | In-game address |
| `phone` | `string` | In-game number |
| `occupation` | `string` | |
| `mugshot` | `string \| null` | Storage URL |
| `driversLicense` | `object` | See below |
| `driversLicense.number` | `string` | |
| `driversLicense.class` | `string` | `A` · `B` · `C` · `M` |
| `driversLicense.status` | `string` | `valid` · `suspended` · `revoked` · `expired` |
| `driversLicense.issuedAt` | `timestamp` | |
| `driversLicense.expiresAt` | `timestamp` | |
| `weaponLicense` | `object` | See below |
| `weaponLicense.status` | `string` | `none` · `valid` · `revoked` |
| `weaponLicense.issuedAt` | `timestamp \| null` | |
| `flags` | `string[]` | `wanted` · `armed` · `dangerous` · `do_not_release` |
| `notes` | `string` | Officer-visible notes |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `vehicles/{vehicleId}`
> Registered to a civilian. Searchable by plate or VIN.

| Field | Type | Notes |
|---|---|---|
| `ownerId` | `string` | Ref → `civilians` |
| `plate` | `string` | Unique, uppercase |
| `vin` | `string` | |
| `make` | `string` | e.g. `Bravado` |
| `model` | `string` | e.g. `Buffalo STX` |
| `year` | `number` | |
| `color` | `string` | Primary color |
| `secondaryColor` | `string \| null` | |
| `registrationStatus` | `string` | `valid` · `expired` · `stolen` · `suspended` |
| `registrationExpiry` | `timestamp` | |
| `insurance.status` | `string` | `valid` · `expired` · `none` |
| `insurance.provider` | `string \| null` | |
| `insurance.expiresAt` | `timestamp \| null` | |
| `flags` | `string[]` | `stolen` · `bolo` · `wanted` |
| `notes` | `string` | |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `officers/{officerId}`
> Created when a user joins a department using their badge number.

| Field | Type | Notes |
|---|---|---|
| `userId` | `string` | Ref → `users` |
| `civilianId` | `string` | Ref → `civilians` |
| `department` | `string` | `LSPD` · `SAST` · `SAFD` · `SAMS` · `DISPATCH` |
| `badgeNumber` | `string` | 5-digit, issued by Discord bot |
| `callSign` | `string \| null` | e.g. `1-ADAM-12` |
| `rank` | `string` | Set by admin after join |
| `clockedIn` | `boolean` | |
| `clockedInAt` | `timestamp \| null` | |
| `clockedOutAt` | `timestamp \| null` | |
| `status` | `string` | Current 10-code string e.g. `10-8` |
| `statusLabel` | `string` | Human label e.g. `In Service` |
| `currentCallId` | `string \| null` | Ref → `calls` |
| `suspended` | `boolean` | Department suspension |
| `suspendReason` | `string \| null` | |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `active_units/{officerId}`
> Live real-time collection. Written on clock-in, deleted on clock-out. Firestore onSnapshot for dispatch board.

| Field | Type | Notes |
|---|---|---|
| `officerId` | `string` | Ref → `officers` |
| `userId` | `string` | |
| `department` | `string` | |
| `badgeNumber` | `string` | |
| `callSign` | `string \| null` | |
| `rank` | `string` | |
| `fullName` | `string` | Denormalized from civilian |
| `status` | `string` | 10-code e.g. `10-8` |
| `statusLabel` | `string` | |
| `currentCallId` | `string \| null` | |
| `panicActive` | `boolean` | 10-99 flag |
| `location` | `string \| null` | Last known in-game location |
| `clockedInAt` | `timestamp` | |
| `lastUpdated` | `timestamp` | |

---

### `calls/{callId}`
> All 911 calls and dispatch-created calls. Shared board, all departments visible.

| Field | Type | Notes |
|---|---|---|
| `callNumber` | `string` | Auto e.g. `CAD-2026-00001` |
| `origin` | `string` | `911_command` · `radio` · `dispatch` · `walk_in` |
| `code` | `string` | 10-code e.g. `10-11` |
| `codeLabel` | `string` | e.g. `Traffic Stop` |
| `description` | `string` | |
| `location` | `string` | |
| `priority` | `number` | `1` · `2` · `3` (Code 1/2/3) |
| `status` | `string` | `pending` · `active` · `on_scene` · `closed` |
| `reportedBy` | `string` | Discord userId or `system` |
| `reporterName` | `string \| null` | Caller name/handle |
| `dispatcherId` | `string \| null` | Ref → `officers` (DISPATCH dept) |
| `assignedUnits` | `string[]` | Array of `officerId` refs |
| `departmentsInvolved` | `string[]` | e.g. `["LSPD","SAMS"]` |
| `notes` | `string` | Running dispatcher notes |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |
| `closedAt` | `timestamp \| null` | |

#### Subcollection: `calls/{callId}/logs/{logId}`
| Field | Type | Notes |
|---|---|---|
| `officerId` | `string \| null` | |
| `action` | `string` | e.g. `unit_assigned` · `status_change` · `note_added` |
| `detail` | `string` | Human-readable log line |
| `timestamp` | `timestamp` | |

---

### `incidents/{incidentId}`
> Formal incident records. Can be linked to a call or standalone.

| Field | Type | Notes |
|---|---|---|
| `incidentNumber` | `string` | e.g. `INC-2026-00001` |
| `callId` | `string \| null` | Ref → `calls` |
| `title` | `string` | |
| `type` | `string` | `traffic` · `assault` · `robbery` · `homicide` · `drug` · `domestic` · `fire` · `ems` · `other` |
| `description` | `string` | Narrative |
| `location` | `string` | |
| `incidentDate` | `timestamp` | |
| `status` | `string` | `open` · `pending_review` · `closed` |
| `department` | `string` | Primary dept |
| `createdBy` | `string` | Ref → `officers` |
| `involvedOfficers` | `string[]` | Ref → `officers` |
| `involvedCivilians` | `string[]` | Ref → `civilians` |
| `involvedVehicles` | `string[]` | Ref → `vehicles` |
| `attachments` | `string[]` | Storage URLs |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `arrests/{arrestId}`
> Booking records created by any sworn officer.

| Field | Type | Notes |
|---|---|---|
| `arrestNumber` | `string` | e.g. `ARR-2026-00001` |
| `civilianId` | `string` | Ref → `civilians` |
| `arrestingOfficerId` | `string` | Ref → `officers` |
| `department` | `string` | |
| `callId` | `string \| null` | |
| `incidentId` | `string \| null` | |
| `arrestDate` | `timestamp` | |
| `location` | `string` | |
| `charges` | `object[]` | See below |
| `charges[].penalCodeId` | `string` | Ref → `penal_codes` |
| `charges[].code` | `string` | e.g. `187 PC` |
| `charges[].title` | `string` | e.g. `Murder` |
| `charges[].severity` | `string` | `infraction` · `misdemeanor` · `felony` |
| `charges[].count` | `number` | Number of counts |
| `charges[].fine` | `number` | Per-count fine |
| `charges[].jailTime` | `string` | e.g. `5 months` · `Life` |
| `totalFine` | `number` | Computed sum |
| `totalJailTime` | `string` | Computed summary |
| `bookingNotes` | `string` | |
| `mugshot` | `string \| null` | Storage URL |
| `status` | `string` | `booked` · `released` · `arraigned` · `convicted` · `dismissed` |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `citations/{citationId}`
> Traffic and civil citations.

| Field | Type | Notes |
|---|---|---|
| `citationNumber` | `string` | e.g. `CIT-2026-00001` |
| `civilianId` | `string` | Ref → `civilians` |
| `vehicleId` | `string \| null` | Ref → `vehicles` (if traffic) |
| `officerId` | `string` | Ref → `officers` |
| `department` | `string` | |
| `callId` | `string \| null` | |
| `incidentId` | `string \| null` | |
| `type` | `string` | `traffic` · `civil` · `parking` |
| `date` | `timestamp` | |
| `location` | `string` | |
| `violations` | `object[]` | See below |
| `violations[].penalCodeId` | `string` | Ref → `penal_codes` |
| `violations[].code` | `string` | |
| `violations[].title` | `string` | |
| `violations[].fine` | `number` | |
| `violations[].points` | `number \| null` | License points |
| `totalFine` | `number` | |
| `totalPoints` | `number` | |
| `status` | `string` | `unpaid` · `paid` · `disputed` · `voided` |
| `notes` | `string` | |
| `createdAt` | `timestamp` | |

---

### `warrants/{warrantId}`
> Arrest, search, and bench warrants.

| Field | Type | Notes |
|---|---|---|
| `warrantNumber` | `string` | e.g. `WRT-2026-00001` |
| `civilianId` | `string` | Ref → `civilians` |
| `issuedBy` | `string` | Ref → `officers` |
| `approvedBy` | `string \| null` | Ref → `officers` (supervisor) |
| `department` | `string` | |
| `type` | `string` | `arrest` · `search` · `bench` |
| `reason` | `string` | |
| `charges` | `object[]` | Same structure as arrests |
| `status` | `string` | `active` · `served` · `expired` · `recalled` |
| `issuedAt` | `timestamp` | |
| `expiresAt` | `timestamp \| null` | |
| `servedAt` | `timestamp \| null` | |
| `servedBy` | `string \| null` | Ref → `officers` |
| `notes` | `string` | |

---

### `bolos/{boloId}`
> Be On Lookout — person or vehicle.

| Field | Type | Notes |
|---|---|---|
| `boloNumber` | `string` | e.g. `BOLO-2026-00001` |
| `type` | `string` | `person` · `vehicle` |
| `civilianId` | `string \| null` | Ref → `civilians` |
| `vehicleId` | `string \| null` | Ref → `vehicles` |
| `description` | `string` | Physical/vehicle description |
| `reason` | `string` | Why the BOLO was issued |
| `lastKnownLocation` | `string` | |
| `issuedBy` | `string` | Ref → `officers` |
| `department` | `string` | |
| `priority` | `string` | `low` · `medium` · `high` · `extreme` |
| `status` | `string` | `active` · `resolved` · `expired` |
| `issuedAt` | `timestamp` | |
| `expiresAt` | `timestamp \| null` | |
| `resolvedAt` | `timestamp \| null` | |
| `resolvedBy` | `string \| null` | Ref → `officers` |
| `notes` | `string` | |

---

### `ems_reports/{reportId}`
> SAMS Patient Care Reports (PCR).

| Field | Type | Notes |
|---|---|---|
| `reportNumber` | `string` | e.g. `PCR-2026-00001` |
| `callId` | `string \| null` | |
| `incidentId` | `string \| null` | |
| `patientCivilianId` | `string \| null` | Ref → `civilians` |
| `patientName` | `string` | Denormalized for unknown patients |
| `respondingOfficers` | `string[]` | SAMS officer refs |
| `incidentDate` | `timestamp` | |
| `location` | `string` | |
| `chiefComplaint` | `string` | |
| `mechanismOfInjury` | `string` | e.g. `GSW` · `MVA` · `Fall` |
| `vitalSigns` | `object` | See below |
| `vitalSigns.heartRate` | `number` | bpm |
| `vitalSigns.bloodPressure` | `string` | e.g. `120/80` |
| `vitalSigns.respiratoryRate` | `number` | breaths/min |
| `vitalSigns.oxygenSaturation` | `number` | % SpO2 |
| `vitalSigns.temperature` | `number` | °F |
| `vitalSigns.gcs` | `number` | Glasgow Coma Scale 3-15 |
| `vitalSigns.pupils` | `string` | e.g. `PERRL` |
| `treatmentProvided` | `string` | Narrative |
| `medications` | `object[]` | See below |
| `medications[].name` | `string` | |
| `medications[].dose` | `string` | |
| `medications[].route` | `string` | `IV` · `IM` · `IO` · `PO` |
| `medications[].time` | `timestamp` | |
| `transportedTo` | `string \| null` | Hospital name |
| `outcome` | `string` | `transported` · `refused` · `treated_on_scene` · `deceased` |
| `notes` | `string` | |
| `createdBy` | `string` | Ref → `officers` (SAMS) |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `fire_reports/{reportId}`
> SAFD Fire Incident Reports.

| Field | Type | Notes |
|---|---|---|
| `reportNumber` | `string` | e.g. `FIR-2026-00001` |
| `callId` | `string \| null` | |
| `incidentId` | `string \| null` | |
| `respondingOfficers` | `string[]` | SAFD officer refs |
| `incidentDate` | `timestamp` | |
| `location` | `string` | |
| `incidentType` | `string` | `structure_fire` · `vehicle_fire` · `wildfire` · `hazmat` · `rescue` · `medical_assist` · `explosion` · `other` |
| `alarmLevel` | `number` | `1` – `5` |
| `cause` | `string` | e.g. `Arson` · `Electrical` · `Unknown` |
| `injuries` | `number` | Civilian + FF count |
| `fatalities` | `number` | |
| `ffInjuries` | `number` | Firefighter injuries |
| `propertyDamage` | `number` | Estimated $ |
| `structureType` | `string \| null` | `residential` · `commercial` · `industrial` |
| `sprinklerPresent` | `boolean` | |
| `sprinklerActivated` | `boolean` | |
| `unitsResponded` | `number` | |
| `suppressed` | `boolean` | Was fire suppressed |
| `suppressionMethod` | `string \| null` | |
| `hazmat` | `boolean` | |
| `hazmatType` | `string \| null` | |
| `notes` | `string` | |
| `createdBy` | `string` | Ref → `officers` (SAFD) |
| `createdAt` | `timestamp` | |
| `updatedAt` | `timestamp` | |

---

### `penal_codes/{penalCodeId}`
> Full penal code library. Pre-seeded, officer-searchable when writing charges.

| Field | Type | Notes |
|---|---|---|
| `code` | `string` | e.g. `187 PC` · `11350 HS` · `22350 VC` |
| `title` | `string` | e.g. `Murder` · `Possession of Narcotics` |
| `description` | `string` | Full legal description |
| `category` | `string` | See categories below |
| `severity` | `string` | `infraction` · `misdemeanor` · `felony` · `capital` |
| `type` | `string` | `arrest` · `citation` · `both` |
| `fine` | `number \| null` | Base fine amount |
| `jailTime` | `string \| null` | e.g. `6 months` · `25 years` · `Life` |
| `licensePoints` | `number \| null` | For VC violations |
| `licenseAction` | `string \| null` | `none` · `suspend` · `revoke` |
| `searchable` | `boolean` | Show in officer search |
| `createdAt` | `timestamp` | |

**Penal Code Categories:**
- `crimes_against_persons` — Murder, Assault, Kidnapping, etc.
- `crimes_against_property` — Robbery, Burglary, Vandalism, etc.
- `drug_offenses` — HS codes
- `traffic_violations` — VC codes
- `weapons_offenses` — PC 25400 etc.
- `public_order` — Trespassing, Disorderly Conduct, etc.
- `gang_crimes` — PC 182.5 etc.
- `government_offenses` — Bribery, Obstruction, etc.
- `financial_crimes` — Fraud, Embezzlement, etc.
- `juvenile` — Applicable juvenile codes
- `federal` — Federal charges
- `server_rules` — RP-specific rule violations (10-90 to 10-93)

---

### `ten_codes/{codeId}`
> Reference table for all 10-codes and Signals. Static seed data.

| Field | Type | Notes |
|---|---|---|
| `code` | `string` | e.g. `10-8` · `Signal 41` |
| `label` | `string` | e.g. `In Service` |
| `description` | `string` | Full description |
| `type` | `string` | `ten_code` · `signal` |
| `category` | `string` | `status` · `dispatch` · `emergency` · `admin` · `transport` |
| `priority` | `boolean` | Is this an emergency code |
| `applicableDepts` | `string[]` | Depts that use this code (empty = all) |

---

### `dispatch_log/{logId}`
> Immutable audit trail of all dispatcher actions.

| Field | Type | Notes |
|---|---|---|
| `dispatcherId` | `string` | Ref → `officers` |
| `action` | `string` | `call_created` · `unit_assigned` · `unit_removed` · `call_closed` · `bolo_issued` · `warrant_issued` etc. |
| `callId` | `string \| null` | |
| `officerId` | `string \| null` | Target officer |
| `detail` | `string` | Human-readable log line |
| `timestamp` | `timestamp` | |

---

### `audit_log/{logId}`
> Full system-wide audit log for admin/security review.

| Field | Type | Notes |
|---|---|---|
| `userId` | `string` | |
| `officerId` | `string \| null` | |
| `action` | `string` | e.g. `record_viewed` · `warrant_created` · `login` · `clock_in` |
| `resource` | `string` | Collection name |
| `resourceId` | `string \| null` | Document ID |
| `detail` | `object` | JSON blob of before/after or metadata |
| `ip` | `string` | |
| `timestamp` | `timestamp` | |

---

### `system_config/{configId}`
> Global CAD configuration. Single document `settings`.

| Field | Type | Notes |
|---|---|---|
| `guildId` | `string` | Discord guild ID to verify against |
| `cadName` | `string` | e.g. `Executive State CAD` |
| `departments` | `string[]` | Active department list |
| `panicAlertWebhook` | `string` | Discord webhook URL for 10-99 alerts |
| `callWebhook` | `string` | Discord webhook for new 911 calls |
| `maintenanceMode` | `boolean` | Lock all non-admin access |
| `updatedAt` | `timestamp` | |

---

## Collection Index Summary

| Collection | Purpose |
|---|---|
| `users` | Discord OAuth2 accounts |
| `civilians` | Civilian citizenship profiles |
| `vehicles` | Registered vehicles |
| `officers` | Department officer profiles |
| `active_units` | Real-time clocked-in unit board |
| `calls` | All 911 / dispatch calls |
| `calls/{id}/logs` | Per-call activity log |
| `incidents` | Incident reports |
| `arrests` | Arrest / booking records |
| `citations` | Traffic / civil citations |
| `warrants` | All warrant types |
| `bolos` | Person and vehicle BOLOs |
| `ems_reports` | SAMS patient care reports |
| `fire_reports` | SAFD fire incident reports |
| `penal_codes` | Full penal code library |
| `ten_codes` | 10-code and Signal reference |
| `dispatch_log` | Dispatcher action audit trail |
| `audit_log` | Full system audit log |
| `system_config` | Global CAD settings |

---

## Key Firestore Indexes Required

```
civilians: lastName ASC, firstName ASC
civilians: flags ARRAY_CONTAINS, createdAt DESC
vehicles: plate ASC
vehicles: ownerId ASC, createdAt DESC
calls: status ASC, createdAt DESC
calls: department ARRAY_CONTAINS, status ASC
officers: department ASC, clockedIn ASC
warrants: civilianId ASC, status ASC
bolos: status ASC, priority DESC
penal_codes: category ASC, severity ASC
penal_codes: code ASC
```

---

## Security Rules Summary (Firestore)

- **Guild check:** All reads/writes require `users/{uid}.guildMember == true`
- **Civilian data:** Readable by all verified users; writable by owning user or any officer
- **RMS records:** Writable by officers only; readable by officers + dispatchers
- **active_units:** Writable only by owning officer; readable by all verified users
- **audit_log:** Writable by backend only (service account); readable by admins only
- **system_config:** Readable by all verified users; writable by admins only
