'use client'

import { createContext, useContext, useState } from 'react'

interface HistoryContextType {
  refreshKey: number
  refreshHistory: () => void
  remixImage: (imageDetails: Record<string, any>) => void
  remixedImage: Record<string, any> | null
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [remixedImage, setRemixedImage] = useState<Record<string, any> | null>(null)

  const refreshHistory = () => {
    setRefreshKey(prev => prev + 1)
  }

  const remixImage = (imageDetails: Record<string, any>) => {
    setRemixedImage(imageDetails)
  }

  return (
    <HistoryContext.Provider value={{ refreshKey, refreshHistory, remixImage, remixedImage }}>
      {children}
    </HistoryContext.Provider>
  )
}

export function useHistory() {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider')
  }
  return context
} 