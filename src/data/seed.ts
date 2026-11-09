import type { Booking, Fund, Service, State } from '../types'
import { CHURCHES } from './churches'
import { addDays, ymd } from '../lib/time'

export const STATE_VERSION = 1

let n = 0
const sid = () => `svc-${++n}`

function weekly(churchId: string, weekday: number, start: number, end: number, type: Service['type'] = 'Mass'): Service {
  return { id: sid(), churchId, type, start, end, weekday }
}

export function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function buildSeed(now = Date.now()): State {
  n = 0
  const today = ymd(new Date(now))
  const d = (k: number) => addDays(today, k)

  const services: Service[] = []
  for (const c of CHURCHES) {
    if (!c.available) continue
    services.push(weekly(c.id, 0, 10.5, 11.75)) // Sunday Mass
  }
  services.push(
    weekly('saint-ouen', 6, 18, 19, 'Vespers'),
    weekly('saint-maclou', 6, 18, 19),
    weekly('saint-maclou', 2, 12, 12.75),
    weekly('saint-godard', 3, 9, 9.75),
    weekly('saint-godard', 5, 18.5, 19.25),
    weekly('saint-patrice', 4, 9, 9.75),
    weekly('jeanne-d-arc', 1, 12, 12.75),
    weekly('jeanne-d-arc', 4, 18, 18.75),
    weekly('saint-vivien', 2, 9, 9.75),
    weekly('saint-romain', 5, 9, 9.75),
    weekly('saint-gervais', 3, 18, 18.75),
    weekly('bonsecours', 6, 17, 18),
    weekly('bonsecours', 2, 15, 15.75),
    weekly('boscherville', 6, 11, 12),
    // One-off events this week
    { id: sid(), churchId: 'saint-maclou', type: 'Wedding', start: 15, end: 16.5, date: d(3) },
    { id: sid(), churchId: 'saint-godard', type: 'Funeral', start: 10, end: 11, date: d(2) },
    { id: sid(), churchId: 'sahurs', type: 'Funeral', start: 14.5, end: 15.5, date: d(1) },
    { id: sid(), churchId: 'boscherville', type: 'Wedding', start: 14, end: 15.5, date: d(5) },
  )

  const base = { useOrgan: false, createdAt: now, code: '', signature: undefined }
  const bookings: Booking[] = [
    {
      ...base, id: 'bk-1', churchId: 'saint-godard', date: d(-6), start: 19, end: 21,
      ensemble: 'Choir', ensembleName: 'Rouen Amateur Voices', musicians: 32, repertoire: 'Sacred choral',
      status: 'Confirmed', byMe: false, price: 60, code: randomCode(),
      review: { rating: 5, author: 'Rouen Amateur Voices', text: 'The vaults carry every voice. After years in a school gym, our choir finally heard itself.' },
    },
    {
      ...base, id: 'bk-2', churchId: 'saint-ouen', date: d(-4), start: 14, end: 16,
      ensemble: 'Chamber ensemble', ensembleName: 'Seine Valley Brass Quintet', musicians: 5, repertoire: 'Classical',
      status: 'Confirmed', byMe: false, price: 90, code: randomCode(),
      review: { rating: 4, author: 'Seine Valley Brass Quintet', text: 'Huge, majestic sound. Bring warm clothes in November, it is cold inside.' },
    },
    {
      ...base, id: 'bk-3', churchId: 'sahurs', date: d(-2), start: 18, end: 20,
      ensemble: 'Jazz band', ensembleName: 'My ensemble', musicians: 4, repertoire: 'Jazz',
      status: 'Confirmed', byMe: true, price: 36, code: randomCode(),
    },
    {
      ...base, id: 'bk-4', churchId: 'saint-maclou', date: d(2), start: 19, end: 21,
      ensemble: 'Choir', ensembleName: 'Conservatoire Youth Choir', musicians: 40, repertoire: 'Early music',
      status: 'Confirmed', byMe: false, price: 70, code: randomCode(),
    },
    {
      ...base, id: 'bk-5', churchId: 'saint-patrice', date: d(1), start: 18, end: 20,
      ensemble: 'Choir', ensembleName: 'Gospel Normandie', musicians: 25, repertoire: 'Gospel',
      status: 'Pending', byMe: false, price: 50, code: randomCode(),
    },
    {
      ...base, id: 'bk-6', churchId: 'saint-godard', date: d(4), start: 10, end: 12,
      ensemble: 'Chamber ensemble', ensembleName: 'My ensemble', musicians: 6, repertoire: 'Chamber music',
      status: 'Confirmed', byMe: true, price: 60, code: randomCode(),
    },
    {
      ...base, id: 'bk-7', churchId: 'saint-ouen', date: d(-9), start: 15, end: 17,
      ensemble: 'Solo musician', ensembleName: 'Organ student', musicians: 1, repertoire: 'Organ recital',
      status: 'Confirmed', byMe: false, price: 90, code: randomCode(),
      review: { rating: 5, author: 'Organ student, Rouen conservatoire', text: 'Two hours alone with this instrument. Unforgettable.' },
    },
  ]

  const goals: Record<string, [string, number]> = {
    'saint-ouen': ['North transept stonework', 40000],
    'saint-maclou': ['Spire lighting', 12000],
    'jeanne-d-arc': ['Stained glass cleaning', 8000],
    'saint-godard': ['Roof repair', 15000],
    'saint-patrice': ['Roof repair', 15000],
    'saint-vivien': ['Bell tower safety', 10000],
    'saint-romain': ['Heating upgrade', 9000],
    'saint-gervais': ['Crypt lighting', 7000],
    bonsecours: ['Painted ceiling restoration', 20000],
    'saint-martin-du-vivier': ['Roof repair', 15000],
    sahurs: ['Roof repair', 15000],
    boscherville: ['Organ restoration', 25000],
  }
  const funds: Record<string, Fund> = {}
  for (const [id, [goal, target]] of Object.entries(goals)) {
    const raised = Math.round(target * (0.45 + ((id.length * 7) % 20) / 100))
    funds[id] = { goal, target, raised, lastSeen: raised, hoursBase: 40 + (id.length * 13) % 90, revenueBase: 0 }
    funds[id].revenueBase = funds[id].hoursBase * (CHURCHES.find((c) => c.id === id)?.pricePerHour ?? 20)
  }

  return {
    version: STATE_VERSION,
    role: null,
    churches: structuredClone(CHURCHES),
    services,
    bookings,
    funds,
    parishChurchId: 'saint-godard',
    demoOffset: 0,
  }
}
