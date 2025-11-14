import Table from 'react-bootstrap/Table';

function CustomerListPage() {
  return (
    <div>
    <h1>Active</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subscription Level</th>
            <th>ID</th>
            <th>Car Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Allison Window</td>
            <td>U</td>
            <td>301</td>
            <td>Chevy Tahoe White</td>
          </tr>
        </tbody>
      </Table>
    <h1>TORENAME: credit card declined-still needs to pay for the month and new registration form</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subscription Level</th>
            <th>ID</th>
            <th>Car Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rick Magnaghi</td>
            <td>U</td>
            <td>372</td>
            <td>Grand Cherokee Black</td>
          </tr>
        </tbody>
      </Table>
    <h1>TORENAME: not active-must pay to get a wash</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subscription Level</th>
            <th>ID</th>
            <th>Car Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Meghan Stalder</td>
            <td>U</td>
            <td>306</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

export default CustomerListPage;