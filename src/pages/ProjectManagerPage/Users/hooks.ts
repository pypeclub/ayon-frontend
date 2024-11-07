import { $Any } from "@types"
import { api } from '@api/rest/project'
import { useState } from "react"
import { useUpdateProjectUsersMutation } from "@queries/project/updateProject"
import { useDispatch } from "react-redux"

const useProjectAccessGroupData = () => {

  const udpateApiCache = (project: string, user: string, accessGroups: string[]) => {
    dispatch(
      // @ts-ignore
      api.util.updateQueryData(
        'getProjectUsers',
        { projectName: project},
        (draft: $Any) => {
          draft[user] = accessGroups
        },
      ),
    )
  }

  const dispatch = useDispatch()
  const [updateUser] = useUpdateProjectUsersMutation()

  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [projectUsers, setProjectUsers] = useState<$Any>({})

  const result = api.useGetProjectUsersQuery({ projectName: selectedProjects[0] || '_' })
  const users = result.data


  const accessGroupUsers: $Any = {}
  const removeUserAccessGroup = (user: string, accessGroup: string) => {
    setProjectUsers({})
    const updatedAccessGroups = users![user].filter((item: string) => item !== accessGroup)
    updateUser({
      projectName: selectedProjects,
      userName: user,
      update: updatedAccessGroups,
    })
    udpateApiCache(selectedProjects[0], user, updatedAccessGroups)
  }
  const updateUserAccessGroups = async (users: $Any, changes: $Any ): Promise<string | void> => {
    for (const user of users) {
      const accessGroups = changes.filter((ag: $Any) => ag.selected).map((ag: $Any) => ag.name)

      try {
        await updateUser({
          projectName: selectedProjects[0],
          userName: user,
          update: accessGroups,
        }).unwrap()
        udpateApiCache(selectedProjects[0], user, accessGroups)
      } catch (error: $Any) {
        console.log(error)
        return(error.details)
      }
    }
  }

  return { users, projectUsers, accessGroupUsers, selectedProjects, setSelectedProjects, removeUserAccessGroup, updateUserAccessGroups }
}

export { useProjectAccessGroupData }
