import React from 'react';

const AddTaskButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 px-4 py-2 w-14 h-14 bg-blue-500 text-white rounded-full font-bold shadow-lg hover:bg-blue-600 z-50 text-2xl"
      aria-label="Add new task"
    >
      +
    </button>
  );
};

export default AddTaskButton;
