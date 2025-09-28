import React from 'react';
import CommentSection from './CommentSection';

const QuestionItem = ({
  q,
  username,
  role,
  comments,
  showCommentBox,
  newComments,
  previewCommentImages,
  handleDeletePost,
  fetchComments,
  setShowCommentBox,
  handleCommentChange,
  handleCommentFileChange,
  postComment,
  deleteComment,
  openModal,
  removePreviewCommentImage,
  isUploading
}) => {
  const toggleCommentBox = () => {
    fetchComments(q.id);
    setShowCommentBox(prev => ({
      ...prev,
      [q.id]: !prev[q.id]
    }));
  };

  const filePreview = (file, index) => {
    const ext = file.split('.').pop().toLowerCase();
    const url = decodeURIComponent(file);

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return (
        <img key={index} src={url} alt="ภาพแนบ"
          className="w-60 h-60 object-cover rounded-lg cursor-pointer"
          onClick={() => openModal(url)} />
      );
    }
    if (['mp4', 'webm', 'ogg', 'mkv', 'mov'].includes(ext)) {
      return (
        <video key={index} controls className="w-60 h-60 object-cover rounded-lg">
          <source src={url} />
        </video>
      );
    }
    if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) {
      return (
        <div key={index} className="flex items-center justify-center w-60 h-60 rounded-lg">
          <audio controls className="w-52">
            <source src={url} />
          </audio>
        </div>
      );
    }
    if (ext === 'pdf') {
      return (
        <div key={index} className="relative w-60 h-60 border rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openModal(url)}>
          <iframe src={url} className="w-full h-full" title="PDF Preview" />
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white font-bold text-lg">
            คลิกเพื่อดูรูปใหญ่
          </div>
        </div>
      );
    }

    return (
      <div key={index} className="w-60 flex flex-col items-center justify-center border rounded-lg p-2">
        <p className="text-sm font-semibold text-gray-700 truncate w-52 text-center">{file.split('/').pop()}</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
          ดาวน์โหลดไฟล์
        </a>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 relative">
      {/* หัวข้อผู้โพสต์ */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <h2 className="ml-4 font-bold">{q.display_name}</h2>
        </div>
        {(username === q.user_name || role === "admin") && (
          <button onClick={() => handleDeletePost(q.id)} className="text-red-500 hover:text-red-700">
            🗑️
          </button>
        )}
      </div>

      {/* เนื้อหาโพสต์ */}
      <p>{q.content}</p>

      {/* ไฟล์แนบ */}
      {q.file_urls?.length > 0 ? (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {q.file_urls.map((file, i) => filePreview(file, i))}
        </div>
      ) : (
        <p className="text-gray-400 text-center mt-2">ไม่มีไฟล์แนบ</p>
      )}

      {/* เวลาโพสต์ */}
      <p className="text-gray-500 text-sm text-right mt-2">
        {new Date(q.created_at).toLocaleString()}
      </p>

      {/* ปุ่มแสดงคอมเมนต์ */}
      <button
        onClick={toggleCommentBox}
        className="mt-3 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        💬 แสดงคอมเมนต์
      </button>

      {/* แสดงคอมเมนต์ */}
      {showCommentBox[q.id] && (
        <CommentSection
          questionId={q.id}
          username={username}
          role={role}
          comments={comments[q.id]}
          newComments={newComments[q.id]}
          handleCommentChange={(id, value) => handleCommentChange(id, value)}
          handleCommentFileChange={(id, files) => handleCommentFileChange(id, files)}
          postComment={postComment}
          deleteComment={deleteComment}
          previewCommentImages={previewCommentImages[q.id] || []}
          removePreviewCommentImage={(index) => removePreviewCommentImage(index, q.id)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export default QuestionItem;
