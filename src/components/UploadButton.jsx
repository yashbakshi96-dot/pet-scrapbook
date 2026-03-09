import './UploadButton.css';

export default function UploadButton({ onUpload }) {
  return (
    <div 
      className="upload-card-wrapper"
      onClick={onUpload}
    >
      <div className="upload-card-inner">
        <div className="paw-logo-wrapper">
          <svg viewBox="0 0 100 100" className="paw-logo-svg">
            <ellipse cx="50" cy="65" rx="28" ry="22" fill="currentColor"/>
            <ellipse cx="22" cy="38" rx="11" ry="13" fill="currentColor"/>
            <ellipse cx="42" cy="28" rx="10" ry="12" fill="currentColor"/>
            <ellipse cx="62" cy="28" rx="10" ry="12" fill="currentColor"/>
            <ellipse cx="80" cy="38" rx="11" ry="13" fill="currentColor"/>
          </svg>
          <span className="add-hint">+</span>
        </div>
      </div>
    </div>
  );
}

