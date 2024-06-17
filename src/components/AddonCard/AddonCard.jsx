import React from 'react'
import * as Styled from './AddonCard.styled'
import { Icon } from '@ynput/ayon-react-components'

const AddonCard = React.forwardRef(
  ({ name, icon = 'check_circle', isSelected, error, version, title, ...props }, ref) => {
    return (
      <Styled.AddonCard ref={ref} $selected={isSelected} $error={!!error} {...props}>
        <Icon icon={icon} />
        <span className={'title'}>{title || name}</span>
        {error && <span className="error">{error}</span>}
        {version && <span className="version">{version}</span>}
      </Styled.AddonCard>
    )
  },
)

AddonCard.displayName = 'AddonCard'

export default AddonCard
