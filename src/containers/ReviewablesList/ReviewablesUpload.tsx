import axios, { AxiosProgressEvent, AxiosResponse } from 'axios'
import api from '@api'
import { toast } from 'react-toastify'
import { FC, useState, DragEvent, ChangeEvent, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { Icon } from '@ynput/ayon-react-components'
import { $Any } from '@types'

import reviewApi from '@queries/review/getReview'
import { UploadReviewableApiResponse } from '@api/rest/review'
import { toggleUpload } from '@state/viewer'

// components
import ReviewableProgressCard, { ReviewableProgress } from '@components/ReviewableProgressCard'
import * as Styled from './ReviewablesList.styled'
import styled from 'styled-components'

export const ReviewablesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--base-gap-small);
  min-height: 100%;
  padding-bottom: var(--padding-m);
  width: 100%;
  height: 100%;
`

export const Upload = styled.div`
  position: relative;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  background-color: var(--md-sys-color-surface-container-low);

  border-radius: var(--border-radius-xxl);
  border: 2px dashed var(--md-sys-color-outline-variant);
  color: var(--md-sys-color-outline-variant);

  &:hover {
    background-color: var(--md-sys-color-surface-container-low-hover);
    border-color: var(--md-sys-color-outline);
    color: var(--md-sys-color-outline);
  }

  input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }
`

interface ReviewableUploadProps {
  projectName: string
  versionId: string
  productId: string
  maximized?: boolean
  onUpload?: () => void
  children?: $Any
}

const ReviewableUpload: FC<ReviewableUploadProps> = ({
  projectName,
  versionId,
  productId,
  onUpload,
  children,
  maximized,
}) => {
  const dispatch = useDispatch()

  // are we dragging a file over?
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const openUpload = useSelector((state: $Any) => state.viewer.upload)
  // when upload is true, open the file dialog programmatically
  useEffect(() => {
    if (openUpload) {
      dispatch(toggleUpload(false))
      inputRef.current?.click()
    }
  }, [openUpload, dispatch, toggleUpload])

  const [uploading, setUploads] = useState<{ [key: string]: ReviewableProgress[] }>({})

  const handleRemoveUpload = (name: string) => {
    setUploads((uploads) => ({
      ...uploads,
      [versionId]: uploads[versionId]?.filter((upload) => upload.name !== name) || [],
    }))
  }

  const handleFileUpload = async (files: FileList) => {
    const uploadingFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      progress: 0,
    }))

    const newUploadsForVersion = [...(uploading[versionId] || []), ...uploadingFiles]

    setUploads({ ...uploading, [versionId]: newUploadsForVersion })

    const successHandler = (file: File) => (response: AxiosResponse) => {
      // Handle successful upload
      console.log(`Upload successful for ${file.name}`)
      // patch the new data into the reviewables cache
      const data = response.data as UploadReviewableApiResponse

      dispatch(
        // @ts-ignore
        reviewApi.util.updateQueryData(
          'getReviewablesForVersion',
          { projectName, versionId },
          (draft) => {
            if (!draft.reviewables) {
              draft.reviewables = []
            }
            // @ts-ignore
            draft.reviewables.push(data)
          },
        ),
      )

      // also invalidate the viewer cache
      dispatch(api.util.invalidateTags([{ type: 'viewer', id: productId }]))
      // remove the file from the list
      handleRemoveUpload(file.name)
    }

    const errorHandler = (file: File) => (error: $Any) => {
      console.error(`Upload failed for ${file.name}: ${error}`)
      toast.error(`Failed to upload file: ${file.name}`)
      // add error to the file
      setUploads((uploads) => {
        // current uploads for versionId
        const currentUploads = uploads[versionId] || []
        const updatedUploads = currentUploads.map((upload) => {
          if (upload.name !== file.name) return upload
          return {
            ...upload,
            error: error.response.data.detail || error.message,
          }
        })

        // update state
        return {
          ...uploads,
          [versionId]: updatedUploads,
        }
      })
    }

    const progressHandler = (file: File) => {
      return (progressEvent: AxiosProgressEvent) =>
        setUploads((uploads) => {
          // current uploads for versionId
          const currentUploads = uploads[versionId] || []
          const updatedUploads = currentUploads.map((upload) => {
            if (upload.name !== file.name) return upload
            return {
              ...upload,
              progress: progressEvent.total
                ? Math.round((progressEvent.loaded / progressEvent.total) * 100)
                : 0,
            }
          })

          // update state
          return {
            ...uploads,
            [versionId]: updatedUploads,
          }
        })
    }

    try {
      // upload the files
      for (const file of files) {
        const autoLabel = file.name.split('.').slice(0, -1).join('.')

        const url = `/api/projects/${projectName}/versions/${versionId}/reviewables?label=${autoLabel}`
        const headers = { 'content-type': file.type, 'x-file-name': file.name }
        axios
          .post(url, file, { headers, onUploadProgress: progressHandler(file) })
          .then(successHandler(file))
          .catch(errorHandler(file))
      }
      // Callback after successful uploads
      onUpload && onUpload()
    } catch (error) {
      // something went wrong with everything, EEEEK!
      console.error(error)
      toast.error('Failed to upload file/s')
    }
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files

    if (files) {
      handleFileUpload(files)
    }
  }

  //   when the user drops a file
  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingFile(false)

    const files = event.dataTransfer.files

    if (files) {
      handleFileUpload(files)
    }
  }

  return (
    <>
      {!isDraggingFile && (
        <ReviewablesList onDragEnter={() => setIsDraggingFile(true)}>
          <>
            {children}
            {/* uploading items */}
            {uploading[versionId]?.map((file) => (
              <ReviewableProgressCard
                key={file.name}
                {...file}
                type={'upload'}
                onRemove={() => handleRemoveUpload(file.name)}
              />
            ))}

            {/* upload button */}
            <Upload className="upload" style={{ height: maximized ? '100%' : 'auto' }}>
              <span>Drop or click to upload</span>
              <input type="file" multiple onChange={handleInputChange} ref={inputRef} />
            </Upload>
          </>
        </ReviewablesList>
      )}

      {isDraggingFile && (
        <Styled.Dropzone
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleFileDrop}
        >
          <Icon icon="upload" />
          <span>Upload reviewable</span>
        </Styled.Dropzone>
      )}
    </>
  )
}

export default ReviewableUpload
