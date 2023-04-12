import { toast } from 'react-toastify'
import { useState, useMemo, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TablePanel, Button, Section, Toolbar, InputText } from 'ayon-react-components-test'
import AttributeEditor from '../../containers/attributes/attributeEditor'
import { useGetAttributesQuery } from '/src/services/getAttributes'
import { useUpdateAttributesMutation } from '/src/services/updateAttributes'
import useSearchFilter from '/src/hooks/useSearchFilter'

const Attributes = () => {
  const [attributes, setAttributes] = useState([])
  const [selectedAttribute, setSelectedAttribute] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const { data, isLoading, isError, error, isFetching } = useGetAttributesQuery()

  const [updateAttributes, { isLoading: updateLoading }] = useUpdateAttributesMutation()

  // when new data is loaded come in update local state
  useEffect(() => {
    if (data && !updateLoading && !isFetching) {
      setAttributes(data)
    }
  }, [data, isLoading, isFetching, updateLoading])

  if (isError) {
    console.error(error)
    toast.error('Unable to load attribute list')
  }

  // used to disallow adding a new attribute with existing name
  // seriously. the syntax is terrible. compare the following:
  // existingAttrNames = [attr.name for attr in attributes] if attributes else []
  const existingAttrNames = useMemo(
    () => (attributes ? attributes.map((i) => i.name) : []),
    [attributes],
  )

  const onSave = async () => {
    await updateAttributes({ attributes, deleteMissing: true, patches: attributes })
      .unwrap()
      .then(() => {
        toast.success('Attribute set saved')
      })
      .catch((err) => {
        console.error(err)
        toast.error('Unable to set attributes')
      })
  }

  const onEdit = (attribute) => {
    const index = attributes.findIndex((v) => v.name === attribute.name)
    let newAttributes = [...attributes]
    if (index === -1) {
      // creating new attribute
      newAttributes.push(attribute)
    } else {
      // updating existing attribute
      newAttributes.splice(index, 1, attribute)
    }

    setAttributes(newAttributes)

    setSelectedAttribute(attribute)
    setShowEditor(false)
  }

  const onRowReorder = (e) => {
    const rows = e.value
    let i = 0
    for (const row of rows) {
      row.position = i
      i++
    }
    setAttributes(rows)
  }

  const onNewAttribute = () => {
    setSelectedAttribute(null)
    setShowEditor(true)
  }

  const onDelete = () => {
    if (!selectedAttribute?.name || Array.isArray(selectedAttribute)) return
    setAttributes((attrs) => {
      return attrs.filter((attr) => attr.name !== selectedAttribute.name)
    })
  }

  // for sortable fields
  let sortableAttributes = attributes.map((a) => ({ ...a, scopeLength: a?.scope.length }))

  const searchableFields = ['name', 'data.title', 'scope', 'data.type']

  const [search, setSearch, filteredData] = useSearchFilter(
    searchableFields,
    sortableAttributes,
    'attributes',
  )

  return (
    <main>
      {showEditor && (
        <AttributeEditor
          attribute={selectedAttribute}
          existingNames={existingAttrNames}
          onEdit={onEdit}
          onHide={() => setShowEditor(false)}
        />
      )}
      <Section>
        <Toolbar>
          <Button label="Save settings" icon="check" onClick={onSave} />
          <Button label="Add attribute" icon="add" onClick={onNewAttribute} />
          <Button
            label="Delete attribute"
            icon="delete"
            disabled={selectedAttribute?.builtin}
            onClick={onDelete}
          />
          <InputText
            style={{ width: '200px' }}
            placeholder="Filter attributes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Toolbar>
        <TablePanel loading={isLoading || updateLoading || isFetching}>
          <DataTable
            scrollable="true"
            scrollHeight="flex"
            dataKey="name"
            value={filteredData}
            reorderableRows
            onRowReorder={onRowReorder}
            selectionMode="single"
            selection={selectedAttribute}
            onSelectionChange={(e) => setSelectedAttribute(e.value)}
            onRowDoubleClick={() => !Array.isArray(selectedAttribute) && setShowEditor(true)}
            resizableColumns
          >
            <Column rowReorder style={{ maxWidth: 30 }} />
            <Column field="name" header="Name" style={{ maxWidth: 130 }} sortable />
            <Column field="data.title" header="Title" style={{ maxWidth: 130 }} sortable />
            <Column
              field="builtin"
              header=""
              style={{ maxWidth: 60 }}
              body={(rowData) => (rowData?.builtin ? 'built-in' : '')}
              sortable
            />
            <Column
              header="Scopes"
              field="scopeLength"
              body={(rowData) => rowData.scope.join(', ')}
              style={{ maxWidth: 330 }}
              sortable
            />
            <Column field="data.type" header="Type" style={{ maxWidth: 150 }} sortable />
            <Column field="data.example" header="Example" style={{ maxWidth: 200 }} sortable />
            <Column field="data.description" header="Description" sortable />
            <Column field="data.inherit" header="Inherit" sortable style={{ maxWidth: 80 }} />
          </DataTable>
        </TablePanel>
      </Section>
    </main>
  )
}

export default Attributes
