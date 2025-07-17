// TechnicalSkillsPage.jsx
import React from 'react';

// Define the education and technical skills data
const education = {
  university: "The University of Texas at Dallas",
  degree: "Bachelor of Science in Computer Engineering, Fall 2020",
};

const technicalSkills = {
  programmingLanguages: [
    "Java", "C/C++", "Python", "JavaScript", "HTML", "CSS", "Bash", "C#",
    "MIPS", "Verilog", "PL/SQL", "PHP", "Kornshell", "Node.js", "SQL", "Kotlin"
  ],
  frameworksAndTools: [
    "Google Firebase", "TensorFlow", "XML", "RESTAPIs", "Anaconda", "Ab Initio",
    "Docker", "Kubernetes", "NumPy", "IBM DB2", "MySQL", "Oracle SQL",
    "Django", "Flask", "React", "SpringBoot"
  ],
  software: [
    "VSCode", "Eclipse", "MATLAB", "Arduino", "GitHub", "GitLab", "Android Studio",
    "Jira", "Xilinx", "Oracle SQL Developer", "TOSCA", "qTest", "Toad", "Excel",
    "Jenkins", "Control-m", "AWS"
  ],
};

// TechnicalSkillsPage component displays skills in a terminal-like format
const TechnicalSkillsPage = ({ onBack }) => {
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
        <span className="text-gray-400">myki@dev-terminal:~/technical-skills</span>
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

        {/* Education Section */}
        <div className="mb-6">
          <p className="text-green-300">
            <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">Education</span>
          </p>
          <p className="ml-4 text-gray-200">{education.university}</p>
          <p className="ml-4 text-gray-200 italic">[{education.degree}]</p>
        </div>

        {/* Programming Languages Section */}
        <div className="mb-6">
          <p className="text-green-300">
            <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">Programming Languages</span>
          </p>
          <ul className="list-disc list-inside ml-8 mt-2">
            {technicalSkills.programmingLanguages.map((lang, i) => (
              <li key={i} className="mb-1">
                <span className="text-gray-200">{lang}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Frameworks and Tools Section */}
        <div className="mb-6">
          <p className="text-green-300">
            <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">Frameworks and Tools</span>
          </p>
          <ul className="list-disc list-inside ml-8 mt-2">
            {technicalSkills.frameworksAndTools.map((item, i) => (
              <li key={i} className="mb-1">
                <span className="text-gray-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Software Section */}
        <div className="mb-6">
          <p className="text-green-300">
            <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">Software</span>
          </p>
          <ul className="list-disc list-inside ml-8 mt-2">
            {technicalSkills.software.map((item, i) => (
              <li key={i} className="mb-1">
                <span className="text-gray-200">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* End of terminal content */}
        <p className="text-green-300 mt-6">
          <span className="text-blue-400">myki@dev-terminal</span>:<span className="text-yellow-400">~</span>$ <span className="text-white">_</span>
        </p>
      </div>

      {/* Custom scrollbar styling (copied from ExperiencePage) */}
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

export default TechnicalSkillsPage;