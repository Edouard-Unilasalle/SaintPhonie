import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import type { Church } from '../types'

const icon = (cls: string) =>
  L.divIcon({ className: '', html: `<div class="pin ${cls}"></div>`, iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22] })

function FitAll({ churches }: { churches: Church[] }) {
  const map = useMap()
  useEffect(() => {
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds(churches.map((c) => [c.lat, c.lon])), { padding: [24, 24] })
    }
    fit()
    // The container may still be sizing on first paint (mobile, tabs): fit again.
    const t = setTimeout(fit, 250)
    return () => clearTimeout(t)
    // Fit once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  return null
}

export function ChurchMap({ churches, matches, className = '' }: { churches: Church[]; matches: Set<string>; className?: string }) {
  return (
    <MapContainer center={[49.443, 1.095]} zoom={12} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitAll churches={churches} />
      {churches.map((c) => {
        const cls = !c.available ? 'pin-off' : `${c.village ? 'pin-village' : 'pin-on'} ${matches.has(c.id) ? '' : 'pin-dim'}`
        return (
          <Marker key={c.id} position={[c.lat, c.lon]} icon={icon(cls)} zIndexOffset={matches.has(c.id) ? 1000 : 0}>
            <Popup>
              <div className="min-w-44">
                <p className="font-serif font-semibold text-base m-0">{c.name}</p>
                <p className="text-xs text-muted m-0">{c.town}</p>
                {c.available ? (
                  <>
                    <p className="text-sm my-1">
                      Reverberation <b>{c.reverb.toFixed(1)} s</b> · {c.capacity} people · €{c.pricePerHour}/h
                    </p>
                    {!matches.has(c.id) && <p className="text-xs text-warn m-0">Does not match your filters</p>}
                    <Link to={`/church/${c.id}`} className="inline-block mt-1 font-semibold text-glass">
                      Open profile →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm my-1">
                    <b>Not available on the platform.</b> {c.unavailableReason}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
