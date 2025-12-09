import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/customer-list-page.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
// MembersPage.jsx
import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  InputGroup,
  Spinner,
  Alert,
  Modal,
  Card,
} from 'react-bootstrap';

import { useMembers } from '../context/MembersContext';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import HamburgerMenu from '../components/hamburger-menu';

function MembersPage() {
  const { members, isLoading, error: contextError, createMember, updateMember, deleteMember } = useMembers();

  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Add Member form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    id: '',
    name: '',
    car: '',
    isActive: true,
    validPayment: true,
    notes: '',
  });

  // Edit Member modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    name: '',
    car: '',
    isActive: true,
    validPayment: true,
    notes: '',
  });

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const [filterSubscription, setFilterSubscription] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  const handleExportExcel = async (members) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Members');

    // Add header row
    worksheet.addRow(['ID', 'Name', 'Car', 'Active', 'Valid Payment', 'Notes']);

    // Add data rows
    members.forEach((m) => {
      const row = worksheet.addRow([
        m.id,
        m.name,
        m.car,
        m.isActive ? 'Yes' : 'No',
        m.validPayment ? 'Yes' : 'No',
        m.notes,
      ]);

      // Apply row color based on status
      if (!m.isActive) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFAAAAAA' }, // gray
          };
        });
      } else if (!m.validPayment) {
        row.eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF99' }, // yellow
          };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'CustomerList.xlsx');
  };

  // Filter members whenever searchTerm or members changes
  useEffect(() => {
    const term = (searchTerm || '').trim().toLowerCase();

    const filtered = (members || []).filter((m) => {
      // --- Search Term Filtering ---
      const name = (m.name || '').toLowerCase();
      const id = (m.id || '').toString().toLowerCase();

      // Determine subscription level
      // Priority: explicit subscription field, otherwise take first letter of ID
      const subscription =
        (m.subscription || (m.id ? m.id[0] : '')).toUpperCase();
      if (filterSubscription !== 'all' && subscription !== filterSubscription) return false;

      const subscriptionId = (m.subscriptionId || m.subId || '').toString().toLowerCase();

      let matchesSearch =
        !term ||
        name.includes(term) ||
        id.includes(term) ||
        (subscription + id).replace(/\s+/g, '').includes(term) ||
        subscriptionId.includes(term);

      if (!matchesSearch) return false;

      // --- Subscription Filter ---
      if (filterSubscription !== 'all' && subscription !== filterSubscription) return false;

      // --- Active Filter ---
      const isActive = m.isActive === true || m.isActive === 'true';
      if (filterActive === 'active' && !isActive) return false;
      if (filterActive === 'inactive' && isActive) return false;

      // --- Payment Filter ---
      const hasPayment = m.validPayment === true || m.validPayment === 'true';
      if (filterPayment === 'paid' && !hasPayment) return false;
      if (filterPayment === 'needed' && hasPayment) return false;

      return true;
    });

    setFilteredMembers(filtered);
  }, [searchTerm, members, filterSubscription, filterActive, filterPayment]);


  // Handle Add Member form changes
  const handleAddInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!addForm.id.trim() || !addForm.name.trim()) {
      setError('ID and Name are required to create a member.');
      return;
    }

    try {
      await createMember(
        addForm.id.trim(),
        addForm.name.trim(),
        addForm.car.trim(),
        addForm.isActive,
        addForm.validPayment,
        addForm.notes.trim()
      );
      // Reset form
      setAddForm({
        id: '',
        name: '',
        car: '',
        isActive: true,
        validPayment: true,
        notes: '',
      });
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      setError('Failed to create member. Please check the console for details.');
    }
  };

  // Open edit modal for a member
  const handleOpenEditModal = (member) => {
    setEditForm({
      id: member.id,
      name: member.name || '',
      car: member.car || '',
      isActive: !!member.isActive,
      validPayment: !!member.validPayment,
      notes: member.notes || '',
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editForm.id.trim() || !editForm.name.trim()) {
      setError('ID and Name are required.');
      return;
    }

    try {
      const updates = {
        name: editForm.name.trim(),
        car: editForm.car.trim(),
        isActive: editForm.isActive,
        validPayment: editForm.validPayment,
        notes: editForm.notes.trim(),
      };

      await updateMember(editForm.id, updates);
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      setError('Failed to update member. Please check the console for details.');
    }
  };

  // Delete flow
  const handleOpenDeleteModal = (member) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setError('');
    try {
      await deleteMember(memberToDelete.id);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete member. Please check the console for details.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  return (
    <>
      <HamburgerMenu />
      <Container className="my-4">
        <Row className="mb-3">
          <Col>
            <h2>Customer List</h2>
          </Col>
        </Row>

      {(error || contextError) && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error || contextError}</Alert>
          </Col>
      </Row>
      )}

      {/* Search + Add button row */}
      <Row className="align-items-center mb-3">
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by Name or 'Subscription Letter + ID'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Form.Select
            className="w-25 me-2"
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value)}
          >
            <option value="all">All Subscription Levels</option>
            <option value="B">B (Basic)</option>
            <option value="D">D (Deluxe)</option>
            <option value="U">U (Ultimate)</option>
          </Form.Select>

          <Form.Select
            className="w-25 me-2"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
          >
            <option value="all">All Members</option>
            <option value="active">Active Members</option>
            <option value="inactive">Inactive Members</option>
          </Form.Select>

          <Form.Select
            className="w-25"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="all">All Payment Status</option>
            <option value="paid">Active Payment</option>
            <option value="needed">Payment Needed</option>
          </Form.Select>

        </Col>
        <Col md={4} className="text-md-end mt-2 mt-md-0">
          <Button
            variant={showAddForm ? 'secondary' : 'primary'}
            onClick={() => setShowAddForm((prev) => !prev)}
          >
            {showAddForm ? 'Close Add Member' : '+ Add Member'}
          </Button>
          <Button variant="outline-primary" size="sm" onClick={() => handleExportExcel(filteredMembers)} // Make sure this is an array
            >
              Export
            </Button>
        </Col>
      </Row>

      {/* Add Member form */}
      {showAddForm && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Add New Member</Card.Title>
                <Form onSubmit={handleAddSubmit}>
                  <Row className="mb-3">
                    <Col md={4}>
                      <Form.Group controlId="addId">
                        <Form.Label>User ID</Form.Label>
                        <Form.Control
                          type="text"
                          name="id"
                          value={addForm.id}
                          onChange={handleAddInputChange}
                          placeholder="e.g. ABCD"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="addName">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={addForm.name}
                          onChange={handleAddInputChange}
                          placeholder="Full name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="addCar">
                        <Form.Label>Car</Form.Label>
                        <Form.Control
                          type="text"
                          name="car"
                          value={addForm.car}
                          onChange={handleAddInputChange}
                          placeholder="Car info"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={3}>
                      <Form.Group controlId="addIsActive">
                        <Form.Check
                          type="checkbox"
                          label="Active"
                          name="isActive"
                          checked={addForm.isActive}
                          onChange={handleAddInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group controlId="addValidPayment">
                        <Form.Check
                          type="checkbox"
                          label="Valid Payment"
                          name="validPayment"
                          checked={addForm.validPayment}
                          onChange={handleAddInputChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="addNotes">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          name="notes"
                          value={addForm.notes}
                          onChange={handleAddInputChange}
                          placeholder="Additional notes"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="text-end">
                    <Button type="submit" variant="success">
                      Create Member
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Members table in scrollable box */}
      <Row>
        <Col>
          <div
            className="border rounded"
            style={{ maxHeight: '400px', overflowY: 'auto' }}
          >
            {isLoading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" role="status" className="me-2" />
                <span>Loading members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-3 text-center text-muted">
                No members found.
              </div>
            ) : (
              <Table hover size="sm" className="mb-0">
                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Car</th>
                    <th>Active</th>
                    <th>Valid Payment</th>
                    <th>Notes</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => {
                    // normalize values so strings like "false" or "0" still work
                    const isActive =
                      member.isActive === true ||
                      member.isActive === 'true' ||
                      member.isActive === 1 ||
                      member.isActive === '1';

                    const validPayment =
                      member.validPayment === true ||
                      member.validPayment === 'true' ||
                      member.validPayment === 1 ||
                      member.validPayment === '1';

                    // Priority: inactive (gray) overrides payment issue
                    // We don't consider casees where a customer has is both inactive and has payment issues
                    let rowClass = '';
                    if (!isActive) {
                      rowClass = 'member-row--inactive';
                    } else if (!validPayment) {
                      rowClass = 'member-row--payment-issue';
                    }

                    return (
                      <tr key={member.id} className={rowClass}>
                        <td>{member.id}</td>
                        <td>{member.name}</td>
                        <td>{member.car}</td>
                        <td>{isActive ? 'Yes' : 'No'}</td>
                        <td>{validPayment ? 'Yes' : 'No'}</td>
                        <td>{member.notes}</td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenEditModal(member)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(member)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        </Col>
      </Row>

      {/* Edit Member Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="editId">
              <Form.Label>User ID (read-only)</Form.Label>
              <Form.Control type="text" value={editForm.id} disabled />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editCar">
              <Form.Label>Car</Form.Label>
              <Form.Control
                type="text"
                name="car"
                value={editForm.car}
                onChange={handleEditInputChange}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="editIsActive">
                  <Form.Check
                    type="checkbox"
                    label="Active"
                    name="isActive"
                    checked={editForm.isActive}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editValidPayment">
                  <Form.Check
                    type="checkbox"
                    label="Valid Payment"
                    name="validPayment"
                    checked={editForm.validPayment}
                    onChange={handleEditInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="editNotes">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={editForm.notes}
                onChange={handleEditInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {memberToDelete ? (
            <>
              Are you sure you want to delete member{' '}
              <strong>{memberToDelete.name}</strong> (ID: {memberToDelete.id})?
              This action cannot be undone.
            </>
          ) : (
            'Are you sure you want to delete this member?'
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      </Container>
    </>
  );
}

export default MembersPage;
