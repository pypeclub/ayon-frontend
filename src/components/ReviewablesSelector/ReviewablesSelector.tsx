import { FC, useEffect, useState } from 'react'
import * as Styled from './ReviewablesSelector.styled'
import { classNames } from 'primereact/utils'
import FileThumbnail from '../FileThumbnail'

type ReviewableCard = {
  activityId: string
  fileId: string
  updatedAt: string
  label: string
}

interface ReviewablesSelectorProps {
  reviewables: ReviewableCard[]
  selected: string[]
  projectName: string
  onChange?: (activityId: string) => void
  onUpload: () => void
}

const ReviewablesSelector: FC<ReviewablesSelectorProps> = ({
  reviewables = [],
  selected = [],
  projectName,
  onChange,
  onUpload,
}) => {
  const [labelTooltip, setLabelTooltip] = useState<null | string>(null)
  const [labelTooltipYPos, setLabelTooltipYPos] = useState<null | number>(null)
  // add keyboard support
  // use up and down arrow keys to navigate through the reviewables
  // if at top and press up, go to bottom, if at bottom and press down, go to top
  useEffect(() => {
    if (reviewables.length === 1) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 's', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const currentIndex = reviewables.findIndex(({ activityId }) =>
          selected.includes(activityId),
        )
        const nextIndex = e.key === 'w' || e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1
        const nextReviewable =
          reviewables[nextIndex < 0 ? reviewables.length - 1 : nextIndex % reviewables.length]
        const nextActivityId = nextReviewable.activityId

        onChange && onChange(nextActivityId)
        // also set new label for the tooltip
        setLabelTooltip(nextReviewable.label)
        // set label tooltip position
        const el = document.getElementById('preview-' + nextActivityId)

        if (el) {
          const top = el.offsetTop + el.offsetHeight / 2
          setLabelTooltipYPos(top)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selected, reviewables, onChange])

  // keep track of when NOT hovering over the reviewable cards
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // check if the mouse is over a reviewable card
      const closest = (event.target as HTMLElement).closest('.reviewables')
      if (!closest) {
        setLabelTooltip(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleMouseOver = (
    event: React.MouseEvent<HTMLDivElement>,
    { label }: Pick<ReviewableCard, 'label'>,
  ) => {
    // check event is coming from a reviewable card
    const closest = (event.target as HTMLElement).closest('.reviewable-card') as HTMLElement
    if (!closest) return
    setLabelTooltip(label)
    // set label tooltip position
    const top = closest.offsetTop + closest.offsetHeight / 2
    setLabelTooltipYPos(top)
  }

  // if no reviewables, return null
  if (!reviewables.length) return null

  return (
    <Styled.ReviewablesSelector>
      <Styled.Scrollable className="reviewables">
        {reviewables.map(({ activityId, label, fileId }) => (
          <Styled.ReviewableCard
            key={activityId}
            id={'preview-' + activityId}
            onClick={() => onChange && onChange(activityId)}
            className={classNames('reviewable-card', { selected: selected.includes(activityId) })}
            onMouseOver={(e) => handleMouseOver(e, { label })}
          >
            <FileThumbnail src={`/api/projects/${projectName}/files/${fileId}/thumbnail`} />
          </Styled.ReviewableCard>
        ))}
        <Styled.AddButton
          icon="add"
          onClick={onUpload}
          onMouseEnter={() => setLabelTooltip(null)}
        />
      </Styled.Scrollable>
      {labelTooltip && labelTooltipYPos && (
        <Styled.Label style={{ top: labelTooltipYPos }}>{labelTooltip}</Styled.Label>
      )}
    </Styled.ReviewablesSelector>
  )
}

export default ReviewablesSelector
