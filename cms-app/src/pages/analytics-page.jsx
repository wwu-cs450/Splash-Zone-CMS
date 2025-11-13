import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';

const GraphView = () => <Card body>Place Holder for graphs and analytics that will be imported </Card>;
const DataTableView = () => <Card body>Place Holder for data tables with "raw" data</Card>;
const ExportOptions = () => <Card body>Place Holder for export options like file type or attribute selection</Card>;



function AnalyticsPage() {
  // Definition of state to track the active view
  const [activeView, setActiveView] = useState('graphs');

  // Function to render content based on state
  const renderTab = () => {
    switch(activeView) {
      case 'graphs': return <GraphView />;
      case 'data': return <DataTableView />;
      case 'export': return <ExportOptions />;
      default: return <p>How did we get here?</p> // should never happen. Little Joke
    }
  }

  // Main render
  return (
    <div className="p-4">
      <h1 className="mb-4">Analytics Dashboard</h1>
      <Stack direction="horizontal" gap={3} className='mb-4'>
        <Button variant={activeView === 'graphs' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('graphs')}>
          View Graphs
        </Button>
        <Button variant={activeView === 'data' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('data')}>
          View Raw Data
        </Button>
        <Button variant={activeView === 'export' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('export')}>
          Export Data
        </Button>
      </Stack>
      {renderTab()}
    </div>
  );
}

export default AnalyticsPage;
