// ProjectsPage.jsx
import React from 'react';

// Define the project data
const projects = [
  {
    title: "Face/Object Detection Senior Design",
    duration: "Spring 2020 - Fall 2020",
    details: [
      "Oversaw full scope of project and delegated roles and tasks to team members based on technical strengths of each member.",
      "Created a security system that would apply a facial and object recognition algorithm to detect known faces and objects to notify users.",
      "Algorithms utilized TensorFlow with code written in Python. Explored and acquired COTS products such as Nvidia Jetson TX2 processing board and multiple IP cameras.",
      "Implemented an additional feature to notify users when a package had arrived using the Telegram API by creating a notification bot for alerting the user.",
    ],
  },
  {
    title: "Esp32 Firebase Web App",
    duration: "Fall 2021",
    details: [
      "Created a firebase app to display sensor readings from a Esp32 and a DS18B20 Temperature Sensor that are saved on a real-time database.",
      "Used Node.js and C/C++ for the Esp and for the front-end HTML/CSS and JavaScript.",
    ],
  },
  {
    title: "Garden Monitor System",
    duration: "Ongoing", // Assuming this is still in progress or a concept
    details: [
      "Building a system using the Raspberry Pi/B to track the temperature and humidity in the environment and monitor the moisture of the soil and the light exposed to the plants.",
      "All the data will be kept track by using AWS cloud service and sending notifications to phone app and using Flask for the front end.",
      "Used AWS S3 to store photos of the plants for the user to see on the front-end.",
    ],
  },
];

const externalLinks = [
  { name: "Stardew Valley Guide", url: "https://stardew-guide-seven.vercel.app/" },
  { name: "Pokemon Assigner", url: "https://pokemon-assigner.vercel.app/" },
];

// ProjectsPage component displays project details and links in a terminal-like format
const ProjectsPage = ({ onBack }) => {
  return (
    // Main container for the terminal window
    <div className="
      bg-gray-800 text-green-400 font-mono text-sm
      p-6 rounded-lg shadow-2xl
      max-w-3xl w-full h-auto min-h-[500px]
      flex flex-col
      border-t-2 border-l-2 border-gray-700
      border-b-2 border-r-2 border-gray-900
    ">
      {/* Terminal header with close/minimize/maximize buttons */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
        <div className="flex gap-2">
          {/* Red close button */}
          <span className="w-3 h-3 bg-red-500 rounded-full block"></span>
          {/* Yellow minimize button */}
          <span className="w-3 h-3 bg-yellow-500 rounded-full block"></span>
          {/* Green maximize button */}
          <span className="w-3 h-3 bg-green-500 rounded-full block"></span>
        </div>
        {/* Terminal title */}
        <span className="text-gray-400">myki@dev-terminal:~/projects</span>
        <div></div> {/* Placeholder for right alignment */}
      </div>

      {/* Scrollable terminal content area */}
      <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {/* Back button, styled as an old-school button */}
        <button
          onClick={onBack}
          className="
            bg-gray-700 text-green-400 px-4 py-2 rounded-md mb-6
            border-t-2 border-l-2 border-gray-600
            border-b-2 border-r-2 border-gray-900
            hover:bg-gray-600 hover:border-gray-900 hover:border-b-gray-600 hover:border-r-600
            transition-all duration-100 ease-in-out
            cursor-pointer
          "
        >
          &lt;-- Back to Main
        </button>

        {/* Loop through each project entry */}
        {projects.map((proj, index) => (
          <div key={index} className="mb-6">
            {/* Command prompt and title */}
            <p className="text-green-300">
              <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">{proj.title}</span>
            </p>
            {/* Duration (if available) */}
            {proj.duration && <p className="ml-4 text-gray-300 italic">[{proj.duration}]</p>}
            {/* Details list */}
            <ul className="list-disc list-inside ml-8 mt-2">
              {proj.details.map((detail, i) => (
                <li key={i} className="mb-1">
                  <span className="text-gray-200">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* External Links Section */}
        <div className="mt-8 mb-6">
          <p className="text-green-300">
            <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">External Links</span>
          </p>
          <ul className="list-disc list-inside ml-8 mt-2">
            {externalLinks.map((link, i) => (
              <li key={i} className="mb-1">
                <a
                  href={link.url}
                  target="_blank" // Open in new tab
                  rel="noopener noreferrer" // Security best practice
                  className="text-blue-500 hover:underline"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* End of terminal content */}
        <p className="text-green-300 mt-6">
          <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">_</span>
        </p>
      </div>

      {/* Custom scrollbar styling (copied from other terminal pages) */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #333;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #555;
          border-radius: 6px;
          border: 3px solid #333;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #777;
        }
      `}</style>
    </div>
  );
};

export default ProjectsPage;