import { Button as ayonButton } from '@ynput/ayon-react-components'
import styled, { css } from 'styled-components'
import getShimmerStyles from '/src/styles/getShimmerStyles'

const buttonStyles = css`
  background-color: var(--md-sys-color-tertiary);
  color: var(--md-sys-color-on-tertiary);
  border-radius: var(--base-input-border-radius);
  padding: 8px 16px;
  max-height: unset;
  display: flex;
  flex-direction: column;

  &:hover {
    background-color: var(--md-sys-color-tertiary-hover);

    &:disabled {
      background-color: var(--md-sys-color-tertiary);
    }
  }

  &:disabled {
    opacity: 0.5;
  }
`

export const HeaderButton = styled(ayonButton)`
  position: relative;
  min-height: 50px;

  min-width: 210px;
  align-items: flex-start;

  ${buttonStyles}

  img {
    margin: auto;
  }

  .icon {
    color: var(--md-sys-color-on-tertiary);
    font-size: 2rem;
    font-variation-settings: 'FILL' 1;
  }

  /* when loading show shimmer */
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      ${getShimmerStyles('black', 'white')}
      opacity: 0.5;
      .status {
        visibility: hidden;
      }
    `}

  .more {
    transition: transform 0.3s ease;
  }
  ${({ $isOpen }) =>
    $isOpen &&
    css`
      .more {
        transform: rotate(180deg);
      }
    `}
`
export const Status = styled.div`
  display: flex;
  width: 100%;
  gap: 4px;
  align-items: center;
`

export const Container = styled.div`
  display: grid;
  flex-direction: column;
  align-items: center;
  background-color: var(--md-sys-color-tertiary-container);
  border-radius: 8px;
  gap: 0;
`

export const DropdownContainer = styled.div`
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  transition: grid-template-rows 0.23s ease;

  ${({ $isOpen }) =>
    $isOpen
      ? css`
          grid-template-rows: 1fr;
        `
      : css`
          & > .dropdown {
            padding: 0 8px;
            transform: translateY(-50px);
          }
        `}
`

export const Dropdown = styled.div`
  transition: padding 0.1s, transform 0.23s ease;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
  min-height: 0;
  transform: translateY(0);

  span {
    word-break: break-all;
  }
`

export const Footer = styled.footer`
  display: flex;
  gap: 4px;
  width: 100%;
`

export const Button = styled(ayonButton)`
  ${buttonStyles}
  flex: 1;
`
