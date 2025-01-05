'use client'

import { createContext, useContext, useState } from 'react'

interface HistoryContextType {
  refreshKey: number
  refreshHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const refreshHistory = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <HistoryContext.Provider value={{ refreshKey, refreshHistory }}>
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