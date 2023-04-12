import { useRef, useMemo, useState } from 'react'
import { Button } from 'ayon-react-components-test'
import { Menu } from 'primereact/menu'

const VersionList = (row, onSelectVersion) => {
  const menu = useRef(null)
  const [currentVersion, setCurrentVersion] = useState(null)

  const versions = useMemo(() => {
    if (!row.versionList) return []
    return row.versionList.map((version) => {
      if (version.id === row.versionId) setCurrentVersion(version.name)
      return {
        id: version.id,
        label: version.name,
        command: () => onSelectVersion(row.id, version.id),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.versionList, row.versionId, row.id, menu])

  return (
    <>
      <Menu model={versions} popup ref={menu} />
      <Button label={currentVersion} link onClick={(e) => menu.current.toggle(e)} />
    </>
  )
}

export default VersionList
