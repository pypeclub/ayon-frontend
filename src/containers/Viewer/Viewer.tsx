import { useEffect, useMemo, useState } from 'react'
import { Button } from '@ynput/ayon-react-components'
import * as Styled from './Viewer.styled'
import VersionSelectorTool from '@components/VersionSelectorTool/VersionSelectorTool'
import { useGetViewerReviewablesQuery } from '@queries/review/getReview'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFullscreen, toggleUpload, updateSelection, updateProduct } from '@state/viewer'
import ViewerDetailsPanel from './ViewerDetailsPanel'
import ViewerPlayer from './ViewerPlayer'
import ReviewablesSelector from '@components/ReviewablesSelector'
import { updateDetailsPanelTab } from '@state/details'
import { $Any } from '@types'
import { useFullScreenHandle } from 'react-full-screen'
import { getGroupedReviewables } from '../ReviewablesList/getGroupedReviewables'
import { GetReviewablesResponse } from '@queries/review/types'
import { compareDesc } from 'date-fns'
import ReviewVersionDropdown from '@/components/ReviewVersionDropdown'
import { productTypes } from '@state/project'
import ReviewableUpload from '@containers/ReviewablesList/ReviewablesUpload'

interface ViewerProps {
  onClose?: () => void
  canOpenInNew?: boolean
}

const Viewer = ({ onClose }: ViewerProps) => {
  const {
    productId,
    taskId,
    folderId,
    projectName,
    versionIds = [],
    reviewableIds = [],
    fullscreen,
    quickView,
    selectedProductId,
  } = useSelector((state: $Any) => state.viewer)

  const [autoPlay, setAutoPlay] = useState(quickView)

  const dispatch = useDispatch()

  // new query: returns all reviewables for a product
  const { data: allVersionsAndReviewables = [], isFetching: isFetchingReviewables } =
    useGetViewerReviewablesQuery(
      { projectName, productId, taskId, folderId },
      { skip: !projectName || (!productId && !taskId && !folderId) },
    )

  // check if there are multiple products in the reviewables. At least one productId is different
  const hasMultipleProducts = useMemo(() => {
    const uniqueProductIds = new Set(allVersionsAndReviewables.map((v) => v.productId))
    return uniqueProductIds.size > 1
  }, [allVersionsAndReviewables])

  // create a unique list of productIds
  const uniqueProducts = useMemo(() => {
    const uniqueProductIds = new Set(allVersionsAndReviewables.map((v) => v.productId))
    return Array.from(uniqueProductIds)
  }, [allVersionsAndReviewables])

  type ProductTypeKey = keyof typeof productTypes

  const productOptions = useMemo(() => {
    return [...uniqueProducts]
      .map((id) => {
        const product = allVersionsAndReviewables.find((v) => v.productId === id)
        return {
          value: id,
          label: product?.productName || 'Unknown product',
          icon:
            (product?.productType && productTypes[product.productType as ProductTypeKey]?.icon) ||
            'inventory_2',
        }
      })
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [uniqueProducts, allVersionsAndReviewables])

  const selectedProduct = useMemo(
    () => productOptions.find((p) => p.value === selectedProductId),
    [uniqueProducts, selectedProductId],
  )

  // sort all versions and reviewables by the latest reviewable createdAt date
  const sortedVersionsReviewableDates = useMemo(
    () =>
      hasMultipleProducts
        ? [...allVersionsAndReviewables].sort((a, b) => {
            // Find the reviewable with the latest createdAt date in a
            const aLatestReviewable = a.reviewables?.reduce((latest, current) => {
              return compareDesc(
                new Date(latest.createdAt || 0),
                new Date(current.createdAt || 0),
              ) === 1
                ? latest
                : current
            }, a.reviewables[0])

            // Find the reviewable with the latest createdAt date in b
            const bLatestReviewable = b.reviewables?.reduce((latest, current) => {
              return compareDesc(
                new Date(latest.createdAt || 0),
                new Date(current.createdAt || 0),
              ) === 1
                ? latest
                : current
            }, b.reviewables[0])

            // Use compareDesc to compare the latest reviewables' createdAt dates
            return compareDesc(
              new Date(aLatestReviewable?.createdAt || 0),
              new Date(bLatestReviewable?.createdAt || 0),
            )
          })
        : allVersionsAndReviewables,
    [allVersionsAndReviewables, hasMultipleProducts],
  )

  // check if a specific product is selected
  const versionsAndReviewables: GetReviewablesResponse[] = useMemo(() => {
    if (!hasMultipleProducts) return allVersionsAndReviewables
    else if (selectedProductId) {
      // filter out the versions for the selected product
      return allVersionsAndReviewables.filter((v) => v.productId === selectedProductId)
    } else {
      // find the version (and therefor product) with the reviewable that was last createdAt
      const latestProductId = sortedVersionsReviewableDates[0].productId
      if (latestProductId) {
        return allVersionsAndReviewables.filter((v) => v.productId === latestProductId)
      } else {
        // return first product
        const firstProduct = allVersionsAndReviewables[0]
        return allVersionsAndReviewables.filter((v) => v.productId === firstProduct.productId)
      }
    }
  }, [allVersionsAndReviewables, selectedProductId])

  // if hasMultipleProducts and no selectedProductId, select the first product
  useEffect(() => {
    if (hasMultipleProducts && !selectedProductId && !isFetchingReviewables) {
      const firstProduct = versionsAndReviewables[0]
      dispatch(updateProduct({ selectedProductId: firstProduct.productId }))
    }
  }, [
    hasMultipleProducts,
    selectedProductId,
    isFetchingReviewables,
    versionsAndReviewables,
    dispatch,
  ])

  // v003 or v004, etc
  const selectedVersion = useMemo(
    () => versionsAndReviewables.find((v) => v.id === versionIds[0]),
    [versionIds, versionsAndReviewables],
  )
  // if no versionIds are provided, select the last version and update the state
  useEffect(() => {
    if ((!versionIds.length || !selectedVersion) && !isFetchingReviewables) {
      const lastVersion = versionsAndReviewables[versionsAndReviewables.length - 1]
      if (lastVersion) {
        dispatch(updateSelection({ versionIds: [lastVersion.id] }))
      }
    }
  }, [versionIds, selectedVersion, isFetchingReviewables, versionsAndReviewables, dispatch])

  const versionReviewableIds = selectedVersion?.reviewables?.map((r) => r.fileId) || []

  // if no reviewableIds are provided, select the first playable reviewable
  useEffect(() => {
    if (
      (!reviewableIds.length ||
        !reviewableIds.every((id: string) => versionReviewableIds.includes(id))) &&
      !isFetchingReviewables &&
      selectedVersion
    ) {
      const firstReviewableId = selectedVersion.reviewables?.find(
        (r) => r.availability === 'ready',
      )?.fileId
      if (firstReviewableId) {
        dispatch(updateSelection({ reviewableIds: [firstReviewableId] }))
      }
    }
  }, [reviewableIds, versionReviewableIds, isFetchingReviewables, selectedVersion, dispatch])

  // disable quickView straight away (if it was enabled)
  // NOTE: this will change with Quick View task
  useEffect(() => {
    if (quickView) {
      dispatch(updateSelection({ quickView: false }))
    }
  }, [quickView, dispatch])

  const selectedReviewable = useMemo(
    // for now we only support one reviewable
    () => selectedVersion?.reviewables?.find((r) => r.fileId === reviewableIds[0]),
    [reviewableIds, selectedVersion],
  )

  const handleProductChange = (productId: string) => {
    dispatch(updateProduct({ selectedProductId: productId }))
  }

  const handleVersionChange = (versionId: string) => {
    // try and find a matching reviewable in the new version with the same label as the current reviewable
    const currentLabel = selectedReviewable?.label?.toLowerCase()

    const newVersion = versionsAndReviewables.find((v) => v.id === versionId)

    // no version? that's weird
    if (!newVersion) return console.error('No version found for id', versionId)

    let newReviewableId = newVersion.reviewables?.find(
      (r) => r.label?.toLowerCase() === currentLabel && r.availability === 'ready',
    )?.fileId

    // no matching reviewable? just pick the first ready one
    if (!newReviewableId)
      newReviewableId = newVersion.reviewables?.find((r) => r.availability === 'ready')?.fileId

    dispatch(updateSelection({ versionIds: [versionId], reviewableIds: [newReviewableId] }))
  }

  const handleReviewableChange = (reviewableId: string) => {
    dispatch(updateSelection({ reviewableIds: [reviewableId] }))
  }

  const handleUploadButton = () => {
    // switch to files tab
    dispatch(updateDetailsPanelTab({ scope: 'review', tab: 'files' }))
    // open the file dialog
    dispatch(toggleUpload(true))
  }

  const handlePlayReviewable = () => {
    // reset auto play
    // auto play should only be enabled on first video load
    setAutoPlay(false)
  }

  const handle = useFullScreenHandle()

  useEffect(() => {
    if (fullscreen) {
      // check if it's already open
      if (!handle.active) handle.enter()
    } else {
      if (handle.active) handle.exit()
    }
  }, [handle, fullscreen])

  const fullScreenChange = (state: boolean) => {
    // when closing, ensure the state is updated
    if (!state && fullscreen) {
      dispatch(toggleFullscreen({ fullscreen: false }))
    }
  }

  const reviewables = selectedVersion?.reviewables || []

  const { optimized, unoptimized } = useMemo(
    () => getGroupedReviewables(reviewables as any),
    [reviewables],
  )

  const shownOptions = [...optimized, ...unoptimized]

  let viewerComponent
  const availability = selectedReviewable?.availability
  const isPlayable = availability !== 'conversionRequired'

  const noVersions = !versionsAndReviewables.length && !isFetchingReviewables

  if (selectedReviewable?.mimetype.includes('video') && isPlayable) {
    viewerComponent = (
      <ViewerPlayer
        projectName={projectName}
        reviewable={selectedReviewable}
        onUpload={handleUploadButton}
        autoplay={autoPlay}
        onPlay={handlePlayReviewable}
      />
    )
  } else if (selectedReviewable?.mimetype.includes('image') && isPlayable) {
    viewerComponent = (
      <Styled.Image
        src={`/api/projects/${projectName}/files/${selectedReviewable.fileId}`}
        alt={selectedReviewable.label || selectedReviewable.filename}
      />
    )
  } else if (!isFetchingReviewables) {
    viewerComponent = (
      <div
        id="foo"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ReviewableUpload
          projectName={projectName}
          versionId={versionIds[0]}
          productId={productId}
        />
      </div>
    )
  }

  // todo: noVersions modal smaller
  return (
    <Styled.Container>
      <Styled.PlayerToolbar>
        <VersionSelectorTool
          versions={versionsAndReviewables}
          selected={versionIds[0]}
          onChange={handleVersionChange}
        />
        {hasMultipleProducts && (
          <ReviewVersionDropdown
            options={productOptions}
            placeholder="Select a product"
            prefix="Product: "
            value={selectedProductId}
            onChange={handleProductChange}
            valueProps={{ className: 'product-dropdown' }}
            tooltip="Select a product to view its versions reviewables"
            shortcut={''}
            valueIcon={selectedProduct?.icon || ''}
          />
        )}
      </Styled.PlayerToolbar>
      {onClose && <Button onClick={onClose} icon={'close'} className="close" />}
      <Styled.FullScreenWrapper handle={handle} onChange={fullScreenChange}>
        {viewerComponent}
      </Styled.FullScreenWrapper>
      <ReviewablesSelector
        reviewables={shownOptions}
        selected={reviewableIds}
        onChange={handleReviewableChange}
        onUpload={handleUploadButton}
        projectName={projectName}
      />
      {!noVersions && <ViewerDetailsPanel versionIds={versionIds} projectName={projectName} />}
    </Styled.Container>
  )
}

export default Viewer
