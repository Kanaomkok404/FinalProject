import React from "react";

const MediaPreview = ({ files, onRemove, size = "md", onPreview, isModal = false }) => {
  const getClass = (type) => {
    if (isModal) return "w-64 h-64 object-contain rounded mx-auto cursor-pointer";
    if (type === "image") return size === "sm" ? "w-20 h-20" : "w-24 h-24";
    if (type === "video") return size === "sm" ? "w-32 h-32" : "w-40 h-40";
    if (type === "audio") return size === "sm" ? "w-32" : "w-40";
    if (type === "pdf") return size === "sm" ? "w-20 h-20" : "w-24 h-24";
    return "w-32 h-20";
  };

  return (
    <div className={`flex flex-wrap gap-2 ${isModal ? "justify-center" : ""}`}>
      {files.map((file, index) => (
        <div key={index} className="relative">
          {file.type === "image" ? (
            <img
              src={file.url}
              alt="Preview"
              className={getClass("image")}
              onClick={() => onPreview?.(file.url, "image")}
            />
          ) : file.type === "video" ? (
            <video
              controls
              className={getClass("video")}
              onClick={() => onPreview?.(file.url, "video")}
            >
              <source src={file.url} />
            </video>
          ) : file.type === "audio" ? (
            <audio controls className={getClass("audio")}>
              <source src={file.url} />
            </audio>
          ) : file.type === "pdf" ? (
            <embed src={file.url} type="application/pdf" className={getClass("pdf")} />
          ) : (
            <div className={getClass("file") + " flex items-center justify-center bg-gray-200 rounded-lg"}>
              <span className="text-xs">{file.name}</span>
            </div>
          )}

          {onRemove && (
            <button
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs"
              onClick={() => onRemove(index)}
            >
              ❌
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaPreview;
