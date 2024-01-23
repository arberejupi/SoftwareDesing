import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Schedule = () => {
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

  useEffect(() => {
    fetchScheduleData();
    fetchCourseData();
    fetchRoomData();
  }, [forceUpdate]);

  const fetchScheduleData = () => {
    fetch('https://localhost:7069/api/Schedule')
      .then((response) => response.json())
      .then((data) => setScheduleList(data))
      .catch((error) => console.log(error));
  };

  const fetchCourseData = () => {
    fetch('https://localhost:7069/api/Course')
      .then((response) => response.json())
      .then((data) => setCourseList(data))
      .catch((error) => console.log(error));
  };

  const fetchRoomData = () => {
    fetch('https://localhost:7069/api/Room')
      .then((response) => response.json())
      .then((data) => setRoomList(data))
      .catch((error) => console.log(error));
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

  const handleCreate = () => {
    // Validation logic
    if (!courseId || !daytime || !roomNumber) {
      setError('Please fill in all fields.');
      return;
    }

    const newSchedule = {
      course_id: courseId,
      daytime: daytime,
      room_number: roomNumber,
    };

    // Check if a schedule with the same course and daytime already exists
    const existingSchedule = scheduleList.find(
      (s) => s.course_id === newSchedule.course_id && s.daytime === newSchedule.daytime
    );
    if (existingSchedule) {
      setError('A schedule for the same course and daytime already exists.');
      return;
    }

    fetch('https://localhost:7069/api/Schedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSchedule),
    })
      .then((response) => response.json())
      .then(() => {
        fetchScheduleData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
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

    fetch(`https://localhost:7069/api/Schedule/${scheduleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateSchedule),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchScheduleData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Schedule/${id}`, {
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
        // Remove the deleted schedule from the state
        setScheduleList((prevList) => prevList.filter((schedule) => schedule.schedule_id !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredScheduleList = searchText
    ? scheduleList.filter((schedule) => schedule.schedule_id.toString().includes(searchText))
    : scheduleList;

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
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Schedule
      </button>

      <h2>Schedule List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Schedule ID</th>
              <th>Course</th>
              <th>Daytime</th>
              <th>Room Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredScheduleList.map((schedule) => {
              // Find the corresponding course for the current schedule
              const correspondingCourse = courseList.find(
                (course) => course.course_id === schedule.course_id
              );

              // Find the corresponding room for the current schedule
              const correspondingRoom = roomList.find(
                (room) => room.room_number === schedule.room_number
              );

              return (
                <tr key={schedule.schedule_id}>
                  <td>{schedule.schedule_id}</td>
                  <td>{correspondingCourse ? correspondingCourse.name : ''}</td>
                  <td>{schedule.daytime}</td>
                  <td>{correspondingRoom ? correspondingRoom.room_number : ''}</td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(schedule)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm ml-2"
                      onClick={() => handleDelete(schedule.schedule_id)}
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
            <Form.Group controlId="courseId">
              <Form.Label>Course:</Form.Label>
              <Form.Control as="select" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
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
              <Form.Control type="datetime-local" value={daytime} onChange={(e) => setDaytime(e.target.value)} />
            </Form.Group>

            <Form.Group controlId="roomNumber">
              <Form.Label>Room Number:</Form.Label>
              <Form.Control as="select" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)}>
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
