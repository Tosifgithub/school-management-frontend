import React from 'react';

function Home() {
  // Dummy data
  const metrics = [
    { title: 'Total Students', value: 500 },
    { title: 'Today’s Fees Collection', value: '$2,500' },
    { title: 'Present Students Today', value: 480 },
    { title: 'Absent Students Today', value: 20 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-md flex flex-col items-center"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center">
            {metric.title}
          </h3>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Home;