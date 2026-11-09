export type Role = 'musician' | 'parish'

export const STYLES = [
  'Sacred choral',
  'Early music',
  'Classical',
  'Chamber music',
  'Organ recital',
  'Jazz',
  'Gospel',
  'Folk',
  'Pop and rock',
] as const
export type Style = (typeof STYLES)[number]

export type ArtVariant = 'gothic' | 'spire' | 'modern' | 'romanesque' | 'village' | 'cathedral'

export interface ParishRules {
  allowedStyles: Style[]
  organ: string
  maxVolume: string
  amplification: boolean
  hours: [number, number]
}

export interface Church {
  id: string
  name: string
  address: string
  town: string
  lat: number
  lon: number
  osmWay: number
  village: boolean
  available: boolean
  unavailableReason?: string
  art: ArtVariant
  reverb: number
  volume: number
  capacity: number
  piano: boolean
  organ: boolean
  heating: boolean
  pricePerHour: number
  history: string
  rules: ParishRules
}

export type ServiceType = 'Mass' | 'Wedding' | 'Funeral' | 'Vespers'

export interface Service {
  id: string
  churchId: string
  type: ServiceType
  start: number
  end: number
  weekday?: number
  date?: string
}

export type BookingStatus = 'Confirmed' | 'Pending' | 'Declined'
export type DisplayStatus = 'Confirmed' | 'Pending parish approval' | 'Declined' | 'Completed'

export interface Review {
  rating: number
  text: string
  author: string
}

export interface Booking {
  id: string
  churchId: string
  date: string
  start: number
  end: number
  ensemble: string
  ensembleName: string
  musicians: number
  repertoire: Style
  useOrgan: boolean
  status: BookingStatus
  code: string
  byMe: boolean
  price: number
  createdAt: number
  review?: Review
  signature?: string
}

export interface Fund {
  goal: string
  target: number
  raised: number
  hoursBase: number
  revenueBase: number
  lastSeen: number
}

export interface State {
  version: number
  role: Role | null
  churches: Church[]
  services: Service[]
  bookings: Booking[]
  funds: Record<string, Fund>
  parishChurchId: string
  demoOffset: number
}
