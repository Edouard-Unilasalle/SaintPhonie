import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './store'
import { Layout } from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import ChurchPage from './pages/ChurchPage'
import BookingPage from './pages/BookingPage'
import AccessPage from './pages/AccessPage'
import MyBookings from './pages/MyBookings'
import Parish from './pages/Parish'
import Settings from './pages/Settings'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route element={<Layout />}>
            <Route path="/search" element={<Search />} />
            <Route path="/church/:id" element={<ChurchPage />} />
            <Route path="/church/:id/book" element={<BookingPage />} />
            <Route path="/access/:id" element={<AccessPage />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/parish" element={<Parish />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
