import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Management = () => {
  const [managementList, setManagementList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [managementID, setManagementID] = useState('');
  const [position, setPosition] = useState('');
  const [userID, setUserID] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    fetchManagementData();
    fetchUserData();
  }, [setForceUpdate]);

  const fetchManagementData = () => {
    fetch('https://localhost:7069/api/Management')
      .then((response) => response.json())
      .then((data) => setManagementList(data))
      .catch((error) => console.log(error));
  };

  const fetchUserData = () => {
    fetch('https://localhost:7069/api/auth')
      .then((response) => response.json())
      .then((data) => setUserList(data))
      .catch((error) => console.log(error));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setManagementID('');
    setPosition('');
    setUserID('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Management');
    setModalAction('create');
  };

  const handleShowEditModal = (management) => {
    setShowModal(true);
    setModalTitle('Edit Management');
    setModalAction('edit');
    setManagementID(management.management_id);
    setPosition(management.position);
    setUserID(management.user_id);
  };

  const handleCreate = () => {
    // Validation logic
    if (!position || !userID) {
      setError('Please fill in all fields.');
      return;
    }

    const newManagement = {
      position: position,
      user_id: userID,
    };

    // Check if management with the same user already exists
    const existingManagement = managementList.find((m) => m.user_id === newManagement.user_id);
    if (existingManagement) {
      setError('Management for the selected user already exists.');
      return;
    }

    fetch('https://localhost:7069/api/Management', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newManagement),
    })
      .then((response) => response.json())
      .then(() => {
        fetchManagementData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
    if (!position || !userID) {
      setError('Please fill in all fields.');
      return;
    }

    const updateManagement = {
      management_id: managementID,
      position: position,
      user_id: userID,
    };

    fetch(`https://localhost:7069/api/Management/${managementID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateManagement),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchManagementData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Management/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete the record.');
        }
  
        // Check if the response has a content type of 'application/json'
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          // Parse the JSON only if the content type is 'application/json'
          return response.json();
        } else {
          // Return an empty object if there is no JSON content
          return {};
        }
      })
      .then(() => {
        // Remove the deleted management from the state
        setManagementList((prevList) => prevList.filter((management) => management.management_id !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredManagementList = searchText
    ? managementList.filter((management) => management.management_id.toString().includes(searchText))
    : managementList;

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Management</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Management ID"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Management
      </button>

      <h2>Management List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Management ID</th>
              <th>Position</th>
              <th>User</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {filteredManagementList.map((management) => {
    // Find the corresponding user for the current management
    const correspondingUser = userList.find(
      (user) => user.user_id === management.user_id
    );

    return (
      <tr key={management.management_id}>
        <td>{management.management_id}</td>
        <td>{management.position}</td>
        <td>{correspondingUser ? correspondingUser.username : ''}</td>
        <td>
          <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(management)}>
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm ml-2"
            onClick={() => handleDelete(management.management_id)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  })}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <p className="text-danger">{error}</p>}
          <Form>
            <Form.Group controlId="position">
              <Form.Label>Position:</Form.Label>
              <Form.Control type="text" value={position} onChange={(e) => setPosition(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="userID">
              <Form.Label>User:</Form.Label>
              <Form.Control as="select" value={userID} onChange={(e) => setUserID(e.target.value)}>
                <option value="">Select User</option>
                {userList.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.username}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          {modalAction === 'create' && (
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          )}
          {modalAction === 'edit' && (
            <Button variant="primary" onClick={handleUpdate}>
              Update
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Management;
