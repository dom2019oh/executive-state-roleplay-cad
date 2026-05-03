// In-memory store used when FIREBASE_PROJECT_ID is not set (dev/demo mode)
type Doc = Record<string, unknown>
type Collection = Map<string, Doc>

const store = new Map<string, Collection>()

function col(name: string): Collection {
  if (!store.has(name)) store.set(name, new Map())
  return store.get(name)!
}

function docId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function matchesWhere(doc: Doc, wheres: { field: string; op: string; value: unknown }[]): boolean {
  for (const { field, op, value } of wheres) {
    const parts = field.split('.')
    let v: unknown = doc
    for (const p of parts) v = (v as any)?.[p]
    if (op === '==' && v !== value) return false
    if (op === 'array-contains' && !Array.isArray(v)) return false
    if (op === 'array-contains' && !(v as unknown[]).includes(value)) return false
    if (op === '>=' && (v as string) < (value as string)) return false
    if (op === '<=' && (v as string) > (value as string)) return false
  }
  return true
}

class QuerySnapshot {
  docs: DocSnapshot[]
  constructor(docs: DocSnapshot[]) { this.docs = docs }
  get size() { return this.docs.length }
  get empty() { return this.docs.length === 0 }
}

class DocSnapshot {
  id: string
  _data: Doc | null
  ref: DocRef
  constructor(id: string, data: Doc | null, ref: DocRef) {
    this.id = id
    this._data = data
    this.ref = ref
  }
  get exists() { return this._data !== null }
  data() { return this._data }
}

class DocRef {
  _col: string
  id: string
  constructor(colName: string, id: string) {
    this._col = colName
    this.id = id
  }
  async get(): Promise<DocSnapshot> {
    const data = col(this._col).get(this.id) ?? null
    return new DocSnapshot(this.id, data ? { ...data } : null, this)
  }
  async set(data: Doc) {
    col(this._col).set(this.id, { ...data })
  }
  async update(data: Doc) {
    const existing = col(this._col).get(this.id) ?? {}
    col(this._col).set(this.id, mergeDeep(existing, data))
  }
  async delete() {
    col(this._col).delete(this.id)
  }
  collection(subCol: string) {
    return new ColRef(`${this._col}/${this.id}/${subCol}`)
  }
}

class Query {
  _col: string
  _wheres: { field: string; op: string; value: unknown }[] = []
  _orderField: string | null = null
  _orderDir: 'asc' | 'desc' = 'asc'
  _limit: number = 1000

  constructor(colName: string) { this._col = colName }

  where(field: string, op: string, value: unknown): Query {
    const q = new Query(this._col)
    q._wheres = [...this._wheres, { field, op, value }]
    q._orderField = this._orderField
    q._orderDir = this._orderDir
    q._limit = this._limit
    return q
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): Query {
    const q = new Query(this._col)
    q._wheres = [...this._wheres]
    q._orderField = field
    q._orderDir = dir
    q._limit = this._limit
    return q
  }

  limit(n: number): Query {
    const q = new Query(this._col)
    q._wheres = [...this._wheres]
    q._orderField = this._orderField
    q._orderDir = this._orderDir
    q._limit = n
    return q
  }

  async get(): Promise<QuerySnapshot> {
    let docs = Array.from(col(this._col).entries())
      .filter(([, data]) => matchesWhere(data, this._wheres))
      .map(([id, data]) => new DocSnapshot(id, { ...data }, new DocRef(this._col, id)))

    if (this._orderField) {
      const f = this._orderField
      const dir = this._orderDir
      docs.sort((a, b) => {
        const av = (a.data() as any)?.[f]
        const bv = (b.data() as any)?.[f]
        if (av === bv) return 0
        const cmp = av < bv ? -1 : 1
        return dir === 'asc' ? cmp : -cmp
      })
    }

    return new QuerySnapshot(docs.slice(0, this._limit))
  }
}

class ColRef extends Query {
  constructor(colName: string) { super(colName) }

  doc(id?: string): DocRef {
    return new DocRef(this._col, id ?? docId())
  }

  async add(data: Doc): Promise<DocRef> {
    const id = docId()
    col(this._col).set(id, { ...data })
    return new DocRef(this._col, id)
  }
}

function mergeDeep(target: Doc, source: Doc): Doc {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeDeep((target[key] as Doc) ?? {}, source[key] as Doc)
    } else {
      result[key] = source[key]
    }
  }
  return result
}

export const memDb = {
  collection: (name: string) => new ColRef(name),
}

// Seed demo data
function seed() {
  const ts = Date.now()

  // Demo session
  col('sessions').set('dev-token', {
    userId: 'dev-user-123',
    createdAt: ts,
    expiresAt: ts + 7 * 24 * 60 * 60 * 1000,
  })

  // Demo user
  col('users').set('dev-user-123', {
    discordId: 'dev-user-123',
    discordUsername: 'devuser#0001',
    discordDisplayName: 'Dev Officer',
    discordAvatar: null,
    guildMember: true,
    guildRoles: [],
    role: 'dispatcher',
    civilianId: 'dev-civ-001',
    officerId: 'dev-off-001',
    banned: false,
    banReason: null,
    createdAt: ts,
    lastLogin: ts,
  })

  // Demo civilian
  col('civilians').set('dev-civ-001', {
    userId: 'dev-user-123',
    firstName: 'Michael',
    lastName: 'Townley',
    dateOfBirth: new Date('1968-04-09').getTime(),
    gender: 'Male',
    ethnicity: 'Caucasian',
    height: '6\'1"',
    weight: '200 lbs',
    eyeColor: 'Blue',
    hairColor: 'Grey',
    address: '3671 Whispymound Dr, Vinewood Hills',
    phone: '555-0187',
    occupation: 'Retired',
    mugshot: null,
    driversLicense: { number: 'DL-447821', class: 'C', status: 'valid', issuedAt: ts - 1e9, expiresAt: ts + 2e9 },
    weaponLicense: { status: 'valid', issuedAt: ts - 1e9 },
    flags: [],
    notes: 'Demo civilian profile.',
    createdAt: ts,
    updatedAt: ts,
  })

  col('civilians').set('dev-civ-002', {
    userId: 'other-user',
    firstName: 'Trevor',
    lastName: 'Philips',
    dateOfBirth: new Date('1967-11-14').getTime(),
    gender: 'Male',
    ethnicity: 'Caucasian',
    height: '6\'2"',
    weight: '210 lbs',
    eyeColor: 'Blue',
    hairColor: 'Brown',
    address: 'Sandy Shores Airfield, Blaine County',
    phone: '555-0130',
    occupation: 'Entrepreneur',
    mugshot: null,
    driversLicense: { number: 'DL-112233', class: 'A', status: 'suspended', issuedAt: ts - 2e9, expiresAt: ts - 1e8 },
    weaponLicense: { status: 'revoked', issuedAt: null },
    flags: ['wanted', 'armed', 'dangerous'],
    notes: 'Known associate of multiple criminal organizations.',
    createdAt: ts,
    updatedAt: ts,
  })

  // Demo vehicle
  col('vehicles').set('dev-veh-001', {
    ownerId: 'dev-civ-002',
    plate: 'SAX4829',
    vin: '1HGBH41JXMN109186',
    make: 'Declasse',
    model: 'Rancher XL',
    year: 2015,
    color: 'White',
    secondaryColor: null,
    registrationStatus: 'stolen',
    registrationExpiry: ts - 1e8,
    insurance: { status: 'expired', provider: null, expiresAt: ts - 1e8 },
    flags: ['stolen', 'bolo'],
    notes: '',
    createdAt: ts,
    updatedAt: ts,
  })

  // Demo officer
  col('officers').set('dev-off-001', {
    userId: 'dev-user-123',
    civilianId: 'dev-civ-001',
    department: 'DISPATCH',
    badgeNumber: '10001',
    callSign: 'DISP-1',
    rank: 'Senior Dispatcher',
    clockedIn: false,
    clockedInAt: null,
    clockedOutAt: null,
    status: '10-7',
    statusLabel: 'Out of Service',
    currentCallId: null,
    suspended: false,
    suspendReason: null,
    createdAt: ts,
    updatedAt: ts,
  })

  // Demo warrant
  col('warrants').set('dev-wrt-001', {
    warrantNumber: 'WRT-2026-00001',
    civilianId: 'dev-civ-002',
    issuedBy: 'dev-off-001',
    approvedBy: null,
    department: 'LSPD',
    type: 'arrest',
    reason: 'Assault with a deadly weapon, evading police',
    charges: [{ penalCodeId: '', code: '245(a)(1) PC', title: 'Assault with a Deadly Weapon', severity: 'felony', count: 1, fine: 5000, jailTime: '3 years' }],
    status: 'active',
    issuedAt: ts - 8.64e7,
    expiresAt: null,
    servedAt: null,
    servedBy: null,
    notes: 'Subject is considered armed and dangerous.',
  })

  // Demo BOLO
  col('bolos').set('dev-bolo-001', {
    boloNumber: 'BOLO-2026-00001',
    type: 'vehicle',
    civilianId: 'dev-civ-002',
    vehicleId: 'dev-veh-001',
    description: 'White Declasse Rancher XL, plate SAX4829, stolen from Pillbox Hill area',
    reason: 'Stolen vehicle, suspect armed',
    lastKnownLocation: 'Sandy Shores Airfield',
    issuedBy: 'dev-off-001',
    department: 'LSPD',
    priority: 'high',
    status: 'active',
    issuedAt: ts - 3.6e6,
    expiresAt: null,
    resolvedAt: null,
    resolvedBy: null,
    notes: '',
  })

  // Demo call
  col('calls').set('dev-call-001', {
    callNumber: 'CAD-2026-00001',
    origin: 'dispatch',
    code: '10-80',
    codeLabel: 'Vehicle Pursuit',
    description: 'Suspect in stolen Rancher XL fleeing northbound on Route 68. Armed and dangerous.',
    location: 'Route 68, near Sandy Shores',
    priority: 1,
    status: 'active',
    reportedBy: 'dev-user-123',
    reporterName: null,
    dispatcherId: 'dev-off-001',
    assignedUnits: [],
    departmentsInvolved: ['LSPD', 'SAST'],
    notes: 'Unit requested backup. Signal 50 K9 response.',
    createdAt: ts - 600000,
    updatedAt: ts - 60000,
    closedAt: null,
  })
}

seed()
