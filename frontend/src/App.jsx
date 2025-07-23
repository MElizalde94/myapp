// App.jsx
import React, { useState, useEffect } from 'react';
// Import the Spinner component
import Spinner from './components/Spinner';
// Import the ExperiencePage component
import ExperiencePage from './components/ExperiencePage';
// Import the TechnicalSkillsPage component
import TechnicalSkillsPage from './components/TechnicalSkillsPage';
// Import the new ProjectsPage component
import ProjectsPage from './components/ProjectsPage';
// Import the MychatApp component
import MychatApp from './components/MychatApp';
// Import the new MainPage component
import MainPage from './components/MainPage';

// The main App component for Myki's personal dev page
const App = () => {
  // State to manage the current hash route
  // Initialize with the current hash or default to 'main' if no hash
  const [currentHash, setCurrentHash] = useState(window.location.hash.substring(1) || 'main');
  // State to manage the loading status for transitions
  const [isLoading, setIsLoading] = useState(false);

  // useEffect to listen for hash changes in the URL
  useEffect(() => {
    const handleHashChange = () => {
      // Update the currentHash state when the URL hash changes
      setCurrentHash(window.location.hash.substring(1) || 'main');
    };

    // Add event listener for hashchange
    window.addEventListener('hashchange', handleHashChange);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // Empty dependency array ensures this runs once on mount

  // Function to navigate to a different page by updating the URL hash
  const navigateTo = (page) => {
    setIsLoading(true); // Start loading
    // Simulate a network request or heavy component load
    setTimeout(() => {
      // Update the URL hash, which will trigger the hashchange event and re-render
      window.location.hash = page;
      setIsLoading(false); // End loading
    }, 800); // 800ms delay for the spinner to be visible
  };

  // Render content based on the currentHash state
  const renderPageContent = () => {
    switch (currentHash) {
      case 'main':
        return (
          // Render the MainPage component and pass navigateTo to it
          <MainPage navigateTo={navigateTo} />
        );
      case 'experience':
        return (
          // Main container for the ExperiencePage, centered on the screen
          <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4 font-inter">
            {/* Pass the navigateTo function as onBack prop to allow returning to main page */}
            <ExperiencePage onBack={() => navigateTo('main')} />
          </div>
        );
      case 'skills':
        return (
          // Main container for the TechnicalSkillsPage, centered on the screen
          <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4 font-inter">
            {/* Pass the navigateTo function as onBack prop */}
            <TechnicalSkillsPage onBack={() => navigateTo('main')} />
          </div>
        );
      case 'projects':
        return (
          // Main container for the ProjectsPage, centered on the screen
          <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4 font-inter">
            {/* Pass the navigateTo function as onBack prop */}
            <ProjectsPage onBack={() => navigateTo('main')} />
          </div>
        );
      case 'chat':
        return (
          // Main container for the MychatApp, centered on the screen
          <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4 font-inter">
            {/* Pass the navigateTo function as onBack prop */}
            <MychatApp onBack={() => navigateTo('main')} />
          </div>
        );
      default:
        // Default to main page if an unknown hash is encountered
        return (
          <MainPage navigateTo={navigateTo} />
        );
    }
  };

  return (
    <>
      {renderPageContent()}
      {/* Conditionally render the Spinner if isLoading is true */}
      {isLoading && <Spinner />}
    </>
  );
};

// Export the App component as the default export
export default App;