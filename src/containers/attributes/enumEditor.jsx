import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { InputText, Button } from 'ayon-react-components-test'
import styled from 'styled-components'
import LockedInputRow from '/src/components/LockedInput'
import { camelCase } from 'lodash'

const RowStyled = styled.form`
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    border: none;
    padding: 0;
    background-color: unset;
    cursor: pointer;
  }
`

const ContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const EnumEditor = ({ values = [], onChange }) => {
  values = values || []
  const valuesValues = useMemo(() => values.map(({ value }) => value), [values])

  const [newItemValueChanged, setNewItemValueChanged] = useState([])

  const handleLabelChange = (v, index) => {
    const newValues = [...values]

    // check if value is already in array
    const curValue = values[index]

    const newItem = {
      label: v,
      value: (newItemValueChanged.includes(index) && curValue?.value) || camelCase(v),
    }

    if (curValue) {
      newValues.splice(index, 1, newItem)
    } else {
      newValues.push(newItem)
    }

    // return all items
    onChange(newValues)
  }

  const handleValueChange = (v, index) => {
    setNewItemValueChanged([...newItemValueChanged, index])
    const curLabel = values[index].label

    const newValues = [...values]
    newValues.splice(index, 1, { label: curLabel, value: camelCase(v) })

    onChange(newValues)
  }

  const handleRemoveItem = (e, index) => {
    e.preventDefault()
    const newValues = [...values]
    newValues.splice(index, 1)
    onChange(newValues)
  }

  const newItem = { value: '', label: '' }

  return (
    <ContainerStyled>
      {[...values, newItem].map(({ value, label }, index) => (
        <RowStyled key={index}>
          <label htmlFor="label">label</label>
          <InputText
            id="label"
            onChange={(e) => handleLabelChange(e.target.value, index)}
            error={valuesValues.includes(label)}
            value={label}
          />
          <label htmlFor="label">value</label>
          <LockedInputRow
            id="value"
            value={value}
            onSubmit={(v) => handleValueChange(v, index)}
            style={{ minWidth: 'unset' }}
            fullUnlock
            saveLabel=""
            cancelLabel=""
          />

          <Button
            onClick={(e) => handleRemoveItem(e, index)}
            icon="cancel"
            disabled={index === values.length}
            style={{ visibility: index === values.length ? 'hidden' : 'visible' }}
          />
        </RowStyled>
      ))}
    </ContainerStyled>
  )
}

EnumEditor.propTypes = {
  values: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })),
  onChange: PropTypes.func,
}

export default EnumEditor
