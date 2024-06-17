import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  FormRow,
  Section,
  Panel,
  LockedInput,
  SaveButton,
  InputText,
  getShimmerStyles,
  InputSwitch,
  theme,
} from '@ynput/ayon-react-components'
import {
  useUpdateUserMutation,
  useUpdateUserPreferencesMutation,
} from '../../services/user/updateUser'
import Avatar from '../../components/Avatar/Avatar'
import styled, { css } from 'styled-components'
import UserAttribForm from '../SettingsPage/UsersSettings/UserAttribForm'
import SetPasswordDialog from '../SettingsPage/UsersSettings/SetPasswordDialog'
import ayonClient from '../../ayon'
import { updateUserAttribs, updateUserPreferences } from '../../features/user'
import { useDispatch } from 'react-redux'
import { useNotifications } from '/src/context/notificationsContext'

const FormsStyled = styled.section`
  flex: 1;
  overflow-x: clip;
  overflow-y: auto;
  gap: var(--base-gap-small);
  display: flex;
  flex-direction: column;
  max-width: 600px;

  & > *:last-child {
    /* flex: 1; */
  }

  .label {
    min-width: 170px;
  }
`

export const PanelButtonsStyled = styled(Panel)`
  flex-direction: row;

  & > * {
    flex: 1;
  }
`
export const AvatarName = styled.span`
  display: flex;
  align-content: center;
  justify-content: center;
  align-items: center;
  padding: 16px 16px 8px 16px;
  .name {
    position: relative;
    ${({ $hasData }) =>
      !$hasData &&
      css`
        color: transparent;
        border-radius: var(--border-radius-m);
        ${getShimmerStyles()}
      `}

    ${theme.headlineMedium}
  }
`

const ProfilePage = ({ user = {}, isLoading }) => {
  const dispatch = useDispatch()
  const attributes = ayonClient.getAttribsByScope('user')
  const [showSetPassword, setShowSetPassword] = useState(false)

  // UPDATE USER DATA
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation()

  // build initial form data
  const initialFormData = {}
  attributes.forEach((attrib) => {
    initialFormData[attrib.name] = ''
  })

  const [name, setName] = useState('')
  const [password] = useState('randompasswor')
  const [initData, setInitData] = useState(initialFormData)
  const [formData, setFormData] = useState(initialFormData)
  const [changesMade, setChangesMade] = useState(false)
  const userName = user?.attrib?.fullName || user?.name

  // once user data is loaded, set form data
  useEffect(() => {
    if (user && !isLoading) {
      const { attrib } = user

      const newFormData = {}
      attributes.forEach((att) => {
        newFormData[att.name] = attrib[att.name] || ''
      })

      setFormData(newFormData)
      // used to reset form
      setInitData(newFormData)

      // // set name
      setName(user.name)
    }

    return () => {
      // reset forms
      setFormData(initialFormData)
      setName('')
    }
  }, [isLoading, user])

  // look for changes when formData changes
  useEffect(() => {
    const isDiff = JSON.stringify(formData) !== JSON.stringify(initData)

    if (isDiff) {
      if (!changesMade) setChangesMade(true)
    } else {
      setChangesMade(false)
    }
  }, [formData, initData])

  const onSave = async () => {
    const attrib = {
      ...user.attrib,
      ...formData,
      developerMode: !!user.attrib.developerMode,
    }

    try {
      await updateUser({
        name: user.name,
        patch: {
          attrib,
        },
      }).unwrap()

      // update redux state with new data
      dispatch(updateUserAttribs(formData))
      // reset form
      setInitData(formData)
      setChangesMade(false)
    } catch (error) {
      console.log(error)
      toast.error('Unable to update profile')
      toast.error(error.details)
    }
  }

  // USER PREFERENCES
  const [updatePreferences, { isLoading: isUpdatingPreferences }] =
    useUpdateUserPreferencesMutation()

  const initPreferences = { notifications: false, notificationSound: false }
  const [initPreferencesData, setInitPreferencesData] = useState(initPreferences)
  const [preferencesData, setPreferencesData] = useState(initPreferences)
  const [preferenceChanges, setPreferenceChanges] = useState(false)

  // once user data is loaded, set form data
  useEffect(() => {
    if (user && !isLoading) {
      const { data = {} } = user

      const newPreferencesData = {
        notifications: data.frontendPreferences?.notifications,
        notificationSound: data.frontendPreferences?.notificationSound,
      }

      setPreferencesData(newPreferencesData)
      // used to reset form and detect changes
      setInitPreferencesData(newPreferencesData)
    }

    return () => {
      // reset forms
      setInitPreferencesData(initPreferences)
      setPreferencesData(initPreferences)
    }
  }, [isLoading, user])

  // look for changes when preferencesData changes
  useEffect(() => {
    const isDiff = JSON.stringify(preferencesData) !== JSON.stringify(initPreferencesData)

    if (isDiff) {
      if (!preferenceChanges) setPreferenceChanges(true)
    } else {
      setPreferenceChanges(false)
    }
  }, [preferencesData, initPreferencesData])

  const { sendNotification } = useNotifications()

  const onSavePreferences = async () => {
    setPreferenceChanges(false)
    try {
      await updatePreferences({
        name: user.name,
        preferences: preferencesData,
      }).unwrap()

      dispatch(updateUserPreferences(preferencesData))
      // reset form
      setInitPreferencesData(preferencesData)

      // if the user has enabled notifications for the first time, ask for permission
      if (preferencesData.notifications && Notification.permission !== 'granted') {
        sendNotification({ title: 'Notifications already enabled 💪', link: '/account/profile' })
      }
    } catch (error) {
      console.error(error)
      toast.error('Unable to update preferences')
    }
  }

  const handleChangePreferences = (e) => {
    const { id, checked } = e.target

    setPreferencesData({
      ...preferencesData,
      [id]: checked,
    })
  }

  const handleSaveAll = async () => {
    if (changesMade) await onSave()
    if (preferenceChanges) await onSavePreferences()

    // success toast
    toast.success('Profile updated')
  }

  const notificationsDisabled =
    window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' // disable if not on HTTPS or localhost
  const notificationsTooltip = notificationsDisabled
    ? 'Browser notifications only work over HTTPS'
    : 'Get notifications on your device'

  return (
    <main>
      <Section style={{ paddingTop: 16 }}>
        <FormsStyled>
          <Avatar user={user} />
          <AvatarName $hasData={!!userName}>
            {' '}
            <span className="name">{userName ? userName : 'User FullName'}</span>
          </AvatarName>
          <Panel style={{ background: 'none' }}>
            <FormRow label="Username" key="Username">
              <InputText value={name} disabled />
            </FormRow>
            <UserAttribForm
              formData={formData}
              setFormData={setFormData}
              attributes={attributes}
              showAvatarUrl={false}
            />
            <FormRow label="Password" key="Password">
              <LockedInput
                label="Password"
                value={password}
                type="password"
                onEdit={() => setShowSetPassword(true)}
              />
            </FormRow>

            <FormRow label="Desktop Notifications" key="notifications">
              <div data-tooltip={notificationsTooltip} style={{ width: 'fit-content' }}>
                <InputSwitch
                  checked={preferencesData.notifications}
                  id={'notifications'}
                  onChange={handleChangePreferences}
                  disabled={isUpdatingPreferences || isLoading || notificationsDisabled}
                />
              </div>
            </FormRow>

            <FormRow label="Notification Sound" key="notificationSound">
              <div
                data-tooltip="Get a little chime sound on new important notifications"
                style={{ width: 'fit-content' }}
              >
                <InputSwitch
                  checked={preferencesData.notificationSound}
                  id={'notificationSound'}
                  onChange={handleChangePreferences}
                  disabled={isUpdatingPreferences || isLoading}
                />
              </div>
            </FormRow>

            <SaveButton
              onClick={handleSaveAll}
              label="Save profile"
              active={changesMade || preferenceChanges}
              saving={isUpdatingUser || isUpdatingPreferences}
              style={{ padding: '6px 18px', marginLeft: 'auto' }}
            />
          </Panel>
        </FormsStyled>
      </Section>
      {showSetPassword && (
        <SetPasswordDialog
          selectedUsers={[user?.name]}
          onHide={() => {
            setShowSetPassword(false)
          }}
          disabled={isLoading}
        />
      )}
    </main>
  )
}

export default ProfilePage
