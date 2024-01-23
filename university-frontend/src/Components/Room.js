import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Modal, Form } from 'react-bootstrap';

const Room = () => {
  const [roomList, setRoomList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [capacity, setCapacity] = useState('');
  const [equipment, setEquipment] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [roomType, setRoomType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalAction, setModalAction] = useState('');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    fetchRoomData();
    fetchBuildingData();
  }, [forceUpdate]);

  const fetchRoomData = () => {
    fetch('https://localhost:7069/api/Room')
      .then((response) => response.json())
      .then((data) => setRoomList(data))
      .catch((error) => console.log(error));
  };

  const fetchBuildingData = () => {
    fetch('https://localhost:7069/api/Building')
      .then((response) => response.json())
      .then((data) => setBuildingList(data))
      .catch((error) => console.log(error));
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitle('');
    setModalAction('');
    setRoomNumber('');
    setCapacity('');
    setEquipment('');
    setBuildingName('');
    setFloorNumber('');
    setRoomType('');
  };

  const handleShowCreateModal = () => {
    setShowModal(true);
    setModalTitle('Create Room');
    setModalAction('create');
  };

  const handleShowEditModal = (room) => {
    setShowModal(true);
    setModalTitle('Edit Room');
    setModalAction('edit');
    setRoomNumber(room.room_number);
    setCapacity(room.capacity);
    setEquipment(room.equipment);
    setBuildingName(room.building_name);
    setFloorNumber(room.floor_number);
    setRoomType(room.room_type);
  };

  const handleCreate = () => {
    // Validation logic
    if ( !capacity || !buildingName || !floorNumber || !roomType) {
      setError('Please fill in all fields.');
      return;
    }

    const newRoom = {
      
      capacity: capacity,
      equipment: equipment,
      building_name: buildingName,
      floor_number: floorNumber,
      room_type: roomType,
    };

    // Check if room with the same number already exists
    const existingRoom = roomList.find((r) => r.room_number === newRoom.room_number);
    if (existingRoom) {
      setError('A room with the same number already exists.');
      return;
    }

    fetch('https://localhost:7069/api/Room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRoom),
    })
      .then((response) => response.json())
      .then(() => {
        fetchRoomData();
        handleCloseModal();
      })
      .catch((error) => console.log(error));
  };

  const handleUpdate = () => {
    // Validation logic
    if (!capacity || !buildingName || !floorNumber || !roomType) {
      setError('Please fill in all fields.');
      return;
    }

    const updateRoom = {
      room_number: roomNumber,
      capacity: capacity,
      equipment: equipment,
      building_name: buildingName,
      floor_number: floorNumber,
      room_type: roomType,
    };

    fetch(`https://localhost:7069/api/Room/${roomNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateRoom),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to update the record. Please check the console for details.');
        } else {
          fetchRoomData();
          handleCloseModal();
        }
      })
      .catch((error) => console.log(error));
  };

  const handleForceUpdate = () => {
    setForceUpdate((prev) => !prev);
  };

  const handleDelete = (id) => {
    fetch(`https://localhost:7069/api/Room/${id}`, {
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
        // Remove the deleted room from the state
        setRoomList((prevList) => prevList.filter((room) => room.room_number !== id));
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchText(searchValue);
  };

  const filteredRoomList = searchText
    ? roomList.filter((room) => room.room_number.toString().includes(searchText))
    : roomList;

  return (
    <div className="container mt-5" style={{ marginLeft: '-5vw' }}>
      <h3>Room</h3>
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by Room Number"
          value={searchText}
          onChange={handleSearch}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary mb-3" onClick={handleShowCreateModal}>
        Create Room
      </button>

      <h2>Room List</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Capacity</th>
              <th>Equipment</th>
              <th>Building Name</th>
              <th>Floor Number</th>
              <th>Room Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoomList.map((room) => (
              <tr key={room.room_number}>
                <td>{room.room_number}</td>
                <td>{room.capacity}</td>
                <td>{room.equipment}</td>
                <td>{room.building_name}</td>
                <td>{room.floor_number}</td>
                <td>{room.room_type}</td>
                <td>
                  <button className="btn btn-primary btn-sm" onClick={() => handleShowEditModal(room)}>
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm ml-2"
                    onClick={() => handleDelete(room.room_number)}
                  >
                    Delete
                  </button>
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
            <Form.Group controlId="capacity">
              <Form.Label>Capacity:</Form.Label>
              <Form.Control
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="equipment">
              <Form.Label>Equipment:</Form.Label>
              <Form.Control
                type="text"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="buildingName">
              <Form.Label>Building Name:</Form.Label>
              <Form.Control
                type="text"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="floorNumber">
              <Form.Label>Floor Number:</Form.Label>
              <Form.Control
                type="number"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="roomType">
              <Form.Label>Room Type:</Form.Label>
              <Form.Control
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              />
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

export default Room;
