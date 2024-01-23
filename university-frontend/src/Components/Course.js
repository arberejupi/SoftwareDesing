import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Course = () => {
  const [courseList, setCourseList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [courseID, setCourseID] = useState('');
  const [departmentID, setDepartmentID] = useState('');
  const [teacherID, setTeacherID] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [creditHours, setCreditHours] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [teacherUserDetails, setTeacherUserDetails] = useState({});


  useEffect(() => {
    fetchCourseData();
    fetchDepartmentData();
    fetchTeacherData();
    setTeacherUserDetailsLoaded(true); // Set teacherUserDetailsLoaded to true when the component is mounted
  }, [setForceUpdate]);
  

  const fetchCourseData = () => {
    fetch('https://localhost:7069/api/Course')
      .then((response) => response.json())
      .then((data) => setCourseList(data))
      .catch((error) => console.log(error));
  };

  const fetchDepartmentData = () => {
    fetch('https://localhost:7069/api/Department')
      .then((response) => response.json())
      .then((data) => setDepartmentList(data))
      .catch((error) => console.log(error));
  };

  const fetchTeacherData = () => {
    fetch('https://localhost:7069/api/Teachers')
      .then((response) => response.json())
      .then(async (data) => {
        const teacherDetailsWithUser = [];
  
        for (const teacher of data) {
          const userResponse = await fetch(`https://localhost:7069/api/auth/${teacher.user_id}`);
          const user = await userResponse.json();
  
          teacherDetailsWithUser.push({ ...teacher, user });
        }
  
        setTeacherList(teacherDetailsWithUser);
      })
      .catch((error) => console.log(error));
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setCourseID('');
    setDepartmentID('');
    setTeacherID('');
    setName('');
    setCode('');
    setDescription('');
    setCreditHours('');
    setStartDate('');
    setEndDate('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Course');
    setModalAction('create');
  };

  const [teacherUserDetailsLoaded, setTeacherUserDetailsLoaded] = useState(false);
  const handleShowEditModal = (course) => {
    setShowModal(true);
    setModalTitle('Edit Course');
    setModalAction('edit');
    setCourseID(course.course_id);
    setDepartmentID(course.department_id);
    setTeacherID(course.teacher_id);
  
    // Reset user details state
    setTeacherUserDetails({});
    setTeacherUserDetailsLoaded(false);
  
    // Fetch teacher details
    fetch(`https://localhost:7069/api/Teachers/${course.teacher_id}`)
      .then((response) => response.json())
      .then((teacherDetails) => {
        // Fetch user details based on user_id
        return fetch(`https://localhost:7069/api/auth/${teacherDetails.user_id}`);
      })
      .then((userResponse) => userResponse.json())
      .then((user) => {
        // Set state with user details
        setTeacherUserDetails(user);
        setTeacherUserDetailsLoaded(true);
  
        // Set other course details
        setName(course.name);
        setCode(course.code);
        setDescription(course.description);
        setCreditHours(course.credit_hours);
        setStartDate(course.start_date);
        setEndDate(course.end_date);
      })
      .catch((error) => console.log(error));
  };
  
  
  
  

  const handleCreate = () => {
    // Validation logic
    if (
      !departmentID ||
      !teacherID ||
      !name ||
      !code ||
      !description ||
      !creditHours ||
      !startDate ||
      !endDate
    ) {
      setError('Please fill in all fields.');
      return;
    }

    const newCourse = {
      department_id: departmentID,
      teacher_id: teacherID,
      name: name,
      code: code,
      description: description,
      credit_hours: creditHours,
      start_date: startDate,
      end_date: endDate,
    };

    // Check if course with the same name already exists
    const existingCourse = courseList.find((c) => c.name.toLowerCase() === newCourse.name.toLowerCase());
    if (existingCourse) {
      setError('A course with the same name already exists.');
      return;
    }

    fetch('https://localhost:7069/api/Course', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCourse),
    })
      .then((response) => response.json())
      .then(() => {
        fetchCourseData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
    if (
      !departmentID ||
      !teacherID ||
      !name ||
      !code ||
      !description ||
      !creditHours ||
      !startDate ||
      !endDate
    ) {
      setError('Please fill in all fields.');
      return;
    }

    const updateCourse = {
      course_id: courseID,
      department_id: departmentID,
      teacher_id: teacherID,
      name: name,
      code: code,
      description: description,
      credit_hours: creditHours,
      start_date: startDate,
      end_date: endDate,
    };

    fetch(`https://localhost:7069/api/Course/${courseID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateCourse),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchCourseData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Course/${id}`, {
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
        // Remove the deleted course from the state
        setCourseList((prevList) => prevList.filter((course) => course.course_id !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredCourseList = searchText
    ? courseList.filter((course) => course.course_id.toString().includes(searchText))
    : courseList;

   
      
  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Course</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Course ID"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Course
      </button>

      <h2>Course List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Department</th>
              <th>Teacher</th>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Credit Hours</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {filteredCourseList.map((course) => {
    // Find the corresponding department for the current course
    const correspondingDepartment = departmentList.find(
      (department) => department.department_id === course.department_id
    );
    // Find the corresponding teacher for the current course
    const correspondingTeacher = teacherList.find((teacher) => teacher.teacher_id === course.teacher_id);

    // Check if teacher details are loaded
    const teacherDetailsLoaded = teacherUserDetailsLoaded && correspondingTeacher;

    // Display teacher details only if loaded
    const teacherName = teacherDetailsLoaded
      ? `${correspondingTeacher.user.name} ${correspondingTeacher.user.surname}`
      : 'Loading...';

    return (
      <tr key={course.course_id}>
        <td>{course.course_id}</td>
        <td>{correspondingDepartment ? correspondingDepartment.name : ''}</td>
        <td>{teacherName}</td>
        <td>{course.name}</td>
        <td>{course.code}</td>
        <td>{course.description}</td>
        <td>{course.credit_hours}</td>
        <td>{course.start_date}</td>
        <td>{course.end_date}</td>
        <td>
          <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(course)}>
            Edit
          </button>
          <button className="btn btn-danger btn-sm ml-2" onClick={() => handleDelete(course.course_id)}>
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
            <Form.Group controlId="departmentID">
              <Form.Label>Department ID:</Form.Label>
              <Form.Control as="select" value={departmentID} onChange={(e) => setDepartmentID(e.target.value)}>
                <option value="">Select Department</option>
                {departmentList.map((department) => (
                  <option key={department.department_id} value={department.department_id}>
                    {department.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="teacherID">
  <Form.Label>Teacher:</Form.Label>
  <Form.Control as="select" value={teacherID} onChange={(e) => setTeacherID(e.target.value)}>
    <option value="">Select Teacher</option>
    {teacherList.map((teacher) => (
      <option key={teacher.teacher_id} value={teacher.teacher_id}>
        {`${teacher.teacher_id} ${teacher.user.name} ${teacher.user.surname}`}
      </option>
    ))}
  </Form.Control>
</Form.Group>


            <Form.Group controlId="name">
              <Form.Label>Name:</Form.Label>
              <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="code">
              <Form.Label>Code:</Form.Label>
              <Form.Control type="text" value={code} onChange={(e) => setCode(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description:</Form.Label>
              <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="creditHours">
              <Form.Label>Credit Hours:</Form.Label>
              <Form.Control type="number" value={creditHours} onChange={(e) => setCreditHours(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="startDate">
              <Form.Label>Start Date:</Form.Label>
              <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="endDate">
              <Form.Label>End Date:</Form.Label>
              <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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

export default Course;
