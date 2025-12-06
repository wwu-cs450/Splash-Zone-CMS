import React, {useState} from 'react';
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import Card from 'react-bootstrap/Card';
import '../css/analytics-page.css';
import HamburgerMenu from '../components/hamburger-menu';
import data from '../api/mock-user-data.json';

import { Chart as ChartJS} from 'chart.js/auto';
import {Doughnut} from 'react-chartjs-2';
import { getAllMembers } from '../api/firebase-crud';

class Member {
  constructor(id, name, email, membershipTier, joinDate) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.membershipTier = membershipTier;
    this.joinDate = joinDate;
  }
// Helper function to count members by tier
// Returns object with tier names as keys and counts as values
// e.g. { 'Basic': 10, 'Ultimate': 5, 'Delux': 2 }
function memberCountByTier(data) {
  const tierCounts = {};
  data.forEach((member) => {
    const tier = member.membershipTier;
    if (tierCounts[tier]) {
      tierCounts[tier] += 1;
    } else {
      tierCounts[tier] = 1;
    }
  });
  return tierCounts;
}

function TierChart({ data }) {
  const chartData = {
    labels: Object.keys(memberCountByTier(data)),
    datasets: [
      {
        label: 'Membership Tiers',
        data: Object.values(memberCountByTier(data)),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(41, 90, 123, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
      },
    ],
  }
  return <Doughnut data={chartData} />;
}
//const GraphView = () => <TierChart data={carData} />;
const GraphView = () => <Card body className="content-card">Place Holder for graphs and analytics that will be imported</Card>;
const DataTableView = () => <Card body className="content-card">Place Holder for data tables with raw data</Card>;
const ExportOptions = () => <Card body className="content-card">Place Holder for export options like file type or attribute selection </Card>;


function AnalyticsPage() {
  // Definition of state to track the active view
  const [members, setMembers] = useState([]);
  const [activeView, setActiveView] = useState('graphs');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);

  // Load members from Firestore
  const loadMembers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAllMembers();
      setMembers(data);
      setFilteredMembers(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load members. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
