import styled from 'styled-components'
import ThumbnailSimple from '/src/containers/ThumbnailSimple'

export const Container = styled.li`
  /* reset default */
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: 4px;

  width: 100%;
  padding: 8px;
  border-radius: var(--border-radius-m);
`

export const Card = styled.div`
  display: flex;
  gap: var(--base-gap-large);
  align-items: center;
  justify-content: space-between;
  border-radius: var(--border-radius-l);
  padding: var(--padding-m);

  background-color: var(--md-sys-color-surface-container);

  cursor: pointer;
  &:hover {
    background-color: var(--md-sys-color-surface-container-hover);
  }
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  gap: var(--base-gap-small);
`

export const Title = styled.div`
  display: flex;
  gap: var(--base-gap-small);
`

export const Thumbnail = styled(ThumbnailSimple)`
  width: 74px;
  height: 100%;
  aspect-ratio: 1.7778;
  margin: unset;

  .icon {
    font-size: 24px;
  }

  img {
    object-fit: cover;
  }
`
