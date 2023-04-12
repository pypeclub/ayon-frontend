import { useNavigate } from 'react-router-dom'
import { Button } from 'ayon-react-components-test'

import { Sidebar } from 'primereact/sidebar'
import ProjectList from '/src/containers/projectList'
import { useDispatch, useSelector } from 'react-redux'
import { selectProject } from '/src/features/project'
import { selectProject as selectProjectContext } from '/src/features/context'

const ProjectMenu = ({ visible, onHide }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const projectName = useSelector((state) => state.project.name)

  const onProjectSelect = (projectName) => {
    console.log('row clicked: ', projectName)

    onHide()

    // if already on project page, do not navigate
    if (window.location.pathname.includes(projectName)) return

    // reset selected folders
    dispatch(selectProject(projectName))
    // reset context for projects
    dispatch(selectProjectContext(projectName))

    navigate(`/projects/${projectName}/browser`)
  }

  const footer = (
    <Button
      icon="settings_suggest"
      label="Manage Projects"
      style={{ marginTop: 10, width: '100%' }}
      onClick={() => navigate('/manageProjects')}
    />
  )

  return (
    <Sidebar position="left" visible={visible} onHide={onHide} icons={() => <h3>Project menu</h3>}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <ProjectList
          footer={footer}
          onRowClick={(e) => onProjectSelect(e.data.name)}
          selection={projectName}
        />
      </div>
    </Sidebar>
  )
}

export default ProjectMenu
