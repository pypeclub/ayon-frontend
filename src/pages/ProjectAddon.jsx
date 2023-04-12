import { useRef, useMemo, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Section, Button } from 'ayon-react-components-test'
import { Dialog } from 'primereact/dialog'
import styled from 'styled-components'

import Hierarchy from '/src/containers/hierarchy'
import TaskList from '/src/containers/taskList'

const AddonWrapper = styled.iframe`
  flex-grow: 1;
  background: 'transparent';
  border: 0;
  overflow: auto;
`

const TaskPicker = ({ callback, multiple }) => {
  const focusedTasks = useSelector((state) => state.context.focused.tasks)

  const errorMessage = useMemo(() => {
    if (multiple && !focusedTasks.length) return 'Please select at least one task'
    if (!multiple && focusedTasks.length !== 1) return 'Please select exactly one task'
  }, [focusedTasks])

  const footer = useMemo(() => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: 'red' }}>{errorMessage}</span>
        <Button
          label="Select"
          icon="library_add_check"
          disabled={!focusedTasks.length}
          onClick={() => callback(multiple ? focusedTasks : focusedTasks[0])}
        />
      </div>
    )
  }, [errorMessage, focusedTasks])

  return (
    <Dialog header="Select task" footer={footer} visible={true} onHide={() => callback(null)}>
      <div style={{ display: 'flex', flexDirection: 'row', minHeight: 500, gap: 12 }}>
        <Hierarchy style={{ flex: 1, minWidth: 250, maxWidth: 500 }} />
        <TaskList style={{ flex: 0.75, minWidth: 250, maxWidth: 500 }} />
      </div>
    </Dialog>
  )
}

const RequestModal = ({ onClose, callback = () => {}, requestType = null, ...props }) => {
  if (!requestType) return <></>

  const onSubmit = (value) => {
    callback(value)
    onClose()
  }

  if (requestType === 'taskPicker') {
    return <TaskPicker {...props} callback={onSubmit} />
  }
}

const ProjectAddon = ({ addonName, addonVersion, sidebar }) => {
  const addonRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [requestModal, setRequestModal] = useState(false)

  const context = useSelector((state) => state.context)
  const projectName = useSelector((state) => state.project.name)
  const focusedFolders = context.focused.folders
  const addonUrl = `${window.location.origin}/addons/${addonName}/${addonVersion}/frontend/`

  // Modals are used to display unified interface for
  // picking entities and other tasks from the addon

  const modalRequest = (requestType, callback) => {
    setRequestModal({ callback, requestType })
  }

  useEffect(() => {
    window.modalRequest = modalRequest
    return () => (window.modalRequest = undefined)
  }, [])

  // Push context to addon
  // This is done on every context change.
  // Context contains information on the current project, focused folders, logged in user etc.

  const pushContext = () => {
    const addonWnd = addonRef.current.contentWindow
    addonWnd.postMessage({
      scope: 'project',
      accessToken: localStorage.getItem('accessToken'),
      context: {
        ...context,
        projectName,
      },
      projectName,
      addonName,
      addonVersion,
    })
  }

  // Push context on addon load and on every context change

  useEffect(() => {
    if (loading) return
    pushContext()
  }, [focusedFolders])

  // Render sidebar
  // Each addon may have a sidebar component that is rendered on the left side of the screen
  // Sidebars are built-in and whether they are displayed or not is controlled by the addon

  const sidebarComponent = useMemo(() => {
    if (sidebar === 'hierarchy') {
      return <Hierarchy style={{ maxWidth: 500, minWidth: 300 }} />
    } else {
      return <></>
    }
  }, [sidebar])

  const onAddonLoad = () => {
    setLoading(false)
    pushContext()
  }

  return (
    <main>
      {sidebarComponent}
      <Section>
        <RequestModal {...requestModal} onClose={() => setRequestModal(null)} />
        <AddonWrapper src={addonUrl} ref={addonRef} onLoad={onAddonLoad} />
      </Section>
    </main>
  )
}

export default ProjectAddon
