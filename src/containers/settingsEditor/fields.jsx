import { useMemo } from 'react'
import { Button, Divider } from 'ayon-react-components-test'
import ReactMarkdown from 'react-markdown'
import SettingsPanel from './settingsPanel'

import { isEqual } from 'lodash'
import arrayEquals from '/src/helpers/arrayEquals'

const arrayStartsWith = (arr1, arr2) => {
  // return true, if first array starts with second array
  if ((arr2 || []).length > (arr1 || []).length) return false
  if ((arr2 || []).length === 0) return true
  for (let i = 0; i < arr2.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

const arrayContainsArray = (arr1, arr2) => {
  return arr1.some((el) => isEqual(el, arr2))
}

function ObjectFieldTemplate(props) {
  let className = 'form-object-field'
  if (props.schema.layout) className += ` layout-${props.schema.layout}`

  // Highlight overrides and changed fields

  const objId = props.idSchema.$id
  const override = props.formContext.overrides[objId]
  const path = override?.path

  const overrideLevel = useMemo(() => {
    // check whether a child object is changed locally
    for (const changedPath of props.formContext.changedKeys) {
      if (arrayStartsWith(changedPath, path)) {
        return 'edit'
      }
    }

    for (const changedId in props.formContext.overrides) {
      const changedPath = props.formContext.overrides[changedId].path
      if (arrayStartsWith(changedPath, path)) {
        return props.formContext.overrides[changedId].level
      }
    }

    return 'default'
  }, [path, props.formContext.changedKeys, props.formContext.overrides]) // props.formData was there too? do we need it?

  if (props.schema.isgroup && overrideLevel === 'edit') {
    className += ' group-changed'
  }

  // Object descrtiption (from docstrings)

  const shortDescription = props.schema.description && props.schema.description.split('\n')[0]

  const longDescription = useMemo(() => {
    if (!props.schema.description) return null
    return (
      <div className="form-object-field-help">
        <ReactMarkdown>{props.schema.description}</ReactMarkdown>
      </div>
    )
  }, [props.schema.description])

  // memoize the fields

  const enabledToggler = useMemo(() => {
    for (const element of props.properties) {
      if (element.name === 'enabled') {
        return <span className="form-object-header-enabled-toggler">{element.content}</span>
      }
    }
  }, [props.properties])

  const fields = useMemo(() => {
    let hiddenFields = []
    for (const propName in props?.schema?.properties || {}) {
      const ppts = props?.schema?.properties[propName]
      if (!(ppts.scope || ['studio', 'project']).includes(props.formContext.level)) {
        hiddenFields.push(propName)
      }
      if (ppts.conditionalEnum) {
        hiddenFields = [
          ...hiddenFields,
          ...(ppts?.enum || []).filter((e) => e !== props.formData[propName]),
        ]
      }
    }

    if (props.schema.layout === 'expanded') {
      let nameField = null
      let otherFields = []

      for (const element of props.properties) {
        if (element.name === 'name') nameField = element.content
        else otherFields.push(element.content)
      }
      return (
        <>
          {longDescription}
          <div className={className}>
            <div className="name-field">{nameField}</div>
            <div className="data-fields">
              {otherFields
                .filter((f) => !hiddenFields.includes(f.props.name))
                .map((element) => element)}
            </div>
          </div>
        </>
      )
    } // ugly layout

    return (
      <>
        {longDescription}
        <div className={className}>
          {props.properties
            .filter(
              (element) =>
                (element.name !== 'enabled' || ['compact', 'root'].includes(props.schema.layout)) &&
                !hiddenFields.includes(element.name),
            )
            .map((element, index) => (
              <div key={index} className="form-object-field-item">
                {element.content}
              </div>
            ))}
        </div>
      </>
    )
  }, [props.properties, className])

  // aaand... render

  if (['compact', 'root', 'expanded'].includes(props.schema.layout)) return fields

  // In case of "pseudo-dicts" (array of objects with a "name" attribute)
  // use the "name" attributeas the title

  let title = props.title
  if ('name' in props.schema.properties) {
    let label = null
    if ('label' in props.schema.properties) label = props.formData.label
    title = label || props.formData.name || <span className="new-object">Unnamed item</span>
  }

  return (
    <SettingsPanel
      objId={objId}
      onClick={() => {
        if (props.formContext.onSetBreadcrumbs) props.formContext.onSetBreadcrumbs(path)
      }}
      title={title}
      description={shortDescription}
      className={`obj-override-${overrideLevel}`}
      enabledToggler={enabledToggler}
    >
      {fields}
    </SettingsPanel>
  )
}

function FieldTemplate(props) {
  // Do not render the field if it belongs to a different scope (studio/project/local) or if it is hidden
  if (!(props.schema.scope || ['studio', 'project']).includes(props.formContext.level)) return null

  const divider = useMemo(() => {
    if (props.schema.section)
      return <Divider>{props.schema.section !== '---' && props.schema.section}</Divider>
    else return <></>
  }, [props.schema.section])

  // Object fields

  if (props.schema.type === 'object') {
    return (
      <>
        {divider}
        {props.children}
      </>
    )
  }

  // Solve overrides for lists and leaves

  const override = props.formContext.overrides ? props.formContext.overrides[props.id] : null
  const path = override?.path || []

  const fieldChanged = useMemo(() => {
    return arrayContainsArray(props.formContext.changedKeys, path)
  }, [props.formContext.changedKeys, path])

  const overrideLevel = fieldChanged ? 'edit' : override?.level || 'default'
  let labelStyle = {}

  if (override) {
    if (override?.inGroup) labelStyle.fontStyle = 'italic'
  }

  // Array fields

  if (
    props.schema.type === 'array' &&
    props.schema.items.type !== 'string' &&
    props.schema.layout !== 'compact'
  ) {
    let classes = []

    for (const changedPath of props.formContext.changedKeys) {
      if (arrayStartsWith(changedPath, path)) {
        classes.push('obj-override-edit')
        classes.push('group-changed')
        break
      }
    }

    if (!classes.includes('obj-override-edit')) classes.push(`obj-override-${overrideLevel}`)

    return (
      <SettingsPanel
        objId={props.id}
        title={props.schema.title}
        description={props.schema.description}
        className={classes.join(' ')}
        onMouseUp={() => {
          if (props.formContext.onSetBreadcrumbs && path) props.formContext.onSetBreadcrumbs(path)
        }}
      >
        {props.children}
      </SettingsPanel>
    )
  }

  // Leaves

  const widgetClass =
    props.schema.type === 'array' && props.schema.layout === 'compact' && props.formData?.length
      ? 'left-border'
      : ''

  // do not show error for color widgets (they are declared as strings, but
  // contains arrays. The error is not relevant for the user)
  let className = `form-inline-field ${
    props.errors.props.errors && props.schema.widget !== 'color' ? 'error' : ''
  }`

  const inlineHelp = useMemo(() => {
    return (
      props.rawDescription && (
        <div>
          <ReactMarkdown>{props.rawDescription}</ReactMarkdown>
        </div>
      )
    )
  }, [props.rawDescription])

  return (
    <>
      {divider}
      <div className={className} data-fieldid={props.id}>
        {props.label && (
          <div className={`form-inline-field-label ${overrideLevel}`}>
            <span
              onClick={() => {
                if (props.formContext.onSetBreadcrumbs)
                  props.formContext.onSetBreadcrumbs(override.path)
              }}
              style={labelStyle}
            >
              {props.label}
            </span>
          </div>
        )}
        <div className={`form-inline-field-widget ${widgetClass}`}>{props.children}</div>
        <div className="form-inline-field-help">{inlineHelp}</div>
      </div>
    </>
  )
}

const ArrayItemTemplate = (props) => {
  const parentSchema = props?.children?._owner?.memoizedProps?.schema || {}
  const itemName = props?.children?.props?.formData?.name
  let undeletable = false

  const children = props.children

  if (itemName && (parentSchema.requiredItems || []).includes(itemName)) {
    undeletable = true
    // TODO: Store this information elsewhere. since swithcing to RTK query
    // schema props are immutable! use form context maybe?

    //if (children.props.formData.name === itemName)
    //  children.props.schema.properties.name.fixedValue = itemName
  }

  const onArrayChanged = () => {
    const parentId = props.children.props.idSchema.$id.split('_').slice(0, -1).join('_')
    const formContext = props.children._owner.memoizedProps.formContext
    const path = formContext.overrides[parentId].path
    const newChangedKeys = formContext.changedKeys
      .filter((key) => !arrayEquals(key, path))
      .concat([path])
    formContext.onSetChangedKeys(newChangedKeys)
  }

  const onRemoveItem = () => {
    onArrayChanged()
    const r = props.onDropIndexClick(props.index)
    r()
  }

  const onMoveUp = () => {
    onArrayChanged()
    const r = props.onReorderClick(props.index, props.index - 1)
    r()
  }

  const onMoveDown = () => {
    onArrayChanged()
    const r = props.onReorderClick(props.index, props.index + 1)
    r()
  }

  const rmButton = props.hasRemove && (
    <div className="array-item-controls">
      <Button onClick={onRemoveItem} className="circle" icon="close" disabled={undeletable} />
      <Button onClick={onMoveUp} className="circle" icon="arrow_upward" />
      <Button onClick={onMoveDown} className="circle" icon="arrow_downward" />
    </div>
  )

  return (
    <div className="form-array-field-item">
      {children}
      {rmButton}
    </div>
  )
}

const ArrayFieldTemplate = (props) => {
  /* Complete array including the add button */

  const res = useMemo(
    () => (
      <div className="form-array-field">
        {props.items.map((element) => (
          <ArrayItemTemplate key={element.name} {...element} />
        ))}
        {props.canAdd && <Button onClick={props.onAddClick} className="circle" icon="add" />}
      </div>
    ),
    [props.items, props.canAdd],
  )

  return res
}

export { ObjectFieldTemplate, FieldTemplate, ArrayFieldTemplate }
