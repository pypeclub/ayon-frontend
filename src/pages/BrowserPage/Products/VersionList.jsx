import { useRef, useMemo, useState } from 'react'
import { Button } from '@ynput/ayon-react-components'
import { Menu } from 'primereact/menu'

const VersionList = (row, onSelectVersion, selectedVersions) => {
  const menu = useRef(null)
  const [currentVersion, setCurrentVersion] = useState(null)

  const versions = useMemo(() => {
    if (!row.versionList) return []
    const versions = row.versionList.map((version) => {
      if (version.id === row.versionId) setCurrentVersion(version.name)
      return {
        id: version.id,
        label: version.name,
        command: () =>
          onSelectVersion({
            productId: row.id,
            versionId: version.id,
            folderId: row.folderId,
            versionName: version.name,
            currentSelected: selectedVersions,
          }),
      }
    })

    // sort versions by name
    versions.sort((a, b) => {
      if (b.label < a.label) return -1
      if (b.label > a.label) return 1
      return 0
    })

    return versions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.versionList, row.versionId, row.id, menu, selectedVersions])

  return (
    <>
      <Menu model={versions} popup ref={menu} />
      <Button variant="text" label={currentVersion} onClick={(e) => menu.current.toggle(e)} />
    </>
  )
}

export default VersionList