import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Enrollment = ({ userRole, token }) => {
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [courseIdByEnrollment, setCourseIdByEnrollment] = useState({});
  const [courseDetailsByEnrollment, setCourseDetailsByEnrollment] = useState({});

  const fetchCourseDetails = (courseId) => {
    fetch(`https://localhost:7069/api/Course/${courseId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((courseData) => {
        setCourseDetailsByEnrollment((prev) => ({ ...prev, [courseId]: courseData }));
      })
      .catch((error) => {
        console.error(`Error fetching course details for course ID ${courseId}:`, error);
        setCourseDetailsByEnrollment((prev) => ({ ...prev, [courseId]: {} }));
      });
  };

  useEffect(() => {
    // Fetch course details for each course ID
    Object.values(courseIdByEnrollment).forEach((courseId) => {
      if (!courseDetailsByEnrollment[courseId]) {
        fetchCourseDetails(courseId);
      }
    });
  }, [courseIdByEnrollment, courseDetailsByEnrollment, token]);
  
  useEffect(() => {
    fetchEnrollmentData();
    fetchStudents();
    fetchSchedules();
    console.log('role,', userRole);
  }, [userRole, token]);

  // ...

  const fetchEnrollmentData = () => {
    const apiUrl =
      userRole === 'Student'
        ? 'https://localhost:7069/api/Enrollments/GetEnrollmentsForCurrentUser'
        : 'https://localhost:7069/api/Enrollments';

    fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const enrollmentPromises = data.map((enrollment) => {
          const userPromise = fetch(`https://localhost:7069/api/Auth/${enrollment.user_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((response) => response.json());

          const schedulePromise = fetch(`https://localhost:7069/api/Schedule/${enrollment.schedule_id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((response) => response.json())
            .catch((error) => {
              console.error(`Error fetching schedule details for enrollment ID ${enrollment.enrollment_id}:`, error);
              return {}; // Return an empty object or handle the error as needed
            });

          return Promise.all([userPromise, schedulePromise]).then(([userData, scheduleData]) => {
            enrollment.user = userData;
            enrollment.schedule = scheduleData;
            setCourseIdByEnrollment((prev) => ({ ...prev, [enrollment.enrollment_id]: scheduleData.course_id }));
            return enrollment;
          });
        });

        Promise.all(enrollmentPromises)
          .then((enrollmentsWithDetails) => {
            console.log('Enrollment Data:', enrollmentsWithDetails);
            setEnrollmentList(enrollmentsWithDetails);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  };

// ...



  const fetchStudents = () => {
    // Fetch list of students for the dropdown
    fetch('https://localhost:7069/api/Auth/students', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((studentsData) => {
        setStudents(studentsData);
      })
      .catch((error) => console.log(error));
  };

  const fetchSchedules = () => {
    // Fetch list of schedules for the dropdown
    fetch('https://localhost:7069/api/Schedule', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((schedulesData) => {
        setSchedules(schedulesData);
      })
      .catch((error) => console.log(error));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setEnrollmentId('');
    setStudentId('');
    setCourseId('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Enrollment');
    setModalAction('create');
  };

  const handleCreate = () => {
    // Validation logic
    if (!studentId || !courseId) {
      setError('Please fill in all fields.');
      return;
    }

    const newEnrollment = {
      student_id: studentId,
      course_id: courseId,
    };

    fetch('https://localhost:7069/api/Enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newEnrollment),
    })
      .then((response) => response.json())
      .then(() => {
        fetchEnrollmentData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUnenroll = (id) => {
    // Implement unenrollment logic
    // For example, you might have a separate API endpoint for unenrolling
    // Adjust this based on your backend implementation
    fetch(`https://localhost:7069/api/Enrollments/${id}`, {
      method: 'Delete',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => {
        // Remove the unenrolled enrollment from the state
        setEnrollmentList((prevList) => prevList.filter((enrollment) => enrollment.enrollment_id !== id));
      })
      .catch((error) => console.log(error));
  };

  const renderActionButton = (enrollment) => {
    if (userRole === 'Management') {
      return (
        <button
          className="btn btn-danger btn-sm ml-2"
          onClick={() => handleDelete(enrollment.enrollment_id)}
        >
          Delete
        </button>
      );
    } else if (userRole === 'Student') {
      return (
        <button
          className="btn btn-danger btn-sm ml-2"
          onClick={() => handleUnenroll(enrollment.enrollment_id)}
        >
          Unenroll
        </button>
      );
    }
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Enrollments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        // Remove the deleted enrollment from the state
        setEnrollmentList((prevList) => prevList.filter((enrollment) => enrollment.enrollment_id !== id));
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Enrollment</h3>

      {userRole === 'Management' && (
        <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
          Create Enrollment
        </button>
      )}

      <h2>Enrollment List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Schedule</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollmentList.map((enrollment) => (
              <tr key={enrollment.enrollment_id}>
                <td>
                  {enrollment.user && (
                    <>
                      {enrollment.user.name} {enrollment.user.surname}
                    </>
                  )}
                </td>
                <td>
  {courseIdByEnrollment[enrollment.enrollment_id] && (
    <>
      <strong>Course Name:</strong> {courseDetailsByEnrollment[courseIdByEnrollment[enrollment.enrollment_id]].name} <br />
      <strong>Code:</strong> {courseDetailsByEnrollment[courseIdByEnrollment[enrollment.enrollment_id]].code} <br />
      <strong>Description:</strong> {courseDetailsByEnrollment[courseIdByEnrollment[enrollment.enrollment_id]].description} <br />
      <strong>Credit Hours:</strong> {courseDetailsByEnrollment[courseIdByEnrollment[enrollment.enrollment_id]].credit_hours}
    </>
  )}
</td>


                <td>
                  {renderActionButton(enrollment)}
                </td>
              </tr>
            ))}
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
            <Form.Group controlId="studentId">
              <Form.Label>Student:</Form.Label>
              <Form.Control as="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user_id} {student.name} {student.surname}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="courseId">
              <Form.Label>Schedule:</Form.Label>
              <Form.Control as="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                <option value="">Select Schedule</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.schedule_id} - {schedule.course_id}
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
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Enrollment;
