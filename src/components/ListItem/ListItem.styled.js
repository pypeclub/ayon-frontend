import styled from 'styled-components'
import Thumbnail from '/src/containers/thumbnail'
import StatusSelect from '../status/statusSelect'
import { AssigneeSelect } from '@ynput/ayon-react-components'
import getShimmerStyles from '/src/styles/getShimmerStyles'

export const Item = styled.li`
  /* reset defaults */
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 34px;

  & > * {
    width: min-content;
  }

  display: flex;
  padding: 5px 8px 5px 8px;
  align-items: center;
  gap: 8px;
  align-self: stretch;
  cursor: pointer;
  user-select: none;

  background-color: var(--md-sys-color-surface-container-low);
  border: 1px solid transparent;
  border-top-color: var(--md-sys-color-outline-variant);

  /* hide path */
  .path {
    display: none;
  }

  &:hover {
    background-color: var(--md-sys-color-surface-container-low-hover);

    /* show path */
    .path {
      display: block;
    }
  }

  &:active {
    background-color: var(--md-sys-color-surface-container-low-active);
  }

  &.first {
    border-top-color: var(--md-sys-color-surface-container-low);
  }

  &.last {
    border-radius: 0 0 var(--border-radius-m) var(--border-radius-m);
  }

  &.selected {
    border-radius: var(--border-radius-m);
    background-color: var(--md-sys-color-primary-container);
    &:hover {
      background-color: var(--md-sys-color-primary-container-hover);
    }
    &:active {
      background-color: var(--md-sys-color-primary-container-active);
    }

    /* remove focus visible border if selected */

    &:focus-visible {
      outline: none;
    }

    /* highlight borders */
    border-color: var(--md-sys-color-primary);

    /* bottom border is top of next sibling */
    & + * {
      border-top-color: transparent;
    }

    /* show path */
    .path {
      display: block;
    }
  }

  &.loading {
    ${getShimmerStyles()}
    border-color: var(--md-sys-color-surface-container-low);

    &:hover {
      background-color: var(--md-sys-color-surface-container-low);
    }
  }
`

export const ItemStatus = styled(StatusSelect)`
  height: 22px;
  width: 22px;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background-color: var(--md-sys-color-surface-container-hover);
    }

    .icon {
      font-size: 15px;
    }
    .status-field {
      width: 20px;
      height: 20px;
      padding: 0;
      min-height: unset;
      display: flex;
      align-items: center;
      justify-content: center;

      span:last-child {
        display: none;
      }
    }
  }
  & > div {
    transform: translateX(-4px);
  }
`

export const ItemThumbnail = styled(Thumbnail)`
  width: 39px;
  min-width: 39px;
  height: 22px;
  margin: 0;
  border-radius: var(--border-radius-m);

  .icon {
    font-size: 15px;
  }
`

export const Task = styled.div`
  margin: 0 16px;
  display: flex;
  align-items: center;
  gap: var(--base-gap-small);
`

export const Name = styled.div`
  display: flex;
  align-items: center;
  &,
  .icon {
    color: var(--md-sys-color-outline);
  }
  .icon {
    font-size: 15px;
  }
  gap: var(--base-gap-small);
`

export const Code = styled.span`
  color: var(--md-sys-color-outline);
  min-width: 50px;
  max-width: 50px;
  text-align: center;
`

export const ItemAssignees = styled(AssigneeSelect)`
  height: 22px;
  .button {
    & > div {
      padding: 2px;
      height: unset;
    }

    background-color: unset;
    &:hover {
      background-color: var(--md-sys-color-surface-container-hover);
    }

    span:not(.user-image) {
      /* remove name label */
      display: none;
    }

    .user-image {
      width: 18px;
      height: 18px;
      span {
        display: block;
      }
    }

    .user-image {
      top: 0;
    }
  }
`

export const Date = styled.span`
  min-width: 100px;
  max-width: 100px;
  text-align: right;
  white-space: nowrap;
  color: var(--md-sys-color-outline);
  font-weight: 500;

  &.late {
    color: var(--md-sys-color-warning);
  }
`
