import { Dropdown, Icon } from '@ynput/ayon-react-components'
import * as Styled from './ReviewVersionDropdown.styled'

const ReviewVersionDropdown = ({
  options,
  value,
  valueIcon = '',
  onChange,
  selectRef = null,
  prefix = 'Viewing: ',
  placeholder = 'Select a version',
  tooltip = 'Viewing version',
  shortcut = 'Q',
  valueProps = {},
  ...props
}) => {
  return (
    <Dropdown
      options={options}
      value={[value]}
      onChange={(v) => onChange(v[0])}
      ref={selectRef}
      search={options.length > 20}
      activateKeys={['Enter']}
      {...props}
      valueTemplate={(value, selected, isOpen) => (
        <div data-tooltip={tooltip} data-shortcut={shortcut} style={{ height: '100%' }}>
          <Styled.VersionValueTemplate
            value={selected || value}
            isOpen={isOpen}
            placeholder={placeholder}
            {...valueProps}
          >
            {prefix}
            {valueIcon && <Icon icon={valueIcon} />}
            {options.find((option) => option.value === (selected || value)[0])?.label}
          </Styled.VersionValueTemplate>
        </div>
      )}
    />
  )
}

export default ReviewVersionDropdown
