"use client";

import * as React from "react";
import { Upload } from "lucide-react";

const FileUploadComponent: React.FC = () => {
  const handleFileUploadBtn = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async (evnt) => {
      if (el.files && el.files.length > 0) {
        // console.log(el.files);
        const file = el.files.item(0)
        if(file) {
          const formData = new FormData()
          formData.append('pdf', file)

          await fetch('http://localhost:8000/upload/pdf', {
            method: "POST",
            body: formData
          })
          console.log("FIle UPloaded");
          
        }
      }
    });
    el.click();
  };
  return (
    <div className="bg-slate-900 text-white shadow-2xl flex justify-center items-center p-4 rounded-lg border-white border-2">
      <div
        onClick={handleFileUploadBtn}
        className="flex justify-center items-center flex-col"
      >
        <h3> Upload a PDF File</h3>
        <Upload />
      </div>
    </div>
  );
};

export default FileUploadComponent;
