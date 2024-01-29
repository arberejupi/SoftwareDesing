import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Schedule = ({ userRole, token }) => {
  const [scheduleList, setScheduleList] = useState([]);
  const [courseList, setCourseList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [scheduleId, setScheduleId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [daytime, setDaytime] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [hasEnrollmentMap, setHasEnrollmentMap] = useState({});
  const [userId, setUserId] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [courseDetailsMap, setCourseDetailsMap] = useState({});

  useEffect(() => {
    fetchEnrollmentStatus();
  }, [scheduleList]);

  useEffect(() => {
    fetchScheduleData();
    fetchCourseData();
    fetchRoomData();
  }, [forceUpdate, token]);

  useEffect(() => {
    fetchCourseDetails();
  }, [scheduleList]);

  const fetchEnrollmentStatus = async () => {
    const enrollmentStatusMap = {};

    for (const schedule of scheduleList) {
      try {
        const response = await fetch(`https://localhost:7069/api/Enrollments/HasEnrollmentForSchedule/${schedule.schedule_id}`);
        if (response.ok) {
          const hasEnrollment = await response.json();
          enrollmentStatusMap[schedule.schedule_id] = hasEnrollment;
        } else {
          console.error(`Failed to fetch enrollment status for schedule ${schedule.schedule_id}`);
        }
      } catch (error) {
        console.error(error);
      }
    }

    setHasEnrollmentMap(enrollmentStatusMap);
  };

  const fetchScheduleData = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Schedule');
      if (response.ok) {
        const data = await response.json();
        setScheduleList(data);
      } else {
        console.error('Failed to fetch schedule data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Course');
      if (response.ok) {
        const data = await response.json();
        setCourseList(data);
      } else {
        console.error('Failed to fetch course data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRoomData = async () => {
    try {
      const response = await fetch('https://localhost:7069/api/Room');
      if (response.ok) {
        const data = await response.json();
        setRoomList(data);
      } else {
        console.error('Failed to fetch room data');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setScheduleId('');
    setCourseId('');
    setDaytime('');
    setRoomNumber('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Schedule');
    setModalAction('create');
  };

  const handleShowEditModal = (schedule) => {
    setShowModal(true);
    setModalTitle('Edit Schedule');
    setModalAction('edit');
    setScheduleId(schedule.schedule_id);
    setCourseId(schedule.course_id);
    setDaytime(schedule.daytime);
    setRoomNumber(schedule.room_number);
  };

  const handleCreate = async () => {
    try {
      if (!courseId || !daytime || !roomNumber) {
        setError('Please fill in all fields.');
        return;
      }

      const newSchedule = {
        course_id: courseId,
        daytime: daytime,
        room_number: roomNumber,
      };

      const existingSchedule = scheduleList.find(
        (s) => s.course_id === newSchedule.course_id && s.daytime === newSchedule.daytime
      );

      if (existingSchedule) {
        setError('A schedule for the same course and daytime already exists.');
        return;
      }

      const response = await fetch('https://localhost:7069/api/Schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSchedule),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule');
      }

      fetchScheduleData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!courseId || !daytime || !roomNumber) {
        setError('Please fill in all fields.');
        return;
      }

      const updateSchedule = {
        schedule_id: scheduleId,
        course_id: courseId,
        daytime: daytime,
        room_number: roomNumber,
      };

      const response = await fetch(`https://localhost:7069/api/Schedule/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateSchedule),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }

      fetchScheduleData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://localhost:7069/api/Schedule/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      setScheduleList((prevList) => prevList.filter((schedule) => schedule.schedule_id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnroll = async (scheduleId) => {
    try {
      const storedUserData = sessionStorage.getItem('userData');
      if (!storedUserData) {
        setError('User data not found.');
        return;
      }

      const { userId, token } = JSON.parse(storedUserData);

      const newEnrollment = {
        user_id: userId,
        schedule_id: scheduleId,
      };

      const isEnrolled = enrollments.some(
        (enrollment) => enrollment.user_id === userId && enrollment.schedule_id === scheduleId
      );

      if (isEnrolled) {
        setError('You are already enrolled in this schedule.');
        return;
      }

      const enrollResponse = await fetch(`https://localhost:7069/api/Enrollments/${scheduleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEnrollment),
      });

      if (!enrollResponse.ok) {
        throw new Error('Failed to enroll in the schedule.');
      }

      const enrolledData = await enrollResponse.json();

      setEnrollments((prevEnrollments) => [...prevEnrollments, enrolledData]);

      setHasEnrollmentMap((prevMap) => ({
        ...prevMap,
        [scheduleId]: true,
      }));

      console.log('Enrolled successfully!');
      window.alert('You have been successfully enrolled!');

      handleCloseModal();
    } catch (error) {
      console.error(error);
      setError('Failed to enroll in the schedule.');
    }
  };

  const fetchCourseDetails = async () => {
    const courseDetails = {};
  
    for (const schedule of scheduleList) {
      try {
        const courseResponse = await fetch(`https://localhost:7069/api/Course/${schedule.course_id}`);
        if (courseResponse.ok) {
          const course = await courseResponse.json();
  
          // Fetch user details based on user_id associated with the teacher
          const userResponse = await fetch(`https://localhost:7069/api/Auth/${course.teacher_id}`);
          if (userResponse.ok) {
            const user = await userResponse.json();
  
            // Assuming the teacher's name property is 'name' in the Users table
            course.teacher_name = user.name;
          }
  
          courseDetails[schedule.schedule_id] = course;
        } else {
          console.error(`Failed to fetch course details for schedule ${schedule.schedule_id}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  
    setCourseDetailsMap(courseDetails);
  };
  
  
  

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Schedule</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Schedule ID"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      {userRole === 'Management' && (
        <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
          Create Schedule
        </button>
      )}

      <h2>Schedule List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              
              <th>Course</th>
              <th>Daytime</th>
              <th>Room Number</th>
              {userRole === 'Management' && <th>Actions</th>}
              {userRole === 'Student' && <th>Enroll</th>}
            </tr>
          </thead>
          <tbody>
            {scheduleList.map((schedule) => {
              const correspondingCourse = courseList.find(
                (course) => course.course_id === schedule.course_id
              );
              const correspondingRoom = roomList.find(
                (room) => room.room_number === schedule.room_number
              );

              const isEnrolled = enrollments.some(
                (enrollment) =>
                  enrollment.user_id === userId && enrollment.schedule_id === schedule.schedule_id
              );

              const hasEnrollment = hasEnrollmentMap[schedule.schedule_id];

              const courseDetails = courseDetailsMap[schedule.schedule_id];

              return (
                <tr key={schedule.schedule_id}>
                 
                  <td>
                    {courseDetails && (
                      <>
                        <strong>Course Name:</strong> {courseDetails.name} <br />
                        <strong>Code:</strong> {courseDetails.code} <br />
                        <strong>Description:</strong> {courseDetails.description} <br />
                        <strong>Credit Hours:</strong> {courseDetails.credit_hours}
                      </>
                    )}
                  </td>
                  <td>{schedule.daytime}</td>
                  <td>
  {correspondingRoom ? (
    <>
      <span>Room Number: {correspondingRoom.room_number}</span>
      <br />
      <span>Capacity: {correspondingRoom.capacity}</span>
      <br />
      <span>Building Name: {correspondingRoom.building_name}</span>
      <br />
      <span>Floor Number: {correspondingRoom.floor_number}</span>
    </>
  ) : (
    ''
  )}
</td>
                  {userRole === 'Management' && (
                    <td>
                      {/* ... (other code) */}
                    </td>
                  )}
                  {userRole === 'Student' && (
                    <td>
                      {hasEnrollment !== undefined ? (
                        hasEnrollment ? (
                          <button className="btn btn-success btn-sm" disabled>
                            Enrolled
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEnroll(schedule.schedule_id)}
                          >
                            Enroll
                          </button>
                        )
                      ) : (
                        <span>Loading...</span>
                      )}
                    </td>
                  )}
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
            <Form.Group controlId="courseId">
              <Form.Label>Course:</Form.Label>
              <Form.Control
                as="select"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                <option value="">Select Course</option>
                {courseList.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="daytime">
              <Form.Label>Daytime:</Form.Label>
              <Form.Control
                type="datetime-local"
                value={daytime}
                onChange={(e) => setDaytime(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="roomNumber">
              <Form.Label>Room Number:</Form.Label>
              <Form.Control
                as="select"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              >
                <option value="">Select Room</option>
                {roomList.map((room) => (
                  <option key={room.room_number} value={room.room_number}>
                    {room.room_number}
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

export default Schedule;
