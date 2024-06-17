import { Panel, Section, theme } from '@ynput/ayon-react-components'
import React, { useState } from 'react'
import styled from 'styled-components'
import { classNames } from 'primereact/utils'
import YnputConnector from '/src/components/YnputCloud/YnputConnector'

const StyledSection = styled(Section)`
  height: 100%;
  flex: 0.5;
  min-width: 210px;
  max-width: 300px;
`

const StyledList = styled(Panel)`
  height: 100%;

  .item {
    display: flex;
    padding: 4px 8px;
    flex-direction: column;
    align-items: flex-start;
    user-select: none;
    gap: 10px;
    align-self: stretch;
    border-radius: var(--border-radius-m);
    cursor: pointer;
    &:hover {
      background-color: var(--md-sys-color-surface-container);
    }

    &.isSelected {
      background-color: var(--md-sys-color-primary-container);
      color: var(--md-sys-color-on-primary-container);
    }
  }

  .title {
    ${theme.titleMedium}
  }
`

const AddonFilters = ({ onSelect, onConnection }) => {
  const installFilters = [
    {
      id: 'all',
      name: 'All',
      filter: [],
      tooltip: 'All addons, downloaded or not',
    },
    {
      id: 'updates',
      name: 'Updates Available',
      filter: [{ isOutdated: true }, { isInstalled: true }],
      tooltip: 'Addons with updates available',
    },
    {
      id: 'production',
      name: 'In Production',
      filter: [{ currentProductionVersion: (v) => v }, { isInstalled: true }],
      tooltip: 'Addons used in the production bundle',
    },
    {
      id: 'production-outdated',
      name: 'Production Outdated',
      filter: [
        { isProductionOutdated: true, isInstalled: true, currentProductionVersion: (v) => v },
      ],
      tooltip: 'Addons using an outdated version in the production bundle',
    },

    {
      id: 'uninstalled',
      name: 'Downloads Available',
      filter: [{ isInstalled: false }],
      tooltip: 'Addons available to download',
    },
  ]

  const [selected, setSelected] = useState('')

  const handleSelect = (e, filter) => {
    setSelected(e.target.id)
    onSelect(filter)
  }

  return (
    <StyledSection>
      <StyledList>
        <div className={'title'}>Installed</div>
        {installFilters.map((filter) => (
          <div
            key={filter.id}
            className={classNames('item', { isSelected: selected === filter.id })}
            id={filter.id}
            onClick={(e) => handleSelect(e, filter.filter)}
            data-tooltip={filter.tooltip}
          >
            {filter.name}
          </div>
        ))}
      </StyledList>
      <YnputConnector darkMode smallLogo onConnection={onConnection} />
    </StyledSection>
  )
}

export default AddonFilters
