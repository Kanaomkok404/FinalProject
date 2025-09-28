import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../AuthContext";
import UserMenu from "../Component/UserMenu";
import MediaPreview from "../Component/MediaPreview";

const KeptQuestionsPage = () => {
  const { username, displayName, logout, role } = useAuth();
  const [keptPosts, setKeptPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [selectedPost, setSelectedPost] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const API = import.meta.env.VITE_API_URL;

  const openPreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
    setShowPreviewModal(true);
  };
  
  const closePreview = () => {
    setShowPreviewModal(false);
    setPreviewUrl(null);
    setPreviewType(null);
  };
  
  const convertToPreviewFormat = (urls) => {
    return urls.map((file) => {
      const url = decodeURIComponent(file);
      const ext = url.split('.').pop().toLowerCase();
  
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
        return { type: "image", url };
      } else if (["mp4", "webm", "ogg", "mov", "mkv"].includes(ext)) {
        return { type: "video", url };
      } else if (["mp3", "wav", "aac"].includes(ext)) {
        return { type: "audio", url };
      } else if (ext === "pdf") {
        return { type: "pdf", url };
      } else {
        return { type: "file", url, name: url.split("/").pop() };
      }
    });
  };
  
  useEffect(() => {
    axios
      .get(`${API}/keeps/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setKeptPosts(res.data);
        res.data.forEach((post) => {
          axios
            .get(`${API}/keeps/${post.id}/comments`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            .then((res) => {
              console.log(`🔍 Comments for keptId ${post.id}:`, res.data);
              setComments((prev) => ({ ...prev, [post.question_id]: res.data }));
            })
            .catch((err) => {
              console.error(`Error fetching comments for kept post ${post.id}:`, err);
            });
        });
      })
      .catch((err) => console.error("Error fetching kept posts:", err));
  }, []);

  const handleDeleteKept = async (keptId) => {
    if (!window.confirm("แน่ใจไหมว่าจะลบโพสต์นี้?")) return;
    try {
      await axios.delete(`${API}/keeps/${keptId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setKeptPosts((prev) => prev.filter((p) => p.id !== keptId));
    } catch (err) {
      console.error("Error deleting kept post:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📌 โพสต์ที่เก็บไว้ </h1>
        <UserMenu handleLogout={logout} displayName={displayName} />
      </header>

      {keptPosts.length === 0 ? (
        <p className="text-center text-gray-500">ยังไม่มีโพสต์ที่เก็บไว้</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {keptPosts.map((post) => (
            <div key={post.id} onClick={() => setSelectedPost(post)}
            className="bg-white p-4 rounded-lg shadow-md relative flex flex-col cursor-pointer hover:ring-2 hover:ring-blue-300 transition">
              <h2 className="font-bold text-lg mb-1">{post.custom_title}</h2>
              <p className="text-sm text-gray-500 mb-2">จากโพสต์ของ: {post.display_name}</p>
              <p className="line-clamp-3 text-sm text-gray-700">{post.content}</p>
              {post.file_urls && post.file_urls.length > 0 && (
                <div className="flex gap-2 justify-center flex-wrap mt-2">
                  {post.file_urls.map((file, i) => {
                      const url = decodeURIComponent(file);
                      const ext = url.split(".").pop().toLowerCase();
                      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
                        return (
                          <img
                            key={i}
                            src={url}
                            alt="preview"
                            className="w-16 h-16 object-cover rounded"
                          />
                        );
                      }
                      return (
                        <div
                          key={i}
                          className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm"
                        >
                          📎
                        </div>
                      );
                    })}
                </div>
              )}
              <p className="text-right text-xs text-gray-400 mt-4">
                เก็บเมื่อ: {new Date(post.created_at).toLocaleString()}
              </p>
              {(post.kept_by === username || role === "admin") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteKept(post.id);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                )}
            </div>
          ))};

          {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-lg p-6 w-[70vw] max-h-[90vh] overflow-y-auto shadow-lg relative">
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
              >
                ❌
              </button>
              <h2 className="text-2xl font-bold mb-2">{selectedPost.custom_title}</h2>
              <p className="text-sm text-gray-500 mb-2">จากโพสต์ของ: {selectedPost.display_name}</p>
              <p className="mb-4">{selectedPost.content}</p>

              {selectedPost.file_urls && selectedPost.file_urls.length > 0 && (
                <MediaPreview
                files={convertToPreviewFormat(selectedPost.file_urls)}
                onPreview={(url, type) => openPreview(url, type)}
                isModal={true}
              />
              )}

              <div className="mt-6 max-h-[60vh] overflow-y-auto">
                  <h3 className="font-bold mb-2">💬 ความคิดเห็น</h3>
                  {comments[selectedPost.question_id]?.length > 0 ? (
                    comments[selectedPost.question_id].map((comment, i) => (
                      <div key={i} className="pb-3 mb-3">
                        <p className="text-sm font-semibold">{comment.user_name}</p>
                        <p className="text-sm text-gray-800 mb-1">{comment.content}</p>

                        {comment.file_urls && comment.file_urls.length > 0 && (
                          <MediaPreview
                            files={convertToPreviewFormat(comment.file_urls)}
                            onPreview={(url, type) => openPreview(url, type)}
                            isModal={true}
                          />
                        )}

                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">ยังไม่มีความคิดเห็น</p>
                  )}
                </div>
              <p className="text-right text-xs text-gray-400 mt-6">
                เก็บเมื่อ: {new Date(selectedPost.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
        {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="relative max-w-5xl max-h-[90vh]">
              <button
                onClick={closePreview}
                className="fixed top-4 right-4 z-50 text-white text-3xl bg-black bg-opacity-50 rounded-full px-3 py-1 hover:bg-opacity-80"
              >
                ❌
              </button>
                {previewType === "image" ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-[85vh] rounded-lg" />
                ) : previewType === "video" ? (
                  <video controls className="max-w-full max-h-[85vh] rounded-lg">
                    <source src={previewUrl} type="video/mp4" />
                  </video>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeptQuestionsPage;
