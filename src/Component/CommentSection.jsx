import React from 'react';

const CommentSection = ({
  questionId,
  username,
  role,
  comments,
  newComments,
  handleCommentChange,
  handleCommentFileChange,
  postComment,
  deleteComment,
  previewCommentImages,
  removePreviewCommentImage,
  isUploading
}) => {

  const renderFilePreview = (file, index) => {
    const ext = file.name?.split(".").pop()?.toLowerCase();
    const url = URL.createObjectURL(file);

    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
      return (
        <div key={index} className="relative w-24 h-24">
          <img src={url} alt="preview" className="w-full h-full object-cover rounded" />
          <button onClick={() => removePreviewCommentImage(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
        </div>
      );
    }

    if (["mp4", "webm", "ogg", "mkv", "mov"].includes(ext)) {
      return (
        <div key={index} className="relative w-32 h-24">
          <video src={url} controls className="w-full h-full object-cover rounded" />
          <button onClick={() => removePreviewCommentImage(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
        </div>
      );
    }

    if (["mp3", "wav", "ogg", "aac"].includes(ext)) {
      return (
        <div key={index} className="relative w-32">
          <audio controls className="w-full"><source src={url} /></audio>
          <button onClick={() => removePreviewCommentImage(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
        </div>
      );
    }

    if (ext === "pdf") {
      return (
        <div key={index} className="relative w-24 h-24 border rounded bg-white flex items-center justify-center">
          <embed src={url} type="application/pdf" className="w-full h-full rounded" />
          <button onClick={() => removePreviewCommentImage(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
        </div>
      );
    }

    // ไฟล์ทั่วไป
    return (
      <div key={index} className="relative bg-gray-100 rounded-md p-2 text-xs w-28">
        <p className="truncate">{file.name}</p>
        <button onClick={() => removePreviewCommentImage(index)}
          className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
      </div>
    );
  };

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
      {/* แสดงรายการคอมเมนต์ */}
      {comments?.length > 0 ? (
        comments.map((c) => (
          <div key={c.id} className="border-b border-gray-300 pb-2 mb-4">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-2" />
                <p className="font-semibold">{c.display_name}</p>
              </div>
              {(username === c.user_name || role === "admin") && (
                <button
                  onClick={() => deleteComment(c.id, questionId)}
                  className="text-red-500 text-sm hover:text-red-700">ลบ</button>
              )}
            </div>
            <p className="mb-1">{c.content}</p>
            {c.file_urls?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {c.file_urls.map((file, i) => (
                  <a key={i} href={decodeURIComponent(file)} target="_blank" rel="noreferrer"
                    className="text-blue-600 text-xs underline truncate w-40">
                    📎 {file.split("/").pop()}
                  </a>
                ))}
              </div>
            )}
            <p className="text-right text-xs text-gray-500 mt-1">
              {new Date(c.created_at).toLocaleString()}
            </p>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm italic">ยังไม่มีคอมเมนต์</p>
      )}

      {/* กล่องพิมพ์คอมเมนต์ */}
      <div className="mt-4">
        <textarea
          value={newComments || ''}
          onChange={(e) => handleCommentChange(questionId, e.target.value)}
          placeholder="พิมพ์คอมเมนต์ที่นี่..."
          className="w-full p-2 border rounded-md mb-2"
        />

        <input
          type="file"
          multiple
          onChange={(e) => handleCommentFileChange(questionId, e.target.files)}
          className="mb-2"
        />

        {/* preview ไฟล์แนบ */}
        {previewCommentImages?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-2">
            {previewCommentImages.map((img, index) => renderFilePreview(img, index))}
          </div>
        )}

        <button
          onClick={() => postComment(questionId)}
          className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${isUploading ? 'opacity-50' : ''}`}
          disabled={isUploading}>
          {isUploading ? "กำลังโพสต์..." : "โพสต์คอมเมนต์"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
