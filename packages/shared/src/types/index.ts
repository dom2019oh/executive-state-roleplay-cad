export type Department = 'LSPD' | 'SAST' | 'SAFD' | 'SAMS' | 'DISPATCH'
export type UserRole = 'civilian' | 'officer' | 'dispatcher' | 'admin'
export type CallStatus = 'pending' | 'active' | 'on_scene' | 'closed'
export type CallOrigin = '911_command' | 'radio' | 'dispatch' | 'walk_in'
export type RecordStatus = 'open' | 'closed' | 'pending_review'
export type WarrantType = 'arrest' | 'search' | 'bench'
export type WarrantStatus = 'active' | 'served' | 'expired' | 'recalled'
export type BoloType = 'person' | 'vehicle'
export type BoloStatus = 'active' | 'resolved' | 'expired'
export type ArrestStatus = 'booked' | 'released' | 'arraigned' | 'convicted' | 'dismissed'
export type CitationStatus = 'unpaid' | 'paid' | 'disputed' | 'voided'
export type CitationType = 'traffic' | 'civil' | 'parking'
export type LicenseStatus = 'valid' | 'suspended' | 'revoked' | 'expired'
export type RegistrationStatus = 'valid' | 'expired' | 'stolen' | 'suspended'
export type PenalSeverity = 'infraction' | 'misdemeanor' | 'felony' | 'capital'
export type PenalCategory =
  | 'crimes_against_persons'
  | 'crimes_against_property'
  | 'drug_offenses'
  | 'traffic_violations'
  | 'weapons_offenses'
  | 'public_order'
  | 'gang_crimes'
  | 'government_offenses'
  | 'financial_crimes'
  | 'juvenile'
  | 'federal'
  | 'server_rules'

export interface CadUser {
  id: string
  discordId: string
  discordUsername: string
  discordDisplayName: string
  discordAvatar: string | null
  guildMember: boolean
  guildRoles: string[]
  role: UserRole
  civilianId: string | null
  officerId: string | null
  banned: boolean
  banReason: string | null
  createdAt: number
  lastLogin: number
}

export interface Civilian {
  id: string
  userId: string
  firstName: string
  lastName: string
  dateOfBirth: number
  gender: string
  ethnicity: string
  height: string
  weight: string
  eyeColor: string
  hairColor: string
  address: string
  phone: string
  occupation: string
  mugshot: string | null
  driversLicense: {
    number: string
    class: 'A' | 'B' | 'C' | 'M' | 'none'
    status: LicenseStatus
    issuedAt: number
    expiresAt: number
  }
  weaponLicense: {
    status: 'none' | 'valid' | 'revoked'
    issuedAt: number | null
  }
  flags: string[]
  notes: string
  createdAt: number
  updatedAt: number
}

export interface Vehicle {
  id: string
  ownerId: string
  plate: string
  vin: string
  make: string
  model: string
  year: number
  color: string
  secondaryColor: string | null
  registrationStatus: RegistrationStatus
  registrationExpiry: number
  insurance: {
    status: 'valid' | 'expired' | 'none'
    provider: string | null
    expiresAt: number | null
  }
  flags: string[]
  notes: string
  createdAt: number
  updatedAt: number
}

export interface Officer {
  id: string
  userId: string
  civilianId: string
  department: Department
  badgeNumber: string
  callSign: string | null
  rank: string
  clockedIn: boolean
  clockedInAt: number | null
  clockedOutAt: number | null
  status: string
  statusLabel: string
  currentCallId: string | null
  suspended: boolean
  suspendReason: string | null
  createdAt: number
  updatedAt: number
}

export interface ActiveUnit {
  officerId: string
  userId: string
  department: Department
  badgeNumber: string
  callSign: string | null
  rank: string
  fullName: string
  status: string
  statusLabel: string
  currentCallId: string | null
  panicActive: boolean
  location: string | null
  clockedInAt: number
  lastUpdated: number
}

export interface CallLog {
  id: string
  officerId: string | null
  action: string
  detail: string
  timestamp: number
}

export interface Call {
  id: string
  callNumber: string
  origin: CallOrigin
  code: string
  codeLabel: string
  description: string
  location: string
  priority: 1 | 2 | 3
  status: CallStatus
  reportedBy: string
  reporterName: string | null
  dispatcherId: string | null
  assignedUnits: string[]
  departmentsInvolved: Department[]
  notes: string
  createdAt: number
  updatedAt: number
  closedAt: number | null
}

export interface Charge {
  penalCodeId: string
  code: string
  title: string
  severity: PenalSeverity
  count: number
  fine: number
  jailTime: string
}

export interface Incident {
  id: string
  incidentNumber: string
  callId: string | null
  title: string
  type: string
  description: string
  location: string
  incidentDate: number
  status: RecordStatus
  department: Department
  createdBy: string
  involvedOfficers: string[]
  involvedCivilians: string[]
  involvedVehicles: string[]
  attachments: string[]
  createdAt: number
  updatedAt: number
}

export interface Arrest {
  id: string
  arrestNumber: string
  civilianId: string
  arrestingOfficerId: string
  department: Department
  callId: string | null
  incidentId: string | null
  arrestDate: number
  location: string
  charges: Charge[]
  totalFine: number
  totalJailTime: string
  bookingNotes: string
  mugshot: string | null
  status: ArrestStatus
  createdAt: number
  updatedAt: number
}

export interface Citation {
  id: string
  citationNumber: string
  civilianId: string
  vehicleId: string | null
  officerId: string
  department: Department
  callId: string | null
  incidentId: string | null
  type: CitationType
  date: number
  location: string
  violations: {
    penalCodeId: string
    code: string
    title: string
    fine: number
    points: number | null
  }[]
  totalFine: number
  totalPoints: number
  status: CitationStatus
  notes: string
  createdAt: number
}

export interface Warrant {
  id: string
  warrantNumber: string
  civilianId: string
  issuedBy: string
  approvedBy: string | null
  department: Department
  type: WarrantType
  reason: string
  charges: Charge[]
  status: WarrantStatus
  issuedAt: number
  expiresAt: number | null
  servedAt: number | null
  servedBy: string | null
  notes: string
}

export interface Bolo {
  id: string
  boloNumber: string
  type: BoloType
  civilianId: string | null
  vehicleId: string | null
  description: string
  reason: string
  lastKnownLocation: string
  issuedBy: string
  department: Department
  priority: 'low' | 'medium' | 'high' | 'extreme'
  status: BoloStatus
  issuedAt: number
  expiresAt: number | null
  resolvedAt: number | null
  resolvedBy: string | null
  notes: string
}

export interface PenalCode {
  id: string
  code: string
  title: string
  description: string
  category: PenalCategory
  severity: PenalSeverity
  type: 'arrest' | 'citation' | 'both'
  fine: number | null
  jailTime: string | null
  licensePoints: number | null
  licenseAction: 'none' | 'suspend' | 'revoke' | null
  searchable: boolean
  createdAt: number
}

export interface TenCode {
  id: string
  code: string
  label: string
  description: string
  type: 'ten_code' | 'signal'
  category: 'status' | 'dispatch' | 'emergency' | 'admin' | 'transport'
  priority: boolean
  applicableDepts: Department[]
}

export interface EmsReport {
  id: string
  reportNumber: string
  callId: string | null
  incidentId: string | null
  patientCivilianId: string | null
  patientName: string
  respondingOfficers: string[]
  incidentDate: number
  location: string
  chiefComplaint: string
  mechanismOfInjury: string
  vitalSigns: {
    heartRate: number
    bloodPressure: string
    respiratoryRate: number
    oxygenSaturation: number
    temperature: number
    gcs: number
    pupils: string
  }
  treatmentProvided: string
  medications: {
    name: string
    dose: string
    route: string
    time: number
  }[]
  transportedTo: string | null
  outcome: 'transported' | 'refused' | 'treated_on_scene' | 'deceased'
  notes: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface FireReport {
  id: string
  reportNumber: string
  callId: string | null
  incidentId: string | null
  respondingOfficers: string[]
  incidentDate: number
  location: string
  incidentType: string
  alarmLevel: 1 | 2 | 3 | 4 | 5
  cause: string
  injuries: number
  fatalities: number
  ffInjuries: number
  propertyDamage: number
  structureType: string | null
  sprinklerPresent: boolean
  sprinklerActivated: boolean
  unitsResponded: number
  suppressed: boolean
  suppressionMethod: string | null
  hazmat: boolean
  hazmatType: string | null
  notes: string
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface SearchResult {
  civilians: (Civilian & { vehicles: Vehicle[] })[]
  vehicles: (Vehicle & { owner: Civilian })[]
}
