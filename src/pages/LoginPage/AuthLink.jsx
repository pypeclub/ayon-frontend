import React from 'react'
import PropTypes from 'prop-types'
import OAuth2ProviderIcon from '/src/components/oauthIcons'
import { upperFirst } from 'lodash'
import { Button } from 'ayon-react-components-test'

const AuthLink = ({ url, name }) => {
  const colours = {
    discord: '#5765F2',
    slack: '#4A154B',
    google: '#D34836',
  }

  return (
    <a href={url} key={name} title={name}>
      <Button
        style={{
          maxHeight: 'none',
          backgroundColor: colours[name] ? colours[name] : 'initial',
        }}
        label={
          <>
            <OAuth2ProviderIcon name={name} />
            <h2>{'Login With ' + upperFirst(name)}</h2>
          </>
        }
      />
    </a>
  )
}

AuthLink.propTypes = {
  url: PropTypes.string,
  name: PropTypes.string,
}

export default AuthLink
