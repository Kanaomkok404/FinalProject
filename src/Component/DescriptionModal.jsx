import React, { useState, useEffect } from "react";

const DescriptionModal = ({
  show,
  onClose,
  task,
  descriptionText,
  setDescriptionText,
  setDescriptionFiles,
  handleSave,
  isUploading,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [existingFiles, setExistingFiles] = useState([]);
  const [originalText, setOriginalText] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [originalFiles, setOriginalFiles] = useState([]);

  useEffect(() => {
    if (task?.description_files) {
      setExistingFiles(task.description_files);
      setOriginalFiles(task.description_files); 
    }
    if (task?.description) {
      setDescriptionText(task.description);
      setOriginalText(task.description); 
    }
  }, [task]);

  const toggleEditMode = () => {
    setEditMode(true);
  };

  const cancelEdit = () => {
    setDescriptionText(originalText); 
    setExistingFiles(originalFiles); 
    setDescriptionFiles([]); 
    setEditMode(false);
  };

  const removeOldFile = (index) => {
    setExistingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const confirmSave = async () => {
    const confirmed = window.confirm(
      "⚠️ ข้อมูลใหม่จะไปแทนที่รายละเอียดเดิมทั้งหมด\nคุณแน่ใจหรือไม่ว่าต้องการบันทึก?"
    );
    if (confirmed) {
      const updatedTask = await handleSave(existingFiles); 
      if (updatedTask?.description) {
        setDescriptionText(updatedTask.description); 
        setOriginalText(updatedTask.description);
        setOriginalFiles(updatedTask.description_files || []);
      }
      setEditMode(false);
    }
  };

  if (!show || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[1200px] h-[800px] relative flex flex-col">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-500 text-2xl">❌</button>

        <h2 className="text-2xl font-bold mb-2 text-gray-800">📝 รายละเอียดของ Task</h2>
        <p className="text-sm text-gray-600 mb-4">
          <strong>Task:</strong> {task.title}
        </p>

        <div className="flex-1 overflow-y-auto border rounded p-4 mb-4 bg-gray-50">
          <textarea
            className={`w-full border rounded p-2 h-32 mb-4 resize-none ${editMode ? "" : "bg-gray-100"}`}
            value={descriptionText}
            onChange={(e) => setDescriptionText(e.target.value)}
            readOnly={!editMode}
          />

          {existingFiles.length > 0 && (
            <div>
              <p className="text-gray-700 mb-2">📎 ไฟล์แนบ:</p>
              <div className="grid grid-cols-3 gap-4">
                {existingFiles.map((file, idx) => {
                  const isImage = /\.(png|jpe?g|gif|webp)$/i.test(file.name);
                  return (
                    <div key={idx} className="relative">
                      {isImage ? (
                        <img src={file.url} alt={file.name} className="w-full h-40 object-cover rounded border"  onClick={() => setPreviewImage(file.url)} />
                      ) : (
                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                          📄 {file.name}
                        </a>
                      )}
                      {editMode && (
                        <button
                          onClick={() => removeOldFile(idx)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t flex justify-between items-center">
          {editMode ? (
            <>
              <div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setDescriptionFiles([...e.target.files])}
                />
              </div>
              <div className="space-x-2">
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={confirmSave}
                  disabled={isUploading}
                >
                  {isUploading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
                </button>
                <button
                  className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  onClick={cancelEdit}
                  disabled={isUploading}
                >
                  ❌ ยกเลิก
                </button>
              </div>
            </>
          ) : (
            <button
              className="px-5 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={toggleEditMode}
            >
              ✏️ แก้ไข
            </button>
          )}
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-4xl max-h-[90vh] rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default DescriptionModal;
