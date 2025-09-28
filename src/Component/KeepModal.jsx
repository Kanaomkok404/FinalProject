import React from "react";

const KeepModal = ({ visible, onClose, onConfirm, keepTitle, setKeepTitle }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg relative">
        <h2 className="text-lg font-bold mb-2">📌 ตั้งชื่อหัวข้อที่เก็บ</h2>
        <input
          type="text"
          value={keepTitle}
          onChange={(e) => setKeepTitle(e.target.value)}
          placeholder="ชื่อหัวข้อ"
          className="w-full border rounded p-2 mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">ยกเลิก</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">ยืนยัน</button>
        </div>
      </div>
    </div>
  );
};

export default KeepModal;
