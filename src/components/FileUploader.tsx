import React from "react";

interface FileUploaderProps {
  onFileLoaded: (text: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    onFileLoaded(text);
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded-xl shadow">
      <label className="block font-semibold mb-2">
        Sube la matriz de utilidad:
      </label>
      <input
        type="file"
        accept=".txt,.csv"
        onChange={handleFile}
        className="block w-full text-sm
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-50 file:text-indigo-700
                   hover:file:bg-indigo-100"
      />
      <p className="text-xs text-gray-500 mt-2">
        Selecciona un fichero <code>.txt</code> con la matriz de utilidad.
      </p>
    </div>
  );
};

export default FileUploader;

