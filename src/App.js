import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure you have this file for styling

// Component for individual draggable items
const DraggableComponent = ({ id, position, onDrag }) => {
  const [dragging, setDragging] = useState(false);

  const handleDragStart = (e) => {
    setDragging(true);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = (e) => {
    setDragging(false);
    const newX = e.clientX - 50;
    const newY = e.clientY - 50;
    onDrag(id, newX, newY);
  };

  return (
    <div
      className={`draggable-component ${dragging ? 'dragging' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        left: position.x,
        top: position.y,
        position: 'absolute',
        width: '100px',
        height: '100px',
        backgroundColor: 'lightgray',
        border: '1px solid black',
        cursor: 'move',
        padding: '10px',
      }}
    >
      <input type="text" placeholder={`Component ${id}`} />
      <button>Click Me</button>
    </div>
  );
};

// Main App component
const App = () => {
  const [components, setComponents] = useState([]);

  // Fetch positions from the database on component mount
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/get-positions');
        if (!response.ok) {
          throw new Error('Failed to fetch component positions');
        }
        const data = await response.json();
        setComponents(data); // Assuming the backend returns an array of components with id, x, and y
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };

    fetchPositions();
  }, []);

  // Handle position update and send it to the database
  const updatePosition = async (id, x, y) => {
    setComponents((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, x, y } : comp))
    );

    // Send updated position to the backend API
    try {
      const response = await fetch('http://localhost:5000/api/update-position', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, x, y }), // Sending the component id and new position
      });

      if (!response.ok) {
        console.error('Failed to update position in the database');
      }
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  return (
    <div className="app">
      {components.map((comp) => (
        <DraggableComponent
          key={comp.id}
          id={comp.id}
          position={{ x: comp.x, y: comp.y }}
          onDrag={updatePosition}
        />
      ))}
      {components.length > 1 && (
        <svg
          className="lines"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <line
            x1={components[0].x + 50}
            y1={components[0].y + 50}
            x2={components[1].x + 50}
            y2={components[1].y + 50}
            stroke="red"
            strokeWidth="2"
          />
          {components.length > 2 && (
            <line
              x1={components[1].x + 50}
              y1={components[1].y + 50}
              x2={components[2].x + 50}
              y2={components[2].y + 50}
              stroke="red"
              strokeWidth="2"
            />
          )}
        </svg>
      )}
    </div>
  );
};

export default App;
