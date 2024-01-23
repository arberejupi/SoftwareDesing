import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Student = () => {
  const [studentList, setStudentList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [studentID, setStudentID] = useState('');
  const [userID, setUserID] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [departmentID, setDepartmentID] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    fetchStudentData();
    fetchUserData();
    fetchDepartmentData();
  }, [setForceUpdate]);

  const fetchStudentData = () => {
    fetch('https://localhost:7069/api/Student')
      .then((response) => response.json())
      .then((data) => setStudentList(data))
      .catch((error) => console.log(error));
  };

  const fetchUserData = () => {
    fetch('https://localhost:7069/api/auth')
      .then((response) => response.json())
      .then((data) => setUserList(data))
      .catch((error) => console.log(error));
  };

  const fetchDepartmentData = () => {
    fetch('https://localhost:7069/api/Department')
      .then((response) => response.json())
      .then((data) => setDepartmentList(data))
      .catch((error) => console.log(error));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setStudentID('');
    setUserID('');
    setDateOfBirth('');
    setGender('');
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setDepartmentID('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Student');
    setModalAction('create');
  };

  const handleShowEditModal = (student) => {
    setShowModal(true);
    setModalTitle('Edit Student');
    setModalAction('edit');
    setStudentID(student.student_id);
    setUserID(student.user_id);
    setDateOfBirth(student.date_of_birth);
    setGender(student.gender);
    setEmail(student.email);
    setPhoneNumber(student.phone_number);
    setAddress(student.address);
    setDepartmentID(student.department_id);
  };

  const handleCreate = () => {
    // Validation logic
    if (!userID || !dateOfBirth || !gender || !email || !phoneNumber || !address || !departmentID) {
      setError('Please fill in all fields.');
      return;
    }

    const newStudent = {
      user_id: userID,
      date_of_birth: dateOfBirth,
      gender: gender,
      email: email,
      phone_number: phoneNumber,
      address: address,
      department_id: departmentID,
    };

    fetch('https://localhost:7069/api/Student', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newStudent),
    })
      .then((response) => response.json())
      .then(() => {
        fetchStudentData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
    if (!userID || !dateOfBirth || !gender || !email || !phoneNumber || !address || !departmentID) {
      setError('Please fill in all fields.');
      return;
    }

    const updateStudent = {
      student_id: studentID,
      user_id: userID,
      date_of_birth: dateOfBirth,
      gender: gender,
      email: email,
      phone_number: phoneNumber,
      address: address,
      department_id: departmentID,
    };

    fetch(`https://localhost:7069/api/Student/${studentID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateStudent),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchStudentData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Student/${id}`, {
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
        // Remove the deleted student from the state
        setStudentList((prevList) => prevList.filter((student) => student.student_id !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredStudentList = searchText
    ? studentList.filter((student) => student.student_id.toString().includes(searchText))
    : studentList;

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Student</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Student ID"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Student
      </button>

      <h2>Student List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Username - Name - Suranme</th>
              <th>Date of Birth</th>
              <th>Gender</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Address</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudentList.map((student) => {
              // Find the corresponding user for the current student
              const correspondingUser = userList.find((user) => user.user_id === student.user_id);

              // Find the corresponding department for the current student
              const correspondingDepartment = departmentList.find(
                (department) => department.department_id === student.department_id
              );

              return (
                <tr key={student.student_id}>
                  <td>{student.student_id}</td>
                  <td>{correspondingUser ? `${correspondingUser.username} - ${correspondingUser.name} - ${correspondingUser.surname}` : ''}</td>
                  <td>{student.date_of_birth}</td>
                  <td>{student.gender}</td>
                  <td>{student.email}</td>
                  <td>{student.phone_number}</td>
                  <td>{student.address}</td>
                  <td>{correspondingDepartment ? correspondingDepartment.name : ''}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(student)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm ml-2"
                      onClick={() => handleDelete(student.student_id)}
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

            <Form.Group controlId="dateOfBirth">
              <Form.Label>Date of Birth:</Form.Label>
              <Form.Control type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="gender">
                <Form.Label>Gender:</Form.Label>
                <Form.Control as="select" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                </Form.Control>
            </Form.Group>


            <Form.Group controlId="email">
              <Form.Label>Email:</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="phoneNumber">
              <Form.Label>Phone Number:</Form.Label>
              <Form.Control type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="address">
              <Form.Label>Address:</Form.Label>
              <Form.Control type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="departmentID">
              <Form.Label>Department:</Form.Label>
              <Form.Control as="select" value={departmentID} onChange={(e) => setDepartmentID(e.target.value)}>
                <option value="">Select Department</option>
                {departmentList.map((department) => (
                  <option key={department.department_id} value={department.department_id}>
                    {department.name}
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

export default Student;
