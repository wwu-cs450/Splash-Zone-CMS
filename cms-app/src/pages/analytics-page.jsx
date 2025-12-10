import React, {useState, useEffect, useRef} from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';
import '../css/analytics-page.css';
import HamburgerMenu from '../components/hamburger-menu';
import data from '../api/mock-user-data.json';

import {Bar, Doughnut} from 'react-chartjs-2';

function AnalyticsPage() {
  // Definition of state to track the active view
  const [activeView, setActiveView] = useState('data');

  // Helper function to count members by tier
  // Returns object with tier names as keys and counts as values
  // e.g. { 'Basic': 10, 'Ultimate': 5, 'Delux': 2 }
  function memberCountByTier(data) {
    const tierCounts = {};
    data.forEach((member) => {
      const tier = member.memberTierCode;
      if (tierCounts[tier]) {
        tierCounts[tier] += 1;
      } else {
        tierCounts[tier] = 1;
      }
    });
    return tierCounts;
  }

  function memberCountByStatus(data) {
    const statusCounts = {};
    data.forEach((member) => {
      const isActive = member.isActive;
      const current = member.dataUpdated;
      let status;

      if (isActive) {
        if (current) {
          status = 'Active & Current';
        } else {
          status = 'Active & Not Current';
        }
      } else {
        if (current) {
          status = 'Inactive & Current';
        }
        else {
          status = 'Inactive & Not Current';
        }
      } 

      // Count status occurrences
      if (statusCounts[status]) {
        statusCounts[status] += 1;
      } else {
        statusCounts[status] = 1;
      }
    });
    return statusCounts;
  }

  function TierChart({ data }) {
    useEffect(() => () => {}, []);
    const dict = memberCountByTier(data);
    const chartData = {
      labels: Object.keys(dict),
      datasets: [
        {
          label: 'Membership Tiers',
          data: Object.values(dict),
        }
      ]
    }
    return <Doughnut data={chartData} />;
  }

  function StatusChart({ data }) {
    useEffect(() => () => {}, []);
    const dict = memberCountByStatus(data);
    const chartData = {
      labels: Object.keys(dict),
      datasets: [
        {
          label: 'Member status distribution',
          data: Object.values(dict),
        }
      ]
    }
    return <Bar data={chartData} />;
  }

  const GraphView = () => (
    <Card body className="content-card">
      <h3 className="chart-title">Membership Tiers Distribution</h3>
      <TierChart key="tier-chart" data={data}/>
      <br />
      <h3 className="chart-title">Placeholder for Additional Graphs</h3>
      <StatusChart key="tier-chart" data={data}/>
    </Card>
  );
  const DataTableView = () => <Card body className="content-card">Place Holder for data tables with raw data</Card>;
  const ExportOptions = () => <Card body className="content-card">Place Holder for export options like file type or attribute selection </Card>;

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
    <div className="analytics-page-wrapper">
      <HamburgerMenu />
      <h1 className="dashboard-title">Analytics Dashboard</h1>
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