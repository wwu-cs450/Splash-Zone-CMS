// -import '../css/customer-list-page.css';
// +import styles from '../css/customer-list-page.module.css';
//  import 'bootstrap/dist/css/bootstrap.min.css'; // page-only import
// import Table from 'react-bootstrap/Table';
// import Breadcrumb from "react-bootstrap/Breadcrumb";

// function CustomerListPage() {
//   return (
//     <div>
//       <div className="d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4">
//         <div className="mb-4 mb-lg-0">
//           <Breadcrumb>
//             <Breadcrumb.Item href="#">
//               <FontAwesomeIcon icon={faHome} />
//             </Breadcrumb.Item>
//             <Breadcrumb.Item href="#">Volt</Breadcrumb.Item>
//             <Breadcrumb.Item active>Users List</Breadcrumb.Item>
//           </Breadcrumb>
//           <h4>Users List</h4>
//           <p className="mb-0">Your web analytics dashboard template.</p>
//         </div>
//       </div>
//     <h1>Active</h1>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Subscription Level</th>
//             <th>ID</th>
//             <th>Car Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>Allison Window</td>
//             <td>U</td>
//             <td>301</td>
//             <td>Chevy Tahoe White</td>
//           </tr>
//         </tbody>
//       </Table>
//     <h1>TORENAME: credit card declined-still needs to pay for the month and new registration form</h1>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Subscription Level</th>
//             <th>ID</th>
//             <th>Car Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>Rick Magnaghi</td>
//             <td>U</td>
//             <td>372</td>
//             <td>Grand Cherokee Black</td>
//           </tr>
//         </tbody>
//       </Table>
//     <h1>TORENAME: not active-must pay to get a wash</h1>
//       <Table striped bordered hover>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Subscription Level</th>
//             <th>ID</th>
//             <th>Car Type</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>Meghan Stalder</td>
//             <td>U</td>
//             <td>306</td>
//             <td></td>
//           </tr>
//         </tbody>
//       </Table>
//     </div>
//   );
// }

// export default CustomerListPage;

// ...existing code...
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../css/customer-list-page.module.css';
import Table from 'react-bootstrap/Table';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

function CustomerListPage() {
  const activeCustomers = [
    { id: 301, name: 'Allison Window', subscription: 'U', car: 'Chevy Tahoe White' },
  ];

  const pendingPayment = [
    { id: 372, name: 'Rick Magnaghi', subscription: 'U', car: 'Grand Cherokee Black' },
  ];

  const inactive = [
    { id: 306, name: 'Meghan Stalder', subscription: 'U', car: '' },
  ];

  const renderRows = (list) =>
    list.map((c) => (
      <tr key={c.id}>
        <td>{c.name}</td>
        <td>{c.subscription}</td>
        <td>{c.id}</td>
        <td>{c.car}</td>
      </tr>
    ));

  return (
    <div className={styles.customerList}>
      <div
        className={`d-lg-flex justify-content-between flex-wrap flex-md-nowrap align-items-center py-4 ${styles.header}`}
      >
        <div className="mb-4 mb-lg-0">
          <Breadcrumb>
            <Breadcrumb.Item href="#">
              <FontAwesomeIcon icon={faHome} />
            </Breadcrumb.Item>
            <Breadcrumb.Item active>Customer List</Breadcrumb.Item>
          </Breadcrumb>
          <h4 className={styles.title}>Customer List</h4>
          <p className={`${styles.subtitle} mb-0`}>Your Customer List Dashboard</p>
        </div>
      </div>

      <h1 className={styles.sectionTitle}>Active</h1>
      <div className={styles.tableWrapper}>
        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subscription Level</th>
              <th>ID</th>
              <th>Car Type</th>
            </tr>
          </thead>
          <tbody>{renderRows(activeCustomers)}</tbody>
        </Table>
      </div>

      <h1 className={styles.sectionTitle}>Pending Payment</h1>
      <div className={styles.tableWrapper}>
        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subscription Level</th>
              <th>ID</th>
              <th>Car Type</th>
            </tr>
          </thead>
          <tbody>{renderRows(pendingPayment)}</tbody>
        </Table>
      </div>

      <h1 className={styles.sectionTitle}>Inactive</h1>
      <div className={styles.tableWrapper}>
        <Table striped bordered hover className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Subscription Level</th>
              <th>ID</th>
              <th>Car Type</th>
            </tr>
          </thead>
          <tbody>{renderRows(inactive)}</tbody>
        </Table>
      </div>
    </div>
  );
}

export default CustomerListPage;
// ...existing code...