  import { useState, useEffect } from "react";
  import axios from "axios";
  import { useAuth } from "../AuthContext";
  import { useNavigate } from "react-router-dom";
  import UserMenu from "../Component/UserMenu";
  import AddTaskButton from "../Component/AddTaskButton";
  import KeepModal from "../Component/KeepModal";
  import MediaPreview from "../Component/MediaPreview";

  const QuestionPage = () => {
    const [questions, setQuestions] = useState([]);
    const [comments, setComments] = useState({});
    const [newComments, setNewComments] = useState({});
    const [showCommentBox, setShowCommentBox] = useState({});
    const [newQuestion, setNewQuestion] = useState({ content: "" });
    const [imageFiles, setImageFiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);
    const [modalUrl, setModalUrl] = useState(null); 
    const [previewCommentImages, setPreviewCommentImages] = useState({}); 
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [keepModalOpen, setKeepModalOpen] = useState(false);
    const [postToKeep, setPostToKeep] = useState(null);
    const [keepTitle, setKeepTitle] = useState("");
    const { logout, displayName, role, username, token } = useAuth(); 
    const navigate = useNavigate();
    const API_URL = `${import.meta.env.VITE_API_URL}/questions`;
    const COMMENT_URL = `${import.meta.env.VITE_API_URL}/comments`;

    useEffect(() => {
      axios.get(API_URL)
        .then((res) => setQuestions(res.data))
        .catch((err) => console.error("Error fetching questions:", err));
    }, []);
    
    useEffect(() => {
      if (!showModal) {
        setPreviewImages([]); 
        setImageFiles([]);
      }
    }, [showModal]);

    const handleLogout = () => {
      logout();
      navigate("/login");
    };

    const openKeepModal = (post) => {
      setPostToKeep(post);
      setKeepTitle(""); // reset
      setKeepModalOpen(true);
    };

    const handleKeepPost = async () => {
      if (!keepTitle || !postToKeep) return;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/keeps`, {
          question_id: postToKeep.id,
          custom_title: keepTitle,
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setQuestions((prev) => prev.filter((q) => q.id !== postToKeep.id));
        setKeepModalOpen(false);
        setPostToKeep(null);
      } catch (err) {
        console.error("Keep post error:", err);
      }
    };
    
    const fetchComments = async (question_id) => {
      try {
        const res = await axios.get(`${COMMENT_URL}/${question_id}`);
        setComments((prev) => ({ ...prev, [question_id]: res.data }));
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    
    const handleCommentChange = (e, question_id) => {
      setNewComments({ ...newComments, [question_id]: e.target.value });
    };

    const postComment = async (question_id) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("question_id", question_id);
      formData.append("user_name", "User");
      formData.append("content", newComments[question_id] || "");
    
      if (imageFiles[question_id]) {
        imageFiles[question_id].forEach((file) => formData.append("files", file));
      }
    
      try {
        const res = await axios.post(COMMENT_URL, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });      
        setComments((prev) => ({
          ...prev,
          [question_id]: [...(prev[question_id] || []), res.data],
        }));
    
        setNewComments({ ...newComments, [question_id]: "" });
        setImageFiles((prev) => ({ ...prev, [question_id]: [] }));
        setPreviewCommentImages((prev) => ({ ...prev, [question_id]: [] }));
      } catch (err) {
        console.error("Error posting comment:", err);
      }finally {
        setIsUploading(false);  
      }
    };
    
    const deleteComment = async (comment_id, question_id) => {
      if (!window.confirm("แน่ใจไหมว่าจะลบคอมเมนต์นี้?")) return;
      try {
        await axios.delete(`${COMMENT_URL}/${comment_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setComments((prev) => ({
          ...prev,
          [question_id]: prev[question_id].filter((c) => c.id !== comment_id),
        }));
      } catch (err) {
        console.error("Error deleting comment:", err);
      }
    };
    
    const handleChange = (e) => {
      setNewQuestion({ ...newQuestion, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      setImageFiles(files);
    
      const previews = files.map((file) => {
        if (file.type.startsWith("image/")) {
          return { type: "image", url: URL.createObjectURL(file) };
        } else if (file.type.startsWith("video/")) {
          return { type: "video", url: URL.createObjectURL(file) };
        } else if (file.type.startsWith("audio/")) {
          return { type: "audio", url: URL.createObjectURL(file) };
        } else if (file.type === "application/pdf") {
          return { type: "pdf", url: URL.createObjectURL(file) };
        } else {
          return { type: "file", name: file.name };
        }
      });
    
      setPreviewImages(previews);
    };
    
    const handleDeletePost = async (id) => {
      if (!window.confirm("แน่ใจไหมว่าจะลบโพสต์นี้?")) return;
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuestions((prev) => prev.filter((q) => q.id !== id));
      } catch (err) {
        console.error("Error deleting question:", err);
      }
    };

    const handlePost = async () => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("content", newQuestion.content);
      formData.append("user_name", displayName);
      imageFiles.forEach((file) => formData.append("files", file));
    
      try {
        const res = await axios.post(API_URL, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setQuestions((prev) => [res.data, ...prev]);
        closeModal();
      } catch (err) {
        console.error("Error saving question:", err);
      }finally {
      setIsUploading(false);  
    }
    };
    
    const closeModal = () => {
      setShowModal(false);
      setEditingQuestion(null);
      setNewQuestion({ user_name: displayName, content: "" });
      setImageFiles([]);  
      setPreviewImages([]); 
      setModalUrl(null);
    };

    const openModal = (url) => {
      const fixedUrl = decodeURIComponent(url); 
      setModalUrl(fixedUrl);
    };

    const handleCommentFileChange = (e, question_id) => {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => ({ ...prev, [question_id]: files }));
    
      const previews = files.map((file) => {
        if (file.type.startsWith("image/")) {
          return { type: "image", url: URL.createObjectURL(file) };
        } else if (file.type.startsWith("video/")) {
          return { type: "video", url: URL.createObjectURL(file) };
        } else if (file.type.startsWith("audio/")) {
          return { type: "audio", url: URL.createObjectURL(file) };
        } else if (file.type === "application/pdf") {
          return { type: "pdf", url: URL.createObjectURL(file) };
        } else {
          return { type: "file", name: file.name };
        }
      });
    
      setPreviewCommentImages((prev) => ({
        ...prev,
        [question_id]: previews,
      }));
    };
    
    const removePreviewImage = (index) => {
      setPreviewImages(previewImages.filter((_, i) => i !== index));
      setImageFiles(imageFiles.filter((_, i) => i !== index));
    };
    
    const removePreviewCommentImage = (index, question_id) => {
      setPreviewCommentImages((prev) => ({
        ...prev,
        [question_id]: prev[question_id].filter((_, i) => i !== index),
      }));
      setImageFiles((prev) => ({
        ...prev,
        [question_id]: prev[question_id].filter((_, i) => i !== index),
      }));
    };
  
  return (
    <div className="flex min-h-screen bg-gray-100 p-6">
      <main className="w-full">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Q&A Page</h1>
        <UserMenu handleLogout={handleLogout} displayName={displayName} />
      </header>

        {questions.map((q) => (
          <div key={q.id} className="bg-white p-4 rounded-lg shadow-md mb-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <h2 className="ml-4 font-bold">{q.display_name}</h2>
              </div>
              <div className="flex space-x-2">
              {(username === q.user_name || role === "admin") && (
                <div>
                <button className="text-red-500 hover:text-red-700" onClick={() => handleDeletePost(q.id)}>
                  🗑️
                </button>
                <button
                  onClick={() => openKeepModal(q)}
                  className="text-yellow-500 hover:text-yellow-700 ml-2"
                >
                  📌 
                </button>
                </div>
              )}
              </div>
            </div>
            <p>{q.content}</p>
            {q.file_urls && q.file_urls.length > 0 ? (
                    <div className="flex justify-center gap-2 overflow-x-auto mt-2">
                      {q.file_urls.map((file, i) => {
                        const ext = file.split('.').pop().toLowerCase();
                        const url = decodeURIComponent(file);

                        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
                          return (
                            <img key={i} src={url} alt={`ไฟล์แนบหมายเลข ${i + 1}`}
                              className="w-60 h-60 object-cover rounded-lg cursor-pointer"
                              onClick={() => openModal(url)} />
                          );
                        }
                        if (['mp4', 'webm', 'ogg', 'mkv', 'mov'].includes(ext)) {
                          return (
                            <video key={i} controls className="w-60 h-60 object-cover rounded-lg">
                              <source src={url} />
                            </video>
                          );
                        }
                        if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
                          return (
                            <div key={i} className="flex items-center justify-center w-60 h-60 rounded-lg">
                              <audio controls className="w-52">
                                <source src={url} />
                              </audio>
                            </div>
                          );
                        }
                        if (ext === 'pdf') {
                          return (
                            <div key={i} className="relative w-60 h-60 border rounded-lg overflow-hidden cursor-pointer"
                              onClick={() => openModal(url)}>
                              <iframe src={url} className="w-full h-full" title={`ไฟล์ PDF ${i + 1}`} />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-bold text-lg">
                                คลิกเพื่อดูรูปใหญ่
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="w-60 flex flex-col items-center justify-center border rounded-lg p-2">
                            <p className="text-sm font-semibold text-gray-700 text-center truncate w-52">{file.split('/').pop()}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer"
                              className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                              ดาวน์โหลดไฟล์
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center">ไม่มีไฟล์แนบ</p>
                  )}

                  <p className="text-gray-500 text-sm text-right mt-2">
                    {new Date(q.created_at).toLocaleString()}
                  </p>

            <button onClick={() => { fetchComments(q.id); setShowCommentBox({ ...showCommentBox, [q.id]: !showCommentBox[q.id] }); }}
              className="mt-2 px-4 py-2 bg-gray-200 rounded-lg">
              💬 แสดงคอมเมนต์
            </button>

            {showCommentBox[q.id] && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                {comments[q.id]?.map((comment) => (
                  <div key={comment.id} className="relative border-b  flex justify-between">
                    <div>
                    <div className="flex items-center ">
                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
                    <p className="font-semibold">{comment.display_name}</p>
                     </div>
                      <p>{comment.content}</p>
                      {comment.file_urls && comment.file_urls.length > 0 && (
                          <div className="flex justify-center gap-2 overflow-x-auto mt-2">
                            {comment.file_urls.map((file, index) => {
                              const ext = file.split(".").pop().toLowerCase();
                              const url = decodeURIComponent(file);

                              if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
                                return (
                                  <img key={index} src={url} alt="Comment Image" 
                                    className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                                    onClick={() => openModal(url)} />
                                );
                              }
                              if (["mp4", "webm", "ogg", "mkv", "mov"].includes(ext)) {
                                return (
                                  <video key={index} controls className="w-32 h-32 object-cover rounded-lg">
                                    <source src={url} />
                                  </video>
                                );
                              }
                              if (["mp3", "wav", "ogg", "aac"].includes(ext)) {
                                return (
                                  <div key={index} className="flex items-center justify-center w-32 h-32 rounded-lg">
                                    <audio controls className="w-28">
                                      <source src={url} />
                                    </audio>
                                  </div>
                                );
                              }
                              if (ext === 'pdf') {
                                return (
                                  <div key={index} className="relative w-32 h-32 border rounded-lg overflow-hidden cursor-pointer"
                                    onClick={() => openModal(url)}>
                                    <iframe src={url} className="w-full h-full" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-bold text-lg">
                                      คลิกเพื่อดูรูปใหญ่ใหญ่
                                    </div>
                                  </div>
                                );
                              }
                              return (
                                <div key={index} className="w-28 flex flex-col items-center justify-center border rounded-md p-1">
                                <p className="text-xs font-medium text-gray-700 text-center truncate w-24">{file.split('/').pop()}</p>
                                <a href={url} target="_blank" rel="noopener noreferrer"
                                  className="mt-1 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
                                  ดาวน์โหลด
                                </a>
                              </div>
                              );
                            })}
                          </div>
                        )}
                    </div>
                    {(username === comment.user_name || role === "admin") && (
                      <button onClick={() => deleteComment(comment.id, q.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700">🗑️</button>
                    )}
                    
                    <p className="text-gray-500 text-xs absolute bottom-2 right-2">
                      {new Date(comment.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}

                <input type="text" value={newComments[q.id] || ""} onChange={(e) => handleCommentChange(e, q.id)}
                  className="border p-2 w-full my-2" placeholder="เขียนคอมเมนต์..." />
                    {previewCommentImages[q.id]?.length > 0 && (
                      <MediaPreview
                        files={previewCommentImages[q.id]}
                        onRemove={(index) => removePreviewCommentImage(index, q.id)}
                        size="sm" 
                      />
                    )}

                <input type="file" multiple onChange={(e) => handleCommentFileChange(e, q.id)} className="my-2" />
                <button
                  onClick={() => postComment(q.id)}
                  disabled={isUploading}
                  className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition ${
                    isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
                  }`}
                >
                  {isUploading ? "กำลังอัปโหลด..." : "ส่ง"}
                </button>
              </div>
            )}
          </div>
        ))}

        <AddTaskButton onClick={() => setShowModal(true)} />

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative">
              <button onClick={closeModal} className="absolute top-2 right-2 text-red-500 text-xl">❌</button>

              <h2 className="text-lg font-semibold mb-2">{editingQuestion ? "แก้ไขโพสต์" : "โพสต์คำถามใหม่"}</h2>
              <input
                type="text"
                name="user_name"
                value={displayName}
                readOnly
                className="border p-2 w-full mb-2 bg-gray-100 text-gray-700"
              />
              <textarea name="content" value={newQuestion.content} onChange={handleChange}
                placeholder="พิมพ์คำถามของคุณ..." className="border p-2 w-full mb-2 h-32" />
                {previewImages.length > 0 && (<MediaPreview files={previewImages} onRemove={removePreviewImage} />)}

              <input type="file" multiple onChange={handleFileChange} className="border p-2 w-full mb-2" />
              <button onClick={handlePost} className="px-4 py-2 bg-green-500 text-white rounded-lg" disabled={isUploading} >{isUploading ? "กำลังอัปโหลด..." : "โพสต์"}</button>
            </div>
          </div>
        )}
        
        {modalUrl && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <button onClick={closeModal} className="absolute top-5 right-5 bg-white text-red-500 rounded-full p-2 text-2xl shadow-lg">
                ❌
              </button>
              <div className="relative max-w-screen-lg max-h-[90vh] w-full flex items-center justify-center">
                {modalUrl.endsWith('.pdf') ? (
                  <embed src={modalUrl} type="application/pdf" className="w-full h-[80vh] overflow-auto" />
                ) : (
                  <img src={modalUrl} alt="Enlarged preview" className="max-w-full max-h-full rounded-lg" />
                )}
              </div>
            </div>
          )}

            <KeepModal
              visible={keepModalOpen}
              onClose={() => setKeepModalOpen(false)}
              onConfirm={handleKeepPost}
              keepTitle={keepTitle}
              setKeepTitle={setKeepTitle}
            />
      </main>
    </div>
  );
};

export default QuestionPage;
  