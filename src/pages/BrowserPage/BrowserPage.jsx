import { Splitter, SplitterPanel } from 'primereact/splitter'
import { Section } from 'ayon-react-components-test'

import Hierarchy from '/src/containers/hierarchy'
import TaskList from '/src/containers/taskList'

import Subsets from './Subsets'
import Detail from './detail/Detail'
import TagsEditorContainer from '/src/containers/tagsEditor'

const BrowserPage = () => {
  return (
    <main>
      <Splitter
        layout="horizontal"
        style={{ width: '100%', height: '100%' }}
        stateKey="browser-splitter-1"
      >
        <SplitterPanel size={18} style={{ minWidth: 250, maxWidth: 600 }}>
          <Section className="wrap">
            <Hierarchy />
            <TaskList style={{ maxHeight: 300 }} />
          </Section>
        </SplitterPanel>
        <SplitterPanel size={82}>
          <Splitter layout="horizontal" style={{ height: '100%' }} stateKey="browser-splitter-2">
            <SplitterPanel style={{ minWidth: 500 }}>
              <Subsets />
            </SplitterPanel>
            <SplitterPanel style={{ minWidth: 250, maxWidth: 480 }}>
              <Detail />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>

      <TagsEditorContainer />
    </main>
  )
}

export default BrowserPage
