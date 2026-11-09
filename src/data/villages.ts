import type { ArtVariant, Church, Style } from '../types'

/*
 * Village churches across the Métropole Rouen Normandie.
 * Name, address, coordinates, OSM id and "listed historic monument" status come from
 * OpenStreetMap (Overpass and Nominatim, November 2026). Everything else is fictional demo data.
 */

const OPEN: Style[] = ['Sacred choral', 'Early music', 'Classical', 'Chamber music', 'Jazz', 'Folk', 'Gospel']
const CALM: Style[] = ['Sacred choral', 'Early music', 'Classical', 'Chamber music', 'Organ recital']

interface V {
  id: string
  name: string
  road: string
  postcode: string
  town: string
  lat: number
  lon: number
  osmWay: number
  listed: boolean
  art?: ArtVariant
  reverb: number
  capacity: number
  price: number
  piano?: boolean
  organ?: boolean
  heating?: boolean
  styles?: Style[]
  note: string
}

const v = (x: V): Church => ({
  id: x.id,
  name: x.name,
  address: `${x.road}, ${x.postcode} ${x.town}`,
  town: x.town,
  lat: x.lat,
  lon: x.lon,
  osmWay: x.osmWay,
  village: true,
  available: true,
  art: x.art ?? 'village',
  reverb: x.reverb,
  volume: Math.round((x.capacity * 22 * x.reverb) / 100) * 10,
  capacity: x.capacity,
  piano: x.piano ?? false,
  organ: x.organ ?? true,
  heating: x.heating ?? false,
  pricePerHour: x.price,
  history: `${x.note}${x.listed ? ' Listed as a historic monument.' : ''}`,
  rules: {
    allowedStyles: x.styles ?? OPEN,
    organ: 'Organ use on request, with the agreement of the parish organist.',
    maxVolume: x.styles === CALM ? 'Acoustic instruments only, about 85 dB maximum' : 'Light amplification allowed, about 90 dB maximum',
    amplification: x.styles !== CALM,
    hours: [9, 21],
  },
})

export const VILLAGES: Church[] = [
  v({
    id: 'jumieges', name: 'Église Saint-Valentin', road: 'Rue du Quesney', postcode: '76480', town: 'Jumièges',
    lat: 49.4346993, lon: 0.8218474, osmWay: 71109334, listed: true, art: 'romanesque',
    reverb: 3.4, capacity: 250, price: 22, styles: CALM,
    note: 'The parish church of Jumièges, a short walk from the famous abbey ruins, in a loop of the Seine.',
  }),
  v({
    id: 'saint-pierre-de-manneville', name: 'Église Saint-Pierre', road: "Place de l'Église", postcode: '76113', town: 'Saint-Pierre-de-Manneville',
    lat: 49.3924645, lon: 0.9311343, osmWay: 246765801, listed: true,
    reverb: 2.6, capacity: 140, price: 18, heating: true,
    note: 'A village church in a meander of the Seine, between orchards and the river.',
  }),
  v({
    id: 'moulineaux', name: 'Église Saint-Jacques le Majeur', road: 'Rue du Lieutenant Jacques Hergault', postcode: '76530', town: 'Moulineaux',
    lat: 49.3416645, lon: 0.965693, osmWay: 180859670, listed: true, art: 'spire',
    reverb: 3.1, capacity: 180, price: 20, styles: CALM,
    note: 'A village church on the slopes above the Seine, south-west of Rouen.',
  }),
  v({
    id: 'orival', name: 'Église Saint-Georges', road: "Côte de l'Église", postcode: '76500', town: 'Orival',
    lat: 49.305738, lon: 0.9925424, osmWay: 180738147, listed: true, art: 'romanesque',
    reverb: 2.9, capacity: 120, price: 18, styles: CALM,
    note: 'A church set against the chalk cliffs of the Seine valley, near Elbeuf.',
  }),
  v({
    id: 'freneuse', name: 'Église Notre-Dame', road: "Chemin de l'Église", postcode: '76410', town: 'Freneuse',
    lat: 49.3139375, lon: 1.0809532, osmWay: 182273206, listed: true,
    reverb: 2.4, capacity: 130, price: 16, piano: true,
    note: 'A village church on the right bank of the Seine, south of the Rouen area.',
  }),
  v({
    id: 'la-neuville-chant-d-oisel', name: 'Église Notre-Dame', road: "Rue de l'Église", postcode: '76520', town: "La Neuville-Chant-d'Oisel",
    lat: 49.372361, lon: 1.2321096, osmWay: 40868388, listed: true, art: 'spire',
    reverb: 3.0, capacity: 200, price: 18, heating: true,
    note: 'A village church on the plateau east of Rouen, among fields and woods.',
  }),
  v({
    id: 'houppeville', name: "Église Notre-Dame-de-l'Assomption", road: 'Sente des Hêtres', postcode: '76770', town: 'Houppeville',
    lat: 49.507772, lon: 1.0786478, osmWay: 165413656, listed: true,
    reverb: 2.5, capacity: 150, price: 18, piano: true, heating: true,
    note: 'A village church on the wooded heights north of Rouen.',
  }),
  v({
    id: 'saint-paer', name: 'Église Saint-Paër', road: "Rue de l'Église", postcode: '76480', town: 'Saint-Paër',
    lat: 49.51631, lon: 0.8806688, osmWay: 663012452, listed: false,
    reverb: 2.2, capacity: 110, price: 15, organ: false, piano: true,
    note: 'A small rural church in the Austreberthe valley, west of the Métropole.',
  }),
  v({
    id: 'henouville', name: 'Église Saint-Michel', road: "Rue de l'Église", postcode: '76840', town: 'Hénouville',
    lat: 49.4805882, lon: 0.9541333, osmWay: 461379551, listed: false,
    reverb: 2.3, capacity: 120, price: 15, heating: true,
    note: 'A village church on the plateau above the Seine loops, between Rouen and Duclair.',
  }),
  v({
    id: 'montmain', name: 'Église Saint-Nicolas', road: 'Route de Lyons-la-Forêt', postcode: '76520', town: 'Montmain',
    lat: 49.4097245, lon: 1.2386824, osmWay: 249260849, listed: false,
    reverb: 2.0, capacity: 90, price: 15, organ: false, piano: true, heating: true,
    note: 'A small village church at the eastern edge of the Métropole.',
  }),
  v({
    id: 'sainte-marguerite-sur-duclair', name: 'Église Sainte-Marguerite', road: "Place de l'Église", postcode: '76480', town: 'Sainte-Marguerite-sur-Duclair',
    lat: 49.5093093, lon: 0.8421758, osmWay: 461721468, listed: false,
    reverb: 2.4, capacity: 120, price: 15,
    note: 'A village church in the countryside north of Duclair.',
  }),
]
