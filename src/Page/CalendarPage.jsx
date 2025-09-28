import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../index.css";
import dayjs from "dayjs"; 
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Component/UserMenu";
import AddTaskButton from "../Component/AddTaskButton";
import { TaskContext } from "../context/TaskContext";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { tasks, setTasks, fetchTasks } = useContext(TaskContext);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", start: "", end: "" });
  const { logout, displayName, role, username } = useAuth(); 
  const navigate = useNavigate();
  const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

  useEffect(() => {
  console.log("Fetched tasks:", tasks);
}, [tasks]);

useEffect(() => {
  fetchTasks();
}, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddTask = async () => {
    const adjustedTask = {
      name: newTask.name,
      start: dayjs(newTask.start).format("YYYY-MM-DD"), 
      end: dayjs(newTask.end).format("YYYY-MM-DD")
    };
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/add`, adjustedTask, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchTasks();
      setIsPopupOpen(false);
      setNewTask({ name: "", start: "", end: "" });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysInCurrentMonth = getDaysInMonth(
    currentMonth.getMonth(),
    currentMonth.getFullYear()
  );

  const handleMonthChange = (event) => {
    const newMonth = parseInt(event.target.value);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1));
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("คุณต้องการลบ Task นี้จริงๆ หรือไม่?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  
  return (
    <div className="bg-gray-100 min-h-screen p-6 flex flex-col relative">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-700">
          Calendar - {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </h1>
        <UserMenu handleLogout={handleLogout} displayName={displayName} />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <select onChange={handleMonthChange} value={currentMonth.getMonth()} className="p-2 border rounded-lg">
          {Array.from({ length: 12 }).map((_, index) => (
            <option key={index} value={index}>
              {new Date(0, index).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Next
        </button>
      </div>
  
      <div className="w-full bg-white shadow-lg rounded-lg p-6 min-h-[600px] flex-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left border border-gray-300">Task Name</th>
                <th className="p-3 text-left border border-gray-300">Owner</th>
                {daysInCurrentMonth.map((day) => (
                  <th key={day} className="p-3 text-center border border-gray-300">{day.getDate()}</th>
                ))}
                <th className="p-3 text-center border border-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <tr key={task.id} className="relative">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-700">{task.title}</td>
                    <td className="border border-gray-300 p-3 text-gray-600">{task.assigned_to}</td>
                    {daysInCurrentMonth.map((day, index) => {
                     const taskStart = dayjs(task.start_date);
                      const taskEnd = dayjs(task.end_date);
                      const isTaskDay =
                        taskStart.isValid() && taskEnd.isValid() &&
                        dayjs(day).isSameOrAfter(taskStart, 'day') &&
                        dayjs(day).isSameOrBefore(taskEnd, 'day');
                      return (
                        <td key={index} className="relative border border-gray-300 p-2 text-center">
                          {isTaskDay && (
                            <div className="w-full h-6 mx-auto bg-blue-400 rounded-lg"></div>
                          )}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 p-2 text-center">
                    {(role === "admin" || task.created_by === username) && (
                        <button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700">
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={daysInCurrentMonth.length + 2} className="text-center p-4 border border-gray-300 text-gray-500">
                    ❌ No tasks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  
      <AddTaskButton onClick={() => setIsPopupOpen(true)} />

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New Task</h2>
            <label className="block">Task Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={newTask.name}
              onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
            />
            <label className="block">Start Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded mb-2"
              value={newTask.start}
              onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
            />
            <label className="block">End Date</label>
            <input
              type="date"
              className="w-full p-2 border rounded mb-4"
              value={newTask.end}
              onChange={(e) => setNewTask({ ...newTask, end: e.target.value })}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsPopupOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">Cancel</button>
              <button onClick={handleAddTask} className="px-4 py-2 bg-blue-500 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}  

export default CalendarPage;
