import { Section } from '@ynput/ayon-react-components'
import styled from 'styled-components'

export const InboxSection = styled(Section)`
  padding: var(--padding-l);
  overflow: hidden;
  align-items: flex-start;
`

export const MessagesList = styled.ul`
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;

  /* reset defaults */
  list-style-type: none;
  margin: 0;
  padding: 0;

  border-radius: var(--border-radius-m);

  /* remove focus outline */
  &:focus-visible {
    outline: none;
  }

  &.isLoading {
    overflow: hidden;
  }
`
