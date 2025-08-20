import React from "react";
import { FaFileAlt, FaFilePdf, FaImage, FaPlay } from "react-icons/fa";

interface ServiceOrderAttachment {
  attachment_id?: number;
  file_path: string;
  original_name: string;
  file_type?: "image" | "document" | "audio";
  download_url: string;
}

interface AttachmentPreviewProps {
  attachments: ServiceOrderAttachment[];
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments }) => {

  const renderAttachment = (att: ServiceOrderAttachment) => {
    const fileName = att.original_name;
    const isPDF = fileName.endsWith(".pdf");

    const cardStyle: React.CSSProperties = {
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 10,
      margin: 10,
      width: 200,
      textAlign: "center",
      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    };

    switch (att.file_type) {
      case "image":
        return (
          <div key={att.attachment_id} style={cardStyle}>
            <img
              src={att.download_url}
              alt={fileName}
              style={{ maxWidth: "180px", maxHeight: "150px", marginBottom: 10 }}
            />
            <p>{fileName}</p>
          </div>
        );
      case "audio":
        return (
          <div key={att.attachment_id} style={cardStyle}>
            <FaPlay size={40} style={{ marginBottom: 5 }} />
            <p>{fileName}</p>
            <audio controls style={{ width: "100%" }}>
              <source src={att.download_url} type="audio/mpeg" />
              Your browser does not support audio.
            </audio>
          </div>
        );
      case "document":
      default:
        return (
          <div key={att.attachment_id} style={cardStyle}>
            {isPDF ? <FaFilePdf size={40} /> : <FaFileAlt size={40} />}
            <p style={{ margin: "5px 0" }}>{fileName}</p>
            <a
              href={att.download_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#007bff", textDecoration: "none" }}
            >
              {isPDF ? "Preview PDF" : "Download"}
            </a>
          </div>
        );
    }
  };

  return (
    <div>
      <h3>Attachments</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {attachments.map(renderAttachment)}
      </div>
    </div>
  );
};

export default AttachmentPreview;
