import styled, { css } from 'styled-components'
import PerfectScrollbar from 'react-perfect-scrollbar'

export const DropColumn = styled.div`
  position: absolute;
  width: 100%;

  border-radius: 16px;

  ${({ $active }) =>
    $active &&
    css`
      z-index: 1000;
    `}
`

export const Column = styled.div`
  --min-height: 125px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;

  height: min-content;
  min-width: 234px;
  min-height: var(--min-height);
  max-height: -webkit-fill-available;
  max-height: 100%;
  padding: 0;
  flex: 0;

  border-radius: 16px;
  background-color: var(--md-sys-color-surface-container-lowest);

  /* when a card is hovering over the top */
  .items > *:last-child {
    margin-bottom: 0;
    transition: margin-bottom 0.1s ease-in-out;
  }
  ${({ $isOverSelf, $isOver, $isScrolling }) =>
    $isOver &&
    !$isOverSelf &&
    !$isScrolling &&
    css`
      /* last child margin bottom */
      .items {
        & > *:last-child {
          margin-bottom: calc(var(--min-height) - 8px);
        }
      }
    `}

  ${({ $isOver }) =>
    $isOver &&
    css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        background-color: white;
        opacity: 0.05;
        z-index: 500;
        border-radius: 16px;
      }
    `}
`

export const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;

  h2 {
    margin: 0;
    /* text-align: center; */
    width: 100%;
  }

  width: 100%;
  border-bottom: solid 1px var(--md-sys-color-outline);
  border-color: ${({ $color }) => $color};
  margin-bottom: 8px;
`

export const Items = styled(PerfectScrollbar)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;

  padding-bottom: ${({ $isScrolling }) => ($isScrolling ? '30px' : '16px')};

  ${({ $active }) =>
    $active &&
    css`
      .ps__rail-y {
        visibility: hidden;
      }
    `}

  .ps__rail-y {
    z-index: 1000;

    .ps__thumb-y {
      background-color: var(--md-sys-color-surface-container-high) !important;
    }

    &:hover,
    &.ps--clicking {
      background-color: unset !important;
      .ps__thumb-y {
        background-color: var(--md-sys-color-surface-container-highest) !important;
        width: 8px !important;
      }
    }
  }
`