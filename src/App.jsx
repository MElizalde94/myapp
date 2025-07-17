// App.jsx
import React, { useState } from 'react';
// Import the Spinner component
import Spinner from './components/Spinner';
// Import the ExperiencePage component
import ExperiencePage from './components/ExperiencePage';
// Import the TechnicalSkillsPage component
import TechnicalSkillsPage from './components/TechnicalSkillsPage';
// Import the new ProjectsPage component
import ProjectsPage from './components/ProjectsPage'; // New import

// The main App component for Myki's personal dev page
const App = () => {
  // State to manage the current page being displayed
  // 'main' for the dev page, 'experience' for the experience page, 'skills' for technical skills, 'projects' for projects page
  const [currentPage, setCurrentPage] = useState('main');
  // State to manage the loading status for transitions
  const [isLoading, setIsLoading] = useState(false);

  // Function to navigate to a different page with a loading transition
  const navigateTo = (page) => {
    setIsLoading(true); // Start loading
    // Simulate a network request or heavy component load
    setTimeout(() => {
      setCurrentPage(page); // Change page after delay
      setIsLoading(false); // End loading
    }, 800); // 800ms delay for the spinner to be visible
  };

  // Render content based on the currentPage state
  const renderPageContent = () => {
    switch (currentPage) {
      case 'main':
        return (
          // Main container for the entire application.
          // Mimics an old-school desktop background with a light gray color.
          // Uses flexbox to stack content vertically, center it horizontally,
          // and align to the top with some padding.
          <div className="bg-gray-200 min-h-screen flex flex-col items-center justify-start pt-8 p-4 font-inter">

            {/* Top navigation/section cards container */}
            {/* Arranges cards horizontally with space between them, centered */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl w-full">
              {/* Projects Card - Now clickable to navigate with loading */}
              <div
                onClick={() => navigateTo('projects')} // Added onClick handler for projects page
                className="
                  bg-gray-300
                  border-t-2 border-l-2 border-gray-400
                  border-b-2 border-r-2 border-gray-500
                  px-6 py-3 rounded-md shadow-md
                  text-gray-800 font-bold text-lg
                  cursor-pointer
                  hover:bg-gray-400 hover:border-gray-500 hover:border-b-gray-400 hover:border-r-400
                  transition-all duration-100 ease-in-out
                  flex-grow sm:flex-grow-0 min-w-[120px] text-center
                "
              >
                Projects
              </div>

              {/* Experience Card - Now clickable to navigate with loading */}
              <div
                onClick={() => navigateTo('experience')} // Added onClick handler
                className="
                  bg-gray-300
                  border-t-2 border-l-2 border-gray-400
                  border-b-2 border-r-2 border-gray-500
                  px-6 py-3 rounded-md shadow-md
                  text-gray-800 font-bold text-lg
                  cursor-pointer
                  hover:bg-gray-400 hover:border-gray-500 hover:border-b-gray-400 hover:border-r-400
                  transition-all duration-100 ease-in-out
                  flex-grow sm:flex-grow-0 min-w-[120px] text-center
                "
              >
                Experience
              </div>

              {/* Technical Skills Card - Now clickable to navigate with loading */}
              <div
                onClick={() => navigateTo('skills')} // Added onClick handler for skills page
                className="
                  bg-gray-300
                  border-t-2 border-l-2 border-gray-400
                  border-b-2 border-r-2 border-gray-500
                  px-6 py-3 rounded-md shadow-md
                  text-gray-800 font-bold text-lg
                  cursor-pointer
                  hover:bg-gray-400 hover:border-gray-500 hover:border-b-gray-400 hover:border-r-400
                  transition-all duration-100 ease-in-out
                  flex-grow sm:flex-grow-0 min-w-[120px] text-center
                "
              >
                Technical Skills
              </div>
            </div>

            {/*
              The main "Welcome" card, re-styled for the old-school feel.
              - bg-gray-300 for the background.
              - Stronger, chiseled borders.
              - text-gray-800 for the text.
              - mb-16 for more space before the bottom animation.
            */}
            <div className="
              bg-gray-300
              border-t-2 border-l-2 border-gray-400
              border-b-2 border-r-2 border-gray-500
              p-8 rounded-lg shadow-xl
              text-gray-800 text-center
              max-w-md w-full
              mb-16 /* Increased margin bottom for more separation */
              transform
              hover:scale-105 /* Still keep a subtle hover for engagement */
              transition-transform
              duration-300
            ">
              <h1 className="
                text-4xl
                font-extrabold
                sm:text-5xl
                lg:text-6xl
                mb-4
              ">
                Welcome to Myki Site
              </h1>
              <p className="
                text-lg
                opacity-90
                sm:text-xl
              ">
                Your portal to my digital world.
              </p>
            </div>

            {/*
              Old-school browser animation at the bottom: a scrolling marquee.
              - bg-gray-700 for a dark, contrasting background.
              - text-green-300 for a classic terminal/LED text color.
              - py-2 px-4 for padding.
              - overflow-hidden to hide content outside the box.
              - w-full max-w-xl to control width.
              - rounded-md for slight rounding.
            */}
            <div className="
              bg-gray-700
              text-green-300
              font-mono text-sm
              py-2 px-4
              overflow-hidden
              w-full max-w-xl
              rounded-md
              border-t-2 border-l-2 border-gray-600
              border-b-2 border-r-2 border-gray-800
              shadow-inner
            ">
              <div className="animate-marquee whitespace-nowrap">
                &lt;!-- Myki's Dev Page --&gt; &nbsp; &nbsp; &lt;!-- Under Construction --&gt; &nbsp; &nbsp; &lt;!-- More to Come Soon --&gt; &nbsp; &nbsp; &lt;!-- Thanks for Visiting! --&gt; &nbsp; &nbsp;
              </div>
            </div>

            {/* CSS for the marquee animation */}
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
              .animate-marquee {
                animation: marquee 15s linear infinite; /* Adjust duration for speed */
              }
            `}</style>
          </div>
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
      case 'projects': // New case for Projects page
        return (
          // Main container for the ProjectsPage, centered on the screen
          <div className="bg-gray-200 min-h-screen flex items-center justify-center p-4 font-inter">
            {/* Pass the navigateTo function as onBack prop */}
            <ProjectsPage onBack={() => navigateTo('main')} />
          </div>
        );
      default:
        return null; // Or a 404 component
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
