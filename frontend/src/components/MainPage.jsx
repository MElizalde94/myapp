// components/MainPage.jsx
import React from 'react';

// MainPage component receives navigateTo as a prop to handle page transitions
const MainPage = ({ navigateTo }) => {
  return (
    // Main container for the entire application.
    // Mimics an old-school desktop background with a light gray color.
    // Uses flexbox to stack content vertically, center it horizontally,
    // and align to the top with some padding.
    <div className="bg-gray-200 min-h-screen flex flex-col items-center justify-start pt-8 p-4 font-inter">

      {/* Top navigation/section buttons container */}
      {/* Arranges buttons horizontally with space between them, centered */}
      <div className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl w-full">
        {/* Projects Button - No hover effects */}
        <button
          onClick={() => navigateTo('projects')}
          className="
            bg-gray-300
            border-t-2 border-l-2 border-gray-400
            border-b-2 border-r-2 border-gray-500
            px-6 py-3 rounded-md shadow-md
            text-gray-800 font-bold text-lg
            cursor-pointer
            flex-grow sm:flex-grow-0 min-w-[120px] text-center
          "
        >
          Projects
        </button>

        {/* Experience Button - No hover effects */}
        <button
          onClick={() => navigateTo('experience')}
          className="
            bg-gray-300
            border-t-2 border-l-2 border-gray-400
            border-b-2 border-r-2 border-gray-500
            px-6 py-3 rounded-md shadow-md
            text-gray-800 font-bold text-lg
            cursor-pointer
            flex-grow sm:flex-grow-0 min-w-[120px] text-center
          "
        >
          Experience
        </button>

        {/* Technical Skills Button - No hover effects */}
        <button
          onClick={() => navigateTo('skills')}
          className="
            bg-gray-300
            border-t-2 border-l-2 border-gray-400
            border-b-2 border-r-2 border-gray-500
            px-6 py-3 rounded-md shadow-md
            text-gray-800 font-bold text-lg
            cursor-pointer
            flex-grow sm:flex-grow-0 min-w-[120px] text-center
          "
        >
          Technical Skills
        </button>

        {/* Chat App Button - No hover effects */}
        <button
          onClick={() => navigateTo('chat')}
          className="
            bg-gray-300
            border-t-2 border-l-2 border-gray-400
            border-b-2 border-r-2 border-gray-500
            px-6 py-3 rounded-md shadow-md
            text-gray-800 font-bold text-lg
            cursor-pointer
            flex-grow sm:flex-grow-0 min-w-[120px] text-center
          "
        >
          Chat App
        </button>
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
        transform /* Re-added transform */
        hover:scale-105 /* Re-added hover:scale-105 */
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
};

export default MainPage;