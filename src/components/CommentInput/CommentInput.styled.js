import styled from 'styled-components'

export const AutoHeight = styled.div`
  /* use grid tick for auto height transition */
  display: grid;
  height: 100%;
  /* transition: translate 0.1s, margin-top 0.1s; */
  position: relative;
`

export const Comment = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  background-color: var(--md-sys-color-surface-container);
  outline: 1px solid var(--md-sys-color-outline-variant);
  border-radius: var(--border-radius-l);
  overflow: hidden;

  &.isOpen {
    /* box shadow */
    box-shadow: 0 -3px 10px 0 rgba(0, 0, 0, 0.2);

    .quill {
      background-color: var(--md-sys-color-surface-container);
    }
  }

  /* CLOSED */
  &.isClosed {
    cursor: pointer;
    .ql-editor > * {
      cursor: pointer !important;
    }
    &:hover {
      background-color: var(--md-sys-color-surface-container-high);
    }

    /* hide toolbar */
    .ql-toolbar.ql-snow {
      height: 0;
      padding: 0;
      margin: 0;
      border-width: 0;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
    }
  }

  .ql-editor.ql-blank::before {
    color: var(--md-sys-color-on-surface);
    opacity: 0.25;
  }

  /* check box styles */
  .ql-editor ul {
    padding-left: 0;

    &[data-checked='true'] {
      li {
        display: flex;
        ::before {
          /* tick circle svg */
          content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24' fill='%2323E0A9'%3E%3Cpath d='m427.462-343.692 233.846-232.846L620-617.846 427.462-426.308l-87-86L299.154-471l128.308 127.308ZM480.134-104q-77.313 0-145.89-29.359-68.577-29.36-120.025-80.762-51.447-51.402-80.833-119.917Q104-402.554 104-479.866q0-78.569 29.418-146.871 29.419-68.303 80.922-119.917 51.503-51.614 119.916-80.48Q402.67-856 479.866-856q78.559 0 146.853 28.839 68.294 28.84 119.922 80.422 51.627 51.582 80.493 119.841Q856-558.639 856-480.05q0 77.589-28.839 145.826-28.84 68.237-80.408 119.786-51.569 51.548-119.81 80.993Q558.702-104 480.134-104Z'/%3E%3C/svg%3E");
          margin-right: 12px;
          font-size: unset;
          top: -3px;
          position: relative;
        }
      }
    }
    &[data-checked='false'] {
      li {
        display: flex;
        ::before {
          /* open circle svg */
          content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24' viewBox='0 -960 960 960' width='24' fill='%23F4F5F5'%3E%3Cpath d='M480.409-104q-77.588 0-146.165-29.359-68.577-29.36-120.025-80.762-51.447-51.402-80.833-119.876Q104-402.471 104-480.325q0-78.11 29.418-146.412 29.419-68.303 80.922-119.917 51.503-51.614 119.875-80.48Q402.587-856 480.325-856q78.1 0 146.394 28.839 68.294 28.84 119.922 80.422 51.627 51.582 80.493 120.065Q856-558.191 856-480.326q0 77.865-28.839 146.102-28.84 68.237-80.408 119.786-51.569 51.548-120.034 80.993Q558.253-104 480.409-104ZM480-162q132.513 0 225.256-92.744Q798-347.487 798-480t-92.744-225.256Q612.513-798 480-798t-225.256 92.744Q162-612.513 162-480t92.744 225.256Q347.487-162 480-162Zm0-318Z'/%3E%3C/svg%3E");
          margin-right: 12px;
          font-size: unset;
          top: -3px;
          position: relative;
        }
      }
    }
  }

  /* container styles reset */
  .ql-container.ql-snow {
    border: none;

    .ql-editor {
      a {
        ::before,
        ::after {
          display: none;
        }
      }

      a[href^='@'] {
        text-decoration: none;
        color: var(--md-sys-color-primary);
      }
    }
  }

  /* toolbar styles */
  .ql-toolbar.ql-snow {
    border: none;
    background-color: var(--md-sys-color-surface-container);
    border-bottom: 1px solid var(--md-sys-color-surface-container-hover);
    padding: var(--padding-s);
    display: flex;
    height: unset;
    width: unset;

    .ql-formats {
      height: 32px;
      margin-right: 8px;
      padding-right: 8px;
      border-right: 1px solid var(--md-sys-color-surface-container-hover);

      /* remove border for last child */
      &:last-child {
        border-right: none;
      }
    }

    button {
      float: none;
      padding: 6px;
      border-radius: var(--border-radius-m);
      height: 32px;
      width: 32px;
    }

    button:hover {
      background-color: var(--md-sys-color-surface-container-highest-hover);
    }
  }
`

export const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  padding: var(--padding-m);
  border-top: 1px solid var(--md-sys-color-surface-container-hover);
  background-color: var(--md-sys-color-surface-container);
  z-index: 100;

  /* remove save button icon */
  & > button.comment {
    .icon {
      display: none;
    }
  }
`

export const Commands = styled.div`
  display: flex;
  gap: var(--base-gap-small);
`

export const Markdown = styled.div`
  position: fixed;
  visibility: hidden;
`
