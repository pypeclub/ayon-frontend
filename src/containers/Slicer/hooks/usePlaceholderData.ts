import { useEffect } from 'react'
import { TableRow } from '../SlicerTable'

interface UsePlaceholderDataProps<T> {
  isLoading: boolean
  data: TableRow[]
  placeholderCount?: number
  setTableData: (data: TableRow[]) => void
}

const usePlaceholderData = <T>({
  isLoading,
  data,
  placeholderCount = 10,
  setTableData,
}: UsePlaceholderDataProps<T>) => {
  useEffect(() => {
    if (!isLoading) return

    if (data?.length) {
      // do nothing if data is already loaded
      return
    }

    // show loading placeholders
    const placeholders: TableRow[] = Array.from({ length: placeholderCount }, (_, i) => ({
      id: `placeholder-${i}`,
      name: `placeholder-${i}`,
      label: `placeholder-${i}`,
      icon: null,
      img: null,
      subRows: [],
    }))

    setTableData(placeholders)
  }, [isLoading, data, placeholderCount])
}

export default usePlaceholderData
