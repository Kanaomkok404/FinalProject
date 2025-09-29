import { useState, useEffect } from "react";

const testPage = () => {
  const [questions, setQuestions] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [newQuestion, setNewQuestion] = useState({ user_name: "", content: "" });
  const [uploadedFiles, setUploadedFiles] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]); 
  const [previewCommentFiles, setPreviewCommentFiles] = useState({});
  const API_URL = "http://localhost:5000/questions";
  const COMMENT_URL = "http://localhost:5000/comments";

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.error("Error fetching questions:", err));
  }, [questions]);

  useEffect(() => {
    if (!showModal) {
      setPreviewFiles([]); 
      setUploadedFiles([]);
    }
  }, [showModal]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);

    setPreviewFiles(files.map((file) => {
      return file.type.startsWith("image/") ? URL.createObjectURL(file) : "file";
    }));
  };

  
  const handlePost = async () => {
    const formData = new FormData();
    formData.append("user_name", newQuestion.user_name);
    formData.append("content", newQuestion.content);
    uploadedFiles.forEach((file) => formData.append("files", file)); 
  
    try {
      const res = await fetch(API_URL, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to save question");

      const data = await res.json();
      setQuestions((prev) => [data, ...prev]);
      closeModal();
    } catch (err) {
      console.error("Error saving question:", err);
    }
  };

 
  const removePreviewFile = (index) => {
    setPreviewFiles(previewFiles.filter((_, i) => i !== index));
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div>
      {/* ฟอร์มสร้างโพสต์ */}
      <button onClick={() => setShowModal(true)}>สร้างโพสต์</button>

      {showModal && (
        <div className="modal">
          <input
            type="text"
            name="user_name"
            placeholder="ชื่อผู้ใช้"
            value={newQuestion.user_name}
            onChange={(e) => setNewQuestion({ ...newQuestion, user_name: e.target.value })}
          />
          <textarea
            name="content"
            placeholder="เขียนคำถาม..."
            value={newQuestion.content}
            onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
          />
          
          <input type="file" multiple onChange={handleFileChange} />
          
          {/* แสดงไฟล์ที่อัปโหลด */}
          <div className="preview">
            {previewFiles.map((file, index) => (
              <div key={index} className="file-preview">
                {file === "file" ? (
                  <span>📄 ไฟล์แนบ</span>
                ) : (
                  <img src={file} alt="Preview" width="100" />
                )}
                <button onClick={() => removePreviewFile(index)}>❌</button>
              </div>
            ))}
          </div>

          <button onClick={handlePost}>โพสต์</button>
          <button onClick={closeModal}>ปิด</button>
        </div>
      )}

      {/* แสดงโพสต์ */}
      <div>
        {questions.map((q) => (
          <div key={q.id}>
            <h3>{q.user_name}</h3>
            <p>{q.content}</p>

            {/* แสดงไฟล์แนบ */}
            {q.file_urls && q.file_urls.length > 0 && (
              <div>
                <h4>ไฟล์แนบ:</h4>
                {q.file_urls.map((file, index) => (
                  <div key={index}>
                    {file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".jpeg") ? (
                      <img src={`http://localhost:5000/uploads/${file}`} alt="uploaded" width="100" />
                    ) : (
                      <a href={`http://localhost:5000/uploads/${file}`} download>📄 ดาวน์โหลดไฟล์</a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default testPage;
