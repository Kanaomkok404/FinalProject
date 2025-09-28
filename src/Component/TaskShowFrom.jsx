import React, { useEffect, useMemo } from "react";
import { useAuth } from "../AuthContext";
import categoryMap from "../Config/categoryMap";
import { CATEGORIES } from "../Config/taskCategories";

const TaskShowForm = ({
  show,
  onClose,
  editingTask,
  taskData,
  setTaskData,
  handleChange,
  handleSubmit,
}) => {
  const { displayName } = useAuth();

  useEffect(() => {
    if (show && !editingTask) {
      setTaskData((prev) => ({
        ...prev,
        assigned_to: displayName,
      }));
    }
  }, [show, editingTask, displayName, setTaskData]);

  const departments = useMemo(() => Object.keys(categoryMap), []);

  const categoryOptions = useMemo(() => {
    return taskData.department ? categoryMap[taskData.department] || [] : [];
  }, [taskData.department]);

  const handleDepartmentChange = (e) => {
    const department = e.target.value;
    setTaskData((prev) => ({
      ...prev,
      department,
      category: "", 
    }));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-2">
          {editingTask ? "Edit Task" : "Add New Task"}
        </h2>

        <input
          type="text"
          name="title"
          value={taskData.title}
          onChange={handleChange}
          placeholder="Task Title"
          className="border p-2 w-full mb-2"
        />

        <input
          type="text"
          name="assigned_to"
          value={taskData.assigned_to}
          readOnly
          className="border p-2 w-full mb-2 bg-gray-100 text-gray-700"
        />

        <select
          name="department"
          value={taskData.department}
          onChange={handleDepartmentChange}
          className="border p-2 w-full mb-2"
        >
          <option value="">เลือกแผนก</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <select
          name="category"
          value={taskData.category}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          disabled={!taskData.department}
        >
          <option value="">เลือกประเภทงาน</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <label className="text-sm text-gray-600 font-semibold mt-2">Start Date:</label>
        <input
          type="date"
          name="start_date"
          value={taskData.start_date}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <label className="text-sm text-gray-600 font-semibold mt-2">Actual Date:</label>
        <input
          type="date"
          name="actual_date"
          value={taskData.actual_date}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <label className="text-sm text-gray-600 font-semibold mt-2">Due date:</label>
        <input
          type="date"
          name="due_date"
          value={taskData.due_date}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />

        <label className="text-sm text-gray-600 font-semibold mt-2">Status:</label> 
        <select
          name="status"
          value={taskData.status}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        >
          <option value="">เลือกสถานะ</option>
          {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
        </select>

        <label className="text-sm text-gray-600 font-semibold mt-2">Priority:</label>
        <select
          name="priority"
          value={taskData.priority}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        >
          <option value="">เลือกความสำคัญ</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            {editingTask ? "Update Task" : "✅ Add Task"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskShowForm;
