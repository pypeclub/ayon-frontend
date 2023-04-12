import { useState, useMemo, useRef } from 'react'
import { toast } from 'react-toastify'
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog'
import { Button, Section, Toolbar, InputText } from 'ayon-react-components-test'
// Comps
import NewUserDialog from './newUserDialog'
import SetPasswordDialog from './SetPasswordDialog'
import RenameUserDialog from './RenameUserDialog'
// utils
import './users.scss'
import useSearchFilter from '/src/hooks/useSearchFilter'
import { useGetUsersQuery } from '../../../services/user/getUsers'
import { useGetRolesQuery } from '/src/services/getRoles'
import ProjectList from '/src/containers/projectList'
import UserDetail from './userDetail'
import UserList from './UserList'
import { useDeleteUserMutation } from '/src/services/user/updateUser'
import { Splitter, SplitterPanel } from 'primereact/splitter'
import { SelectButton } from 'primereact/selectbutton'
import { useSelector } from 'react-redux'
import UsersOverview from './UsersOverview'
import { ArrayParam, useQueryParam, withDefault } from 'use-query-params'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

// TODO: Remove classname assignments and do in styled components
const formatRoles = (rowData, selectedProjects) => {
  let res = {}
  if (rowData.isAdmin) res.admin = { cls: 'role admin' }
  else if (rowData.isService) res.service = { cls: 'role manager' }
  else if (rowData.isManager) res.manager = { cls: 'role manager' }
  else if (!selectedProjects) {
    for (const name of rowData.defaultRoles || []) res[name] = { cls: 'role default' }
  } else {
    const roleSet = rowData.roles
    for (const projectName of selectedProjects) {
      for (const roleName of roleSet[projectName] || []) {
        if (roleName in res) res[roleName].count += 1
        else res[roleName] = { count: 1 }
        res[roleName].cls =
          res[roleName].count === selectedProjects.length ? 'role all' : 'role partial'
      }
    }
  }

  return { ...rowData, roles: res, rolesList: Object.keys(res) }
}

const UsersSettings = () => {
  // QUERY PARAMS STATE
  const [searchParams] = useSearchParams()
  const queryNames = searchParams.getAll('name')
  const [selectedUsers, setSelectedUsers] = useQueryParam('name', withDefault(ArrayParam, []))

  const toastId = useRef(null)

  // set initial selected users
  useEffect(() => {
    if (queryNames.length) setSelectedUsers(queryNames)
  }, [])

  // USE STATE
  const [selectedProjects, setSelectedProjects] = useState(null)
  const [showNewUser, setShowNewUser] = useState(false)
  const [showRenameUser, setShowRenameUser] = useState(false)
  const [showSetPassword, setShowSetPassword] = useState(false)
  // show users for selected projects
  const [showProjectUsers, setShowProjectUsers] = useState(false)
  // last selected user state
  const [lastSelectedUser, setLastSelectedUser] = useState(null)

  // get user name from redux
  const selfName = useSelector((state) => state.user.name)
  const isAdmin = useSelector((state) => state.user.data.isAdmin)
  const isSelfSelected = selectedUsers.includes(selfName)

  // RTK QUERY HOOKS
  let { data: userList = [], isLoading, isError, isFetching } = useGetUsersQuery({ selfName })
  if (isError) toast.error('Unable to load users')

  const {
    data: rolesList = [],
    isLoading: isLoadingRoles,
    isError: isErrorRoles,
  } = useGetRolesQuery()
  if (isErrorRoles) toast.error('Unable to load roles')

  // MUTATION HOOK
  const [deleteUser] = useDeleteUserMutation()

  let filteredUserList = useMemo(() => {
    // filter out users that are not in project if showProjectUsers is true
    if (selectedProjects) {
      return userList.filter((user) => {
        // user level not user
        if (user.isManager || user.isAdmin || user.isService) return true

        // check user has role in selected projects
        const roleSet = user.roles
        let hasRole = selectedProjects.some((project) => roleSet[project]?.length)

        return hasRole
      })
    } else {
      return userList
    }
  }, [userList, selectedProjects])

  const onDelete = async () => {
    confirmDialog({
      message: `Are you sure you want to delete ${selectedUsers.length} user(s)?`,
      header: 'Delete users',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        toastId.current = toast.info('Deleting users...')
        let i = 0
        for (const user of selectedUsers) {
          try {
            await deleteUser({ user }).unwrap()
            toast.update(toastId.current, {
              render: `Deleted user: ${user}`,
              type: toast.TYPE.SUCCESS,
            })
            setSelectedUsers([])
            setLastSelectedUser(null)
            i += 1
          } catch {
            toast.error(`Unable to delete user: ${user}`)
          }
        }
        toast.update(toastId.current, { render: `Deleted ${i} user(s)`, type: toast.TYPE.SUCCESS })
      },
      reject: () => {},
    })
  }

  const onTotal = (total) => {
    // if total already in serch, remove it
    if (search === total) return setSearch('')

    // if "total" select all users
    // else set search to total
    if (total === 'total') {
      setSearch('')
      setSelectedUsers(filteredUserList.map((user) => user.name))
      if (selectedProjects) setShowProjectUsers(true)
    } else {
      setSearch(total)
    }
  }

  // use filteredUserList if showProjectUsers
  // else use userList

  if (showProjectUsers) userList = filteredUserList

  let userListWithRoles = useMemo(
    () => userList.map((user) => formatRoles(user, selectedProjects)),
    [userList, selectedProjects],
  )

  const searchableFields = ['name', 'attrib.fullName', 'attrib.email', 'rolesList', 'hasPassword']

  const [search, setSearch, filteredData] = useSearchFilter(
    searchableFields,
    userListWithRoles,
    'users',
  )

  const selectedUserList = userList.filter((user) => selectedUsers.includes(user.name))

  const levels = useMemo(() => {
    let levels = []
    selectedUserList.forEach((user) => {
      let res
      if (user.isAdmin) res = 'admin'
      else if (user.isService) res = 'service'
      else if (user.isManager) res = 'manager'
      else res = 'user'

      if (!levels.includes(res)) levels.push(res)
    })

    return levels
  }, [selectedUserList])

  // managers can't update admin users
  const managerDisabled = levels.some((l) => ['admin'].includes(l)) && !isAdmin && !isSelfSelected

  // Render

  // return null

  return (
    <main>
      <ConfirmDialog />
      <Section>
        <Toolbar>
          <Button onClick={() => setShowNewUser(true)} label="Add New User" icon="person_add" />
          <Button
            onClick={onDelete}
            label="Delete Users"
            icon="person_remove"
            disabled={!selectedUsers.length || isSelfSelected || managerDisabled}
          />
          <SelectButton
            value={showProjectUsers}
            options={[
              { label: 'All Users', value: false },
              { label: 'Selected Projects', value: true },
            ]}
            onChange={(e) => setShowProjectUsers(e.value)}
            disabled={!selectedProjects}
          />
          <InputText
            style={{ width: '200px' }}
            placeholder="Filter users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autocomplete="off"
          />
        </Toolbar>
        <Splitter
          style={{ width: '100%', height: '100%' }}
          layout="horizontal"
          stateKey="users-panels"
          stateStorage="local"
        >
          <SplitterPanel size={10}>
            <ProjectList
              showNull="( default )"
              multiselect={true}
              selection={selectedProjects}
              onSelect={setSelectedProjects}
              style={{ maxWidth: 'unset' }}
              className="wrap"
            />
          </SplitterPanel>
          <SplitterPanel size={50}>
            <UserList
              userList={userList}
              tableList={filteredData}
              onSelectUsers={setSelectedUsers}
              isFetching={isFetching}
              {...{
                setLastSelectedUser,
                selectedProjects,
                selectedUsers,
                rolesList,
                setShowSetPassword,
                setShowRenameUser,
                onDelete,
                isLoading,
                isLoadingRoles,
                isSelfSelected,
              }}
            />
          </SplitterPanel>
          <SplitterPanel size={40} style={{ minWidth: 370 }}>
            <UserDetail
              setShowRenameUser={setShowRenameUser}
              selectedUsers={selectedUsers}
              setShowSetPassword={setShowSetPassword}
              selectedProjects={selectedProjects}
              setSelectedUsers={setSelectedUsers}
              isSelfSelected={isSelfSelected}
              rolesList={rolesList}
              lastSelectedUser={lastSelectedUser}
              selectedUserList={selectedUserList}
              managerDisabled={managerDisabled}
            />
            {selectedUsers.length === 0 && (
              <UsersOverview
                selectedProjects={selectedProjects}
                userList={filteredUserList}
                onNewUser={() => setShowNewUser(true)}
                onUserSelect={(user) => setSelectedUsers([user.name])}
                onTotal={onTotal}
                search={search}
              />
            )}
          </SplitterPanel>
        </Splitter>
      </Section>

      {showNewUser && (
        <NewUserDialog
          rolesList={rolesList}
          onHide={(newUsers) => {
            setShowNewUser(false)
            if (newUsers.length) setSelectedUsers(newUsers)
          }}
        />
      )}

      {showRenameUser && (
        <RenameUserDialog
          selectedUsers={selectedUsers}
          onHide={() => setShowRenameUser(false)}
          onSuccess={(name) => setSelectedUsers([name])}
        />
      )}

      {showSetPassword && (
        <SetPasswordDialog
          selectedUsers={selectedUsers}
          onHide={() => {
            setShowSetPassword(false)
          }}
        />
      )}
    </main>
  )
}

export default UsersSettings
