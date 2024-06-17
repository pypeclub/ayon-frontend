import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Section, TablePanel } from '@ynput/ayon-react-components'
import { CellWithIcon } from '@components/icons'
import { useDispatch, useSelector } from 'react-redux'
import { useGetWorkfileListQuery } from '../../services/getWorkfiles'
import NoEntityFound from '@components/NoEntityFound'
import { setFocusedWorkfiles } from '@state/context'

const WorkfileList = ({ style }) => {
  const dispatch = useDispatch()
  const taskIds = useSelector((state) => state.context.focused.tasks)
  const pairing = useSelector((state) => state.context.pairing)
  const projectName = useSelector((state) => state.project.name)
  const focusedWorkfiles = useSelector((state) => state.context.focused.workfiles)

  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useGetWorkfileListQuery({ projectName, taskIds }, { skip: !taskIds.length })

  if (isError) {
    console.error(error)
    return 'Error...'
  }

  const formatName = (rowData) => {
    let className = ''
    let i = 0

    for (const pair of pairing) {
      i++
      if (pair.taskId === rowData.taskId) {
        className = `row-hl-${i}`
        break
      }
    }

    return (
      <CellWithIcon
        icon="engineering"
        iconClassName={className}
        text={rowData.name}
        name={rowData.path}
      />
    )
  }

  const handleSelectionChange = (e) => {
    const value = e.value

    dispatch(setFocusedWorkfiles([value.id]))
  }

  // get selection using the first workfile id
  const selectedWorkfile = focusedWorkfiles && focusedWorkfiles[0]
  const selection = data.find((workfile) => workfile.id === selectedWorkfile)

  return (
    <Section style={style}>
      <TablePanel loading={isLoading}>
        {!taskIds.length || !data.length ? (
          <NoEntityFound type="workfile" />
        ) : (
          <DataTable
            scrollable="true"
            scrollHeight="flex"
            selectionMode="single"
            responsive="true"
            dataKey="id"
            value={taskIds.length ? data : []}
            selection={selection}
            onSelectionChange={handleSelectionChange}
          >
            <Column field="name" header="Name" body={formatName} />
          </DataTable>
        )}
      </TablePanel>
    </Section>
  )
}

export default WorkfileList
