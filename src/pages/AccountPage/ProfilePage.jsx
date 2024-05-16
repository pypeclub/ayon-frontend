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
} from '@ynput/ayon-react-components'
import { useUpdateUserMutation } from '../../services/user/updateUser'
import Avatar from '../../components/Avatar/Avatar'
import styled, { css } from 'styled-components'
import UserAttribForm from '../SettingsPage/UsersSettings/UserAttribForm'
import SetPasswordDialog from '../SettingsPage/UsersSettings/SetPasswordDialog'
import ayonClient from '../../ayon'
import Type from '/src/theme/typography.module.css'
import { updateUserAttribs } from '../../features/user'
import { useDispatch } from 'react-redux'

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
  > span {
    position: relative;
    ${({ $hasData }) =>
      !$hasData &&
      css`
        color: transparent;
        border-radius: var(--border-radius-m);
        ${getShimmerStyles()}
      `}
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

      toast.success('Profile updated')

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

  return (
    <main>
      <Section style={{ paddingTop: 16 }}>
        <FormsStyled>
          <Avatar user={user} />
          <AvatarName $hasData={!!userName}>
            <span className={Type.headlineMedium}>{userName ? userName : 'User FullName'}</span>
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
            <SaveButton
              onClick={onSave}
              label="Save profile"
              active={changesMade}
              saving={isUpdatingUser}
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
