import { InputText, InputNumber } from 'ayon-react-components-test'
import { Dropdown as DropdownPrime } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import ayonClient from '/src/ayon'
// import Dropdown from '/src/components/dropdown'

//eslint-disable-next-line no-unused-vars
const stringEditor = (options, callback, value, settings) => {
  return (
    <InputText
      value={value}
      onChange={(e) => {
        callback(options, e.target.value)
      }}
    />
  )
}

const enumEditor = (options, callback, value, settings) => {
  const enumData = settings.enum || []
  const onChange = (event) => callback(options, event.value)

  if (settings.type === 'string') {
    return (
      <DropdownPrime
        value={value || ''}
        options={enumData}
        optionLabel="label"
        optionValue="value"
        dataKey="value"
        onChange={onChange}
        style={{ minWidth: 10, width: '100%' }}
      />
    )
  } else if (settings.type === 'list_of_strings') {
    return (
      <MultiSelect
        value={value || []}
        options={enumData}
        optionLabel="label"
        optionValue="value"
        dataKey="value"
        onChange={onChange}
        style={{ minWidth: 10, width: '100%' }}
      />
    )
  }

  return <>Unsuppored editor</>
}

//eslint-disable-next-line no-unused-vars
const integerEditor = (options, callback, value, settings) => {
  const attrSettings = ayonClient.getAttribSettings(options.field)

  let min = null
  if (attrSettings && 'gt' in attrSettings.data) min = attrSettings.data.gt + 1
  else if (attrSettings && 'gte' in attrSettings.data) min = attrSettings.data.gte

  let max = null
  if (attrSettings && 'lt' in attrSettings.data) max = attrSettings.data.lt - 1
  else if (attrSettings && 'lte' in attrSettings.data) max = attrSettings.data.lte

  return (
    <div className="table-editor">
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        min={min}
        max={max}
        step={1}
        onChange={(e) => {
          const val = e.target.value === '' ? null : parseInt(e.target.value)
          callback(options, val)
        }}
      />
    </div>
  )
}

//eslint-disable-next-line no-unused-vars
const floatEditor = (options, callback, value, settings) => {
  //  onChange={(e) => options.editorCallback(e.value)}
  const attrSettings = ayonClient.getAttribSettings(options.field)
  let min = null
  if (attrSettings && 'gt' in attrSettings.data) min = attrSettings.data.gt + 0.00001
  else if (attrSettings && 'gte' in attrSettings.data) min = attrSettings.data.gte

  let max = null
  if (attrSettings && 'lt' in attrSettings.data) max = attrSettings.data.lt - 0.00001
  else if (attrSettings && 'lte' in attrSettings) max = attrSettings.data.lte
  return (
    <div
      className="table-editor"
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <InputNumber
        style={{ width: '100%' }}
        value={value}
        min={min}
        max={max}
        step="any"
        onChange={(e) => {
          const val = e.target.value === '' ? null : parseFloat(e.target.value)
          callback(options, val)
        }}
      />
    </div>
  )
}

export { stringEditor, integerEditor, floatEditor, enumEditor }
