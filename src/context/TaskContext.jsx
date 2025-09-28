import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { username, token } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL}`;

  const fetchTasks = async (userToFetch = username) => {
  try {
    const res = await axios.get(`${API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        username: userToFetch,
      },
    });

    if (Array.isArray(res.data)) {
      const adjustedTasks = res.data.map(task => ({
        ...task,
        start_date: task.start_date ? new Date(task.start_date) : null,
        end_date: task.due_date ? new Date(task.due_date) : null,
      }));
      setTasks(adjustedTasks);
    } else {
      console.warn("Unexpected task data:", res.data);
      setTasks([]);
    }
  } catch (err) {
    console.error("Error fetching tasks:", err.response?.data || err);
    setTasks([]);
  }
};


  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        fetchTasks,
        isUploading,
        setIsUploading,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
