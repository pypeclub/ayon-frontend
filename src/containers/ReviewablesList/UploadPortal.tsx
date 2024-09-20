import { FC, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import * as Styled from './ReviewablesList.styled'

interface UploadPortalProps {
  handleInputChange: any
  inputRef: any
}

const UploadPortal: FC<UploadPortalProps> = ({ handleInputChange, inputRef }) => {
  const [isElementInDOM, setIsElementInDOM] = useState(false)

  useEffect(() => {
    const checkElement = () => {
      const element = document.getElementById('empty-files-upload')
      if (element) {
        setIsElementInDOM(true)
      }
    }

    // Initial check
    checkElement()

    // Set up a MutationObserver to detect future changes
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        console.log(mutation)
        if (mutation.type === 'childList') {
          checkElement()
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    isElementInDOM &&
    createPortal(
      <Styled.Upload className="upload">
        <span>Drop or click to upload</span>
        <input type="file" multiple onChange={handleInputChange} ref={inputRef} />
      </Styled.Upload>,
      document.getElementById('empty-files-upload'),
    )
  )
}

export default UploadPortal
