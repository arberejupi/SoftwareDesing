import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Department = () => {
  const [departmentList, setDepartmentList] = useState([]);
  const [universityList, setUniversityList] = useState([]);
  const [departmentID, setDepartmentID] = useState('');
  const [universityID, setUniversityID] = useState(''); // Added universityID
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [headOfDepartment, setHeadOfDepartment] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    fetchDepartmentData();
    fetchUniversityData();
  }, [setForceUpdate]);

  const fetchDepartmentData = () => {
    fetch('https://localhost:7069/api/Department')
      .then((response) => response.json())
      .then((data) => setDepartmentList(data))
      .catch((error) => console.log(error));
  };

  const fetchUniversityData = () => {
    fetch('https://localhost:7069/api/University')
      .then((response) => response.json())
      .then((data) => setUniversityList(data))
      .catch((error) => console.log(error));
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setDepartmentID('');
    setUniversityID(''); // Reset universityID on modal close
    setName('');
    setAbbreviation('');
    setHeadOfDepartment('');
    setEstablishedYear('');
    setContactEmail('');
    setContactPhone('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Department');
    setModalAction('create');
  };

  const handleShowEditModal = (department) => {
    setShowModal(true);
    setModalTitle('Edit Department');
    setModalAction('edit');
    setDepartmentID(department.department_id);
    setUniversityID(department.university_id);
    setName(department.name);
    setAbbreviation(department.abbreviation);
    setHeadOfDepartment(department.head_of_department);
    setEstablishedYear(department.established_year);
    setContactEmail(department.contact_email);
    setContactPhone(department.contact_phone);
  };

  const handleCreate = () => {
    // Validation logic
    if (!universityID || !name || !abbreviation || !headOfDepartment || !establishedYear || !contactEmail || !contactPhone) {
      setError('Please fill in all fields.');
      return;
    }

    const newDepartment = {
      university_id: universityID,
      name: name,
      abbreviation: abbreviation,
      head_of_department: headOfDepartment,
      established_year: establishedYear,
      contact_email: contactEmail,
      contact_phone: contactPhone,
    };

    // Check if department with the same name already exists
    const existingDepartment = departmentList.find((d) => d.name.toLowerCase() === newDepartment.name.toLowerCase());
    if (existingDepartment) {
      setError('A department with the same name already exists.');
      return;
    }

    fetch('https://localhost:7069/api/Department', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDepartment),
    })
      .then((response) => response.json())
      .then(() => {
        fetchDepartmentData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
    if (!universityID || !name || !abbreviation || !headOfDepartment || !establishedYear || !contactEmail || !contactPhone) {
      setError('Please fill in all fields.');
      return;
    }

    const updateDepartment = {
      department_id: departmentID,
      university_id: universityID,
      name: name,
      abbreviation: abbreviation,
      head_of_department: headOfDepartment,
      established_year: parseInt(establishedYear),
      contact_email: contactEmail,
      contact_phone: contactPhone,
    };

    fetch(`https://localhost:7069/api/Department/${departmentID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateDepartment),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchDepartmentData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Department/${id}`, {
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
        // Remove the deleted university from the state
        setDepartmentList((prevList) => prevList.filter((department) => department.department_id !== id));
      })
      .catch((error) => console.log(error));
  };
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredDepartmentList = searchText
    ? departmentList.filter((department) => department.department_id.toString().includes(searchText))
    : departmentList;

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Department</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Department ID"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Department
      </button>

      <h2>Department List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Department ID</th>
              <th>University</th>
              <th>Name</th>
              <th>Abbreviation</th>
              <th>Head of Department</th>
              <th>Established Year</th>
              <th>Contact Email</th>
              <th>Contact Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {filteredDepartmentList.map((department) => {
    // Find the corresponding university for the current department
    const correspondingUniversity = universityList.find(
      (university) => university.university_id === department.university_id
    );

    return (
      <tr key={department.department_id}>
        <td>{department.department_id}</td>
        <td>{correspondingUniversity ? correspondingUniversity.name : ''}</td>
        <td>{department.name}</td>
        <td>{department.abbreviation}</td>
        <td>{department.head_of_department}</td>
        <td>{department.established_year}</td>
        <td>{department.contact_email}</td>
        <td>{department.contact_phone}</td>
        <td>
          <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(department)}>
            Edit
          </button>
          <button
            className="btn btn-danger btn-sm ml-2"
            onClick={() => handleDelete(department.department_id)}
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
          <Form.Group controlId="universityID">
              <Form.Label>University ID:</Form.Label>
              <Form.Control as="select" value={universityID} onChange={(e) => setUniversityID(e.target.value)}>
                <option value="">Select University</option>
                {universityList.map((university) => (
                  <option key={university.university_id} value={university.university_id}>
                    {university.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="name">
              <Form.Label>Name:</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="abbreviation">
              <Form.Label>Abbreviation:</Form.Label>
              <Form.Control type="text" value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="headOfDepartment">
              <Form.Label>Head of Department:</Form.Label>
              <Form.Control type="text" value={headOfDepartment} onChange={(e) => setHeadOfDepartment(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="establishedYear">
              <Form.Label>Established Year:</Form.Label>
              <Form.Control type="number" value={establishedYear} onChange={(e) => setEstablishedYear(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="contactEmail">
              <Form.Label>Contact Email:</Form.Label>
              <Form.Control type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="contactPhone">
              <Form.Label>Contact Phone:</Form.Label>
              <Form.Control type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
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

export default Department;
