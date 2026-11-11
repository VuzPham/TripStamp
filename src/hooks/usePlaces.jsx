import { createContext, useContext, useMemo } from 'react'
import { fetchPlaces, fetchCategories } from '@/services/placeService'
import { useAsync } from './useAsync'

const PlacesContext = createContext(null)

/** Tải địa điểm + danh mục một lần và chia sẻ cho toàn app. */
export function PlacesProvider({ children }) {
  const places = useAsync(fetchPlaces, [])
  const categories = useAsync(fetchCategories, [])
  const value = useMemo(
    () => ({
      places: places.data ?? [],
      categories: categories.data ?? [],
      loading: places.loading || categories.loading,
      error: places.error || categories.error,
      reload: () => {
        places.reload()
        categories.reload()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [places.data, places.loading, places.error, categories.data, categories.loading, categories.error],
  )
  return <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
}

export function usePlaces() {
  const ctx = useContext(PlacesContext)
  if (!ctx) throw new Error('usePlaces phải được dùng bên trong <PlacesProvider>')
  return ctx
}
