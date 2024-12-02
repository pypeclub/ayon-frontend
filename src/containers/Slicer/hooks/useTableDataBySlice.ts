import { useAppSelector } from '@state/store'
import { useEffect, useState } from 'react'
import useHierarchyTable from './useHierarchyTable'
import useUsersTable from './useUsersTable'
import useProjectAnatomySlices from './useProjectAnatomySlices'
import { SliceType, useSlicerContext } from '@context/slicerContext'
import { Slice, SliceData, SliceOption, TableData, TableRow } from '../types'

interface Props {
  sliceFields: SliceType[]
}

const defaultSliceOptions: SliceOption[] = [
  {
    label: 'Hierarchy',
    value: 'hierarchy' as SliceType,
    icon: 'table_rows',
  },
  {
    label: 'Assignees',
    value: 'assignees' as SliceType,
    icon: 'person',
  },
  {
    label: 'Status',
    value: 'status' as SliceType,
    icon: 'arrow_circle_right',
  },
  {
    label: 'Type',
    value: 'type' as SliceType, // combination of folder and task types
    icon: 'folder',
  },
  {
    label: 'Task Type',
    value: 'taskType' as SliceType,
    icon: 'check_circle',
  },
]

const getNoValue = (field: string): TableRow => ({
  id: 'noValue',
  name: 'noValue',
  label: `No ${field}`,
  icon: 'unpublished',
  subRows: [],
  data: {
    id: 'noValue',
  },
})

const getSomeValue = (field: string): TableRow => ({
  id: 'hasValue',
  name: 'hasValue',
  label: `Some ${field}`,
  icon: 'check',
  subRows: [],
  data: {
    id: 'hasValue',
  },
})

const useTableDataBySlice = ({ sliceFields }: Props): TableData => {
  const { sliceType, onSliceTypeChange } = useSlicerContext()
  const projectName = useAppSelector((state) => state.project.name)

  const sliceOptions = defaultSliceOptions.filter(
    (option) => !sliceFields.length || sliceFields.includes(option.value),
  )

  const [isLoading, setIsLoading] = useState(false)

  // project info
  const {
    project,
    getStatuses,
    getTypes,
    getTaskTypes,
    isLoading: isLoadingProject,
  } = useProjectAnatomySlices({ projectName })

  //   Hierarchy
  const { getData: getHierarchyData, isLoading: isLoadingHierarchy } = useHierarchyTable({
    projectName: projectName || '',
    folderTypes: project?.folderTypes || [],
  })
  //   Users
  const { getData: getUsersData, isLoading: isUsersLoading } = useUsersTable({ projectName })

  const builtInSlices: Record<SliceType, SliceData> = {
    hierarchy: {
      getData: getHierarchyData,
      isLoading: isLoadingHierarchy,
      isExpandable: true,
    },
    assignees: {
      getData: getUsersData,
      isLoading: isUsersLoading,
      isExpandable: false,
      noValue: true,
      hasValue: true,
    },
    status: {
      getData: getStatuses,
      isLoading: isLoadingProject,
      isExpandable: false,
    },
    type: {
      getData: getTypes,
      isLoading: isLoadingProject,
      isExpandable: true,
    },
    taskType: {
      getData: getTaskTypes,
      isLoading: isLoadingProject,
      isExpandable: false,
    },
  }

  const initSlice = { data: [], isExpandable: false }
  const [slice, setSlice] = useState<Slice>(initSlice)
  const sliceConfig = builtInSlices[sliceType]

  useEffect(() => {
    // wait for hierarchy data to load before fetching slice data
    if (isLoadingHierarchy) return
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const newData = await sliceConfig.getData()

        // add some value option
        if (sliceConfig.hasValue) newData.unshift(getSomeValue(sliceType))

        // add no value option
        if (sliceConfig.noValue) newData.unshift(getNoValue(sliceType))
        setSlice({
          data: newData,
          isExpandable: sliceConfig.isExpandable,
        })
      } catch (error) {
        console.error('Error fetching slice data:', error)
        setSlice(initSlice)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [sliceType, projectName, isLoadingHierarchy])

  return {
    sliceOptions,
    table: slice,
    isLoading: builtInSlices[sliceType].isLoading || isLoading,
    sliceType,
    handleSliceTypeChange: onSliceTypeChange,
  }
}

export default useTableDataBySlice
