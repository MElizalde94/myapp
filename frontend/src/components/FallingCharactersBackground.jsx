// components/FallingCharactersBackground.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';

const FallingCharactersBackground = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
  const characterSize = 16; // Font size in pixels, used for spacing
  const updateDelay = 100; // Milliseconds between character shifts (controls speed of "fall")

  const [columns, setColumns] = useState([]);
  const containerRef = useRef(null);
  const animationFrameId = useRef(null); // To store the requestAnimationFrame ID
  const lastUpdateTime = useRef(0); // To track time for controlled updates

  // Function to initialize or re-initialize columns based on container size
  const initializeColumns = useCallback(() => {
    if (!containerRef.current) return;

    const { clientWidth, clientHeight } = containerRef.current;
    const numRows = Math.ceil(clientHeight / characterSize);
    const numCols = Math.ceil(clientWidth / characterSize);

    const initialColumns = Array.from({ length: numCols }).map(() =>
      Array.from({ length: numRows }).map(() => ({
        char: characters[Math.floor(Math.random() * characters.length)],
        opacity: Math.random() * 0.5 + 0.1, // Random opacity for subtle variation
      }))
    );
    setColumns(initialColumns);
  }, [characters, characterSize]);

  // Animation loop using requestAnimationFrame
  const animate = useCallback((timestamp) => {
    if (!lastUpdateTime.current) {
      lastUpdateTime.current = timestamp;
    }

    const deltaTime = timestamp - lastUpdateTime.current;

    // Only update characters if enough time has passed (to control the "fall" speed)
    if (deltaTime > updateDelay) {
      setColumns(prevColumns =>
        prevColumns.map(column => {
          const newColumn = [...column];
          newColumn.pop(); // Remove the last character
          newColumn.unshift({ // Add a new random character at the beginning
            char: characters[Math.floor(Math.random() * characters.length)],
            opacity: Math.random() * 0.5 + 0.1,
          });
          return newColumn;
        })
      );
      lastUpdateTime.current = timestamp; // Reset last update time
    }

    animationFrameId.current = requestAnimationFrame(animate); // Request next frame
  }, [characters, updateDelay]);

  useEffect(() => {
    initializeColumns(); // Initialize on mount

    // Re-initialize columns on window resize to adjust to new dimensions
    window.addEventListener('resize', initializeColumns);

    // Start the animation loop
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup function: clear animation frame and event listener
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', initializeColumns);
    };
  }, [initializeColumns, animate]); // Dependencies for useEffect

  return (
    // Absolute positioning to cover the entire parent container
    // z-index -1 ensures it stays behind other content
    // overflow-hidden prevents scrollbars from appearing due to character movement
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 overflow-hidden bg-gray-800" // Dark background for contrast
      style={{
        fontFamily: 'monospace', // Classic terminal font
        fontSize: `${characterSize}px`,
        lineHeight: `${characterSize}px`, // Ensure no extra space between lines
      }}
    >
      {/* Render each column of characters */}
      {columns.map((column, colIndex) => (
        <div
          key={colIndex}
          className="absolute"
          style={{
            left: `${colIndex * characterSize}px`, // Position columns side by side
            top: 0, // Start columns from the top
            height: '100%',
            width: `${characterSize}px`,
            whiteSpace: 'nowrap', // Prevent characters from wrapping
          }}
        >
          {column.map((charData, rowIndex) => (
            <span
              key={rowIndex}
              className="text-green-500" // Green color for the characters
              style={{
                opacity: charData.opacity, // Apply random opacity
                display: 'block', // Make each character a block to stack vertically
              }}
            >
              {charData.char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default FallingCharactersBackground;