import { useState, useEffect, useContext } from "react";
import axios from "axios";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Component/UserMenu";
import AddTaskButton from "../Component/AddTaskButton";
import TaskShowForm from "../Component/TaskShowFrom";
import DescriptionModal from "../Component/DescriptionModal";
import { CATEGORIES, CATEGORY_LABELS } from "../Config/taskCategories"
import { TaskContext } from "../context/TaskContext";
 dayjs.extend(utc);
 dayjs.extend(timezone);
 dayjs.extend(relativeTime);
 
const TrackingPage = () => {
  const { logout, displayName, role, username } = useAuth();
  const { tasks, setTasks, fetchTasks, loading } = useContext(TaskContext);
  const [expanded, setExpanded] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDisplayName, setSelectedDisplayName] = useState(displayName);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [descriptionText, setDescriptionText] = useState("");
  const [descriptionFiles, setDescriptionFiles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(username); 
  const [allUsers, setAllUsers] = useState([]);
  const [taskData, setTaskData] = useState({
    title: "",
    department: "",
    category: "",
    start_date: "",
    actual_date: "",
    due_date: "",
    status: "คิดหัวข้อ",
    priority: "Medium",
    assigned_to: "",
  });
  
  const navigate = useNavigate();
  const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openDescriptionModal = (task) => {
    setSelectedTask(task);
    setDescriptionText(task.description || "");
    setDescriptionFiles([]); 
    setShowDescriptionModal(true);
  };

  useEffect(() => {
    if (role === "admin") {
      axios.get(`${import.meta.env.VITE_API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        setAllUsers(res.data);
  
        const selected = res.data.find((u) => u.username === selectedUser);
        if (selected) {
          setSelectedDisplayName(selected.display_name); 
        }
      })
      .catch((err) => console.error("Error fetching users:", err));
    }
  }, [role, selectedUser]);

  useEffect(() => {
  if (!selectedUser) return;

  if (role !== "admin" && selectedUser !== username) return;

  fetchTasks(selectedUser);
}, [selectedUser, role, username]);


  const groupedTasks = Array.isArray(tasks)
  ? tasks.reduce((acc, task) => {
      if (!acc[task.status]) acc[task.status] = [];
      acc[task.status].push(task);
      return acc;
    }, {})
  : {};

  const toggleSection = (status) => {
    setExpanded((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSaveDescription = async (existingFilesFromModal) => {
    if (!selectedTask) return;
    setIsUploading(true);
  
    const formData = new FormData();
    formData.append("description", descriptionText);
  
    if (descriptionFiles.length > 0) {
      descriptionFiles.forEach((file) => {
        formData.append("files", file);
      });
    }
  
    const filenamesToKeep = existingFilesFromModal.map((f) => f.name);
    formData.append("keepFiles", JSON.stringify(filenamesToKeep));
  
    try {
      const res = await axios.post(
        `${API_URL}/${selectedTask.id}/description`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      await fetchTasks(selectedUser);
      setSelectedTask(res.data);
      setDescriptionFiles([]);
      setDescriptionText(""); 
      return res.data; 
    } catch (err) {
      console.error("Error saving description:", err.response?.data || err);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSubmit = async () => {
    const requiredFields = [
      "title",
      "assigned_to",
      "department",
      "category",
      "start_date",
      "due_date",
      "status",
      "priority",
    ];
  
    for (let field of requiredFields) {
      if (!taskData[field]) {
        alert("กรุณาใส่ข้อมูลให้ครบทุกช่อง");
        return;
      }
    }

    const userObj = allUsers.find(u => u.username === taskData.assigned_to);
    const displayNameToAssign = userObj ? userObj.display_name : taskData.assigned_to;
  
    const updatedData = {
      ...taskData,
      start_date: taskData.start_date,
      due_date: taskData.due_date,
      actual_date: taskData.actual_date || null,
      assigned_to: displayNameToAssign,
    };
    
    console.log("📤 กำลังส่ง updatedData:", updatedData);
  
    const method = editingTask ? "put" : "post";
    const url = editingTask ? `${API_URL}/${editingTask}` : API_URL;
  
    try {
      const res = await axios[method](url, updatedData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      await fetchTasks(selectedUser);
      setShowForm(false);
      setEditingTask(null);
      setTaskData({
        title: "",
        department: "",
        category: "",
        start_date: "",
        actual_date: "",
        due_date: "",
        status: "คิดหัวข้อ",
        priority: "Medium",
        assigned_to: "",
      });
    } catch (err) {
      console.error("Error saving task:", err.response?.data || err);
    }
  };
  
  const deleteTask = async (id) => {
    if (!window.confirm("แน่ใจไหมว่าจะลบงานนี้?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      await fetchTasks(selectedUser);
    } catch (err) {
      console.error("Error deleting task:", err.response?.data || err);
    }
  };
 
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Project Content {selectedDisplayName}
          </h1>
          {role === "admin" && (
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border px-3 py-1 rounded bg-white shadow"
            >
              {allUsers.map((user) => (
                <option key={user.username} value={user.username}>
                  👤 {user.display_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <UserMenu handleLogout={handleLogout} displayName={displayName} />
      </header>

        {CATEGORIES.map((status) => (
          <div key={status} className="mb-4 border rounded-lg shadow bg-white">
            <div
              onClick={() => toggleSection(status)}
              className="cursor-pointer px-4 py-3 flex items-center gap-3"
            >
              <span className="text-lg">
                {expanded[status] ? "▾" : "▸"}
              </span>
              <span className={`px-2 py-1 rounded ${CATEGORY_LABELS[status]}`}>
                {status}
              </span>
              <span className="text-gray-500 text-sm">({groupedTasks[status]?.length || 0})</span>
            </div>

            {expanded[status] && (
              <div className="px-6 pb-4 space-y-3">
                {groupedTasks[status]?.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 border rounded flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-1">{task.title}</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <p>📌 Department: <span className="font-medium">{task.department}</span></p>
                          <p>📂 Category: <span className="font-medium">{task.category}</span></p>
                          <p>📅 Start date : <span className="font-medium">{task.start_date && dayjs(task.start_date).format("YYYY-MM-DD")}</span></p>
                          <p>✅ End date: <span className="font-medium">{task.actual_date && dayjs(task.actual_date).format("YYYY-MM-DD")}</span></p>
                          <p>⏰ Due date: <span className="font-medium">{task.due_date && dayjs(task.due_date).format("YYYY-MM-DD")}</span></p>
                              <p className="flex items-center gap-2">
                            <span
                              className={`inline-block w-3 h-3 rounded-full ${
                                task.priority === "High"
                                  ? "bg-red-500"
                                  : task.priority === "Medium"
                                  ? "bg-yellow-400"
                                  : "bg-green-500"
                              }`}
                            ></span>
                            Priority: <span className="font-medium">{task.priority}</span>
                          </p>
                      </div>
                      </div>
                    {(role === "admin" || task.created_by === selectedUser) && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => {
                            setEditingTask(task.id);
                            setTaskData({
                              ...task,
                              due_date: task.due_date ? task.due_date.split("T")[0] : "",
                            });
                            setShowForm(true);
                          }}
                          className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-white text-sm"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-sm"
                        >
                          🗑️
                        </button>
                        <button
                          onClick={() => openDescriptionModal(task)}
                          className="bg-indigo-500 hover:bg-indigo-600 px-3 py-1 rounded text-white text-sm"
                        >
                          ✍️ รายละเอียด
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <TaskShowForm
          key={editingTask || "new"}
          show={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
          taskData={taskData}
          categories={CATEGORIES}
          setTaskData={setTaskData} 
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />

        <DescriptionModal
          key={`desc-${selectedTask?.id ?? "new"}`}
          show={showDescriptionModal}
          onClose={() => {
            setShowDescriptionModal(false);
            setSelectedTask(null);
            setDescriptionText("");
            setDescriptionFiles([]);
          }}
          task={selectedTask}
          descriptionText={descriptionText}
          setDescriptionText={setDescriptionText}
          setDescriptionFiles={setDescriptionFiles}
          handleSave={handleSaveDescription}
          isUploading={isUploading}
        />

        <div className="mt-8 text-center">
          <AddTaskButton onClick={() => setShowForm(true)} />
        </div>
      </main>
    </div>
  );
};

export default TrackingPage;
