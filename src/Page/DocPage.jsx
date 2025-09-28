import { useState, useEffect } from "react";
import axios from "axios";
import "../index.css";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import UserMenu from "../Component/UserMenu";
import AddTaskButton from "../Component/AddTaskButton";

const DocPage = () => {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showConfirmDownloadPopup, setShowConfirmDownloadPopup] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const { logout, displayName, role, username, token } = useAuth();
  const navigate = useNavigate();

  const API_URL = `${import.meta.env.VITE_API_URL}/documents`;

  const authAxios = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchDocuments = async () => {
    try {
      const response = await authAxios.get("/documents");
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleConfirmDownload = (doc) => {
    setSelectedDoc(doc);
    setShowConfirmDownloadPopup(true);
  };

  const triggerDownload = () => {
    if (!selectedDoc) return;
    const link = document.createElement("a");
    link.href = `${API_URL}/download/${selectedDoc.id}`;
    link.setAttribute("download", selectedDoc.name || "downloaded_file");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowConfirmDownloadPopup(false);
    setSelectedDoc(null);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!file) return alert("กรุณาเลือกไฟล์ก่อน!");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setDocuments([...documents, response.data]);
      setShowUploadPopup(false);
      setFile(null);
      setDescription("");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?")) return;

    try {
      await authAxios.delete(`/documents/delete/${id}`);
      setDocuments(documents.filter((doc) => doc.id !== id));
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const formatFileSize = (size) => {
    if (size < 1024) return size + " B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
    else return (size / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-6 relative">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Document</h1>
          <UserMenu handleLogout={handleLogout} displayName={displayName} />
        </header>

        <section className="mt-6 relative">
          <h2 className="text-xl font-semibold mb-2">Files</h2>

          <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border-r">Name</th>
                <th className="px-4 py-2 text-left border-r">Description</th>
                <th className="px-4 py-2 text-left border-r">Size</th>
                <th className="px-4 py-2 text-left border-r">Uploaded At</th>
                <th className="px-4 py-2 text-left border-r">Uploaded By</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-r">
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {doc.name}
                    </a>
                  </td>
                  <td className="px-4 py-2 border-r">{doc.description}</td>
                  <td className="px-4 py-2 border-r">{formatFileSize(doc.size)}</td>
                  <td className="px-4 py-2 border-r">
                    {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : "N/A"}
                  </td>
                  <td className="px-4 py-2 border-r">{doc.created_by}</td>
                  <td className="px-4 py-2">
                  <button
                      onClick={() => handleConfirmDownload(doc)}
                      className="text-blue-500 hover:underline"
                    >
                      📥
                    </button>
                {(role === "admin" || doc.created_by === username) && (
                  <button
                    onClick={() => handleDeleteFile(doc.id)}
                    className="text-red-500 hover:underline ml-4"
                  >
                    🗑️
                  </button>
                )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <AddTaskButton onClick={() => setShowUploadPopup(true)} />

        {showUploadPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Upload New File</h2>
              <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded mb-2" />
              <input
                type="text"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUploadFile()}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowUploadPopup(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={handleUploadFile}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        )}

          {showConfirmDownloadPopup && selectedDoc && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-auto break-words">
                <h2 className="text-lg font-semibold mb-4">ยืนยันการดาวน์โหลด</h2>
                <p className="mb-4">
                  ต้องการดาวน์โหลดไฟล์ <strong className="break-words">{selectedDoc.name}</strong> ใช่หรือไม่?
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowConfirmDownloadPopup(false);
                      setSelectedDoc(null);
                    }}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={triggerDownload}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                  >
                    ดาวน์โหลด
                  </button>
                </div>
              </div>
            </div>
          )}

      </main>
    </div>
  );
};

export default DocPage;
