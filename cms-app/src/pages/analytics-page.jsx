import React, {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';
import '../css/analytics-page.css';
import HamburgerMenu from '../components/hamburger-menu';
import data from '../api/mock-user-data.json';

import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
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
    const dict = memberCountByTier(data);
    const chartData = {
      labels: Object.keys(dict),
      datasets: [
        {
          label: 'Membership Tiers',
          data: Object.values(dict),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
        }
      ]
    }
    return <div style={{ maxWidth: '400px', margin: '20px auto', overflow: 'auto' }}><Doughnut data={chartData} /></div>;
  }

  function StatusChart({ data }) {
    const dict = memberCountByStatus(data);
    const chartData = {
      labels: Object.keys(dict),
      datasets: [
        {
          label: 'Member status distribution',
          data: Object.values(dict),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
        }
      ]
    }
    return <div style={{ maxWidth: '600px', margin: '20px auto', overflow: 'auto'}}><Bar data={chartData} /></div>;
  }

  const GraphView = () => (
    <Card body className="graph-container" >
        <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#007bff' }}>Analytics Overview</h3>
        
        {/* 1. Tier Chart - FIX: Unique key 'tier-chart' */}
        <h3 className="chart-title" style={{ fontSize: '1.2rem', marginTop: '15px' }}>Membership Tiers Distribution (Doughnut)</h3>
        <TierChart key="tier-chart" data={data}/>
        
        <div style={{ height: '2px', backgroundColor: '#eee', margin: '30px 0' }} />

        {/* 2. Status Chart - FIX: Unique key 'status-chart' */}
        <h3 className="chart-title" style={{ fontSize: '1.2rem' }}>Member Status Distribution (Bar)</h3>
        <StatusChart key="status-chart" data={data}/>
    </Card>
  );
  const DataTableView = () => <Card body className="content-card">Place Holder for data tables with raw data</Card>;
  const ExportOptions = () => <Card body className="content-card">Place Holder for export options like file type or attribute selection </Card>;

  // Function to render content based on state
  const renderTab = () => {
    switch (activeView) {
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