import { DefaultValueTemplate } from '@ynput/ayon-react-components'
import styled from 'styled-components'

export const VersionValueTemplate = styled(DefaultValueTemplate)`
  background-color: var(--md-sys-color-primary-container);

  &:hover {
    background-color: var(--md-sys-color-primary-container-hover);
  }

  color: var(--md-sys-color-on-primary-container);
  width: 150px;
  border: none;
  padding-left: 16px;

  div {
    justify-content: center;
    div {
      flex: none;
    }
  }
`
