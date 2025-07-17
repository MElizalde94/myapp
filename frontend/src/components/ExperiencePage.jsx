// ExperiencePage.jsx
import React from 'react';

// Define the experience data
const experiences = [
  {
    title: "Associate Software Developer, Security Brands inc",
    duration: "Jan 2025 - Current",
    details: [
      "Developed a full-stack ticketing system using React for the frontend, TailwindCSS for styling, and MongoDB with Express.js for the backend.",
      "Integrated AWS to allow users to attach photos to their tickets.",
      "Designed and implemented a dashboard for agents to view and update ticket statuses.",
      "Added a comment section to facilitate communication between users and agents within the ticketing system.",
      "Developed RMA ticket system with similar features as ticketing system",
      "Implemented Android auto on of of the companies apps",
    ],
  },
  {
    title: "Associate Software Engineer, Tech Mahindra",
    duration: "Oct 2022 - Nov 2023",
    details: [
      "My core responsibility was ETL development, where I have played a vital role in the extraction, transformation, and loading of data within the healthcare domain.",
      "Leveraged Ab Initio, a powerful ETL tool, to create Appconfs. These configurations are instrumental in performing data quality checks, ensuring that the data being processed meets the standards of quality and consistency.",
      "Developed shell scripts in a Unix environment.",
      "Wrote SQL scripts for data extraction and transformation.",
      "Collaborated with cross-functional teams to deliver solutions that meet business objectives.",
    ],
  },
  {
    title: "Project Engineer, Wipro Ltd",
    duration: "July 2021 - July 2022",
    details: [
      "Assigned to retail industry to perform database management using Oracle SQL and PL/SQL",
      "Converted legacy database to a modern system.",
      "Collaborated in an agile environment with daily standups.",
      "Utilized Jira and qTest for E2E testing.",
      "Conducted user migration and tracked bugs.",
      "Designed and implemented a test plan for a notification system.",
      "Wrote SQL scripts for retrieving customer data to validate preconditions prior to performing migration to new platform.",
    ],
  },
];

// ExperiencePage component displays experience in a terminal-like format
const ExperiencePage = ({ onBack }) => {
  return (
    // Main container for the terminal window
    // Dark background, rounded corners, shadow for depth.
    // Uses flexbox to stack content and add padding.
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
        <span className="text-gray-400">myki@dev-terminal:~/experience</span>
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
            hover:bg-gray-600 hover:border-gray-900 hover:border-b-gray-600 hover:border-r-gray-600
            transition-all duration-100 ease-in-out
            cursor-pointer
          "
        >
          &lt;-- Back to Main
        </button>

        {/* Loop through each experience entry */}
        {experiences.map((exp, index) => (
          <div key={index} className="mb-6">
            {/* Command prompt and title */}
            <p className="text-green-300">
              <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">{exp.title}</span>
            </p>
            {/* Duration */}
            <p className="ml-4 text-gray-300 italic">[{exp.duration}]</p>
            {/* Details list */}
            <ul className="list-disc list-inside ml-8 mt-2">
              {exp.details.map((detail, i) => (
                <li key={i} className="mb-1">
                  <span className="text-gray-200">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {/* End of terminal content */}
        <p className="text-green-300 mt-6">
          <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">_</span>
        </p>
      </div>

      {/* Custom scrollbar styling */}
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

export default ExperiencePage;