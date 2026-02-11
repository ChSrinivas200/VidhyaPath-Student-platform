import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
// ✅ Updated Icons
import { 
  FiUploadCloud, FiFile, FiImage, FiFileText, 
  FiCheckCircle, FiLoader, FiX, FiRotateCw, FiScissors, FiArrowLeft
} from 'react-icons/fi';
import api from '../services/api'; 

const PdfToolView = () => {
  const { toolId } = useParams();
  const navigate = useNavigate();
  
  const [files, setFiles] = useState([]);
  const [pageRange, setPageRange] = useState(''); 
  const [rotation, setRotation] = useState(90);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 1. Handle File Drops
  const onDrop = (acceptedFiles) => {
    // Determine allowed types based on tool
    const isImageTool = toolId === 'img-to-pdf';
    
    // Filter files (Images for img-to-pdf,  PDFs for everything else)
    const validFiles = acceptedFiles.filter(file => 
        isImageTool 
            ? (file.type === 'image/jpeg' || file.type === 'image/png') 
            : file.type === 'application/pdf'
    );
    
    if (validFiles.length === 0) {
      if(acceptedFiles.length > 0) setError(isImageTool ? "Only JPG/PNG images allowed." : "Only PDF files allowed.");
      return;
    }

    // SINGLE FILE TOOLS: Split, Rotate, Compress, PDF-to-Word
    if (['split', 'rotate', 'compress', 'pdf-to-word'].includes(toolId)) {
        setFiles([validFiles[0]]); 
    } else {
        // MULTI FILE TOOLS: Merge, Img-to-PDF
        setFiles(prev => [...prev, ...validFiles]);
    }
    
    setError('');
    setSuccess(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: toolId === 'img-to-pdf' 
        ? {'image/jpeg': [], 'image/png': []} 
        : {'application/pdf': ['.pdf']},
    multiple: ['merge', 'img-to-pdf'].includes(toolId)
  });

  // 2. Process Logic
  const handleProcess = async () => {
    setLoading(true);
    setError('');

    const formData = new FormData();

    // --- LOGIC FOR MERGE ---
    if (toolId === 'merge') {
        if (files.length < 2) { setError("Select at least 2 PDFs."); setLoading(false); return; }
        files.forEach(file => formData.append('files', file));
    }
    // --- LOGIC FOR IMAGES TO PDF ---
    else if (toolId === 'img-to-pdf') {
        if (files.length < 1) { setError("Select at least 1 image."); setLoading(false); return; }
        files.forEach(file => formData.append('files', file));
    }
    // --- SINGLE FILE TOOLS ---
    else {
        if (files.length !== 1) { setError("Upload 1 PDF file."); setLoading(false); return; }
        formData.append('file', files[0]);
        
        if (toolId === 'split') formData.append('pageRange', pageRange);
        if (toolId === 'rotate') formData.append('angle', rotation);
    }

    try {
      const response = await api.post(`/pdf-tools/${toolId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob', 
      });

      const timestamp = new Date().getTime();
      // Determine extension
      const ext = toolId === 'pdf-to-word' ? 'docx' : 'pdf';
      const fileName = `${toolId}_result_${timestamp}.${ext}`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess(true);
      setFiles([]);
      setPageRange('');
    } catch (err) {
      console.error("Processing Error:", err);
      setError("Failed to process. Check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  const toolNames = {
    'merge': 'Merge PDF',
    'split': 'Split PDF',
    'compress': 'Compress PDF',
    'rotate': 'Rotate PDF',
    'img-to-pdf': 'Images to PDF',
    'pdf-to-word': 'PDF to Word'
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans animate-fadeIn">
       
       <button 
         onClick={() => navigate('/pdf-tools')} 
         className="flex items-center text-slate-500 mb-6 hover:text-indigo-600 font-medium transition-colors"
       >
         <FiArrowLeft className="mr-2" /> Back to Tools
       </button>
       
       <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12 max-w-4xl mx-auto border border-gray-200">
         
         <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 capitalize tracking-tight">
                {toolNames[toolId] || toolId.replace('-', ' ')}
            </h1>
            <p className="text-slate-500 text-lg">
                {toolId === 'img-to-pdf' ? "Convert JPG/PNG images into a single professional PDF." : 
                toolId === 'pdf-to-word' ? "Convert PDF text into an editable Word document." :
                toolId === 'merge' ? "Combine multiple PDFs into one organized file." :
                "Process your documents efficiently and securely."}
            </p>
         </div>

         {error && (
           <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100 font-medium flex items-center justify-center gap-2">
             <FiX className="text-xl" /> {error}
           </div>
         )}

         {success ? (
           <div className="text-center py-12 animate-fadeIn bg-green-50 rounded-2xl border border-green-100">
             <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FiCheckCircle className="text-4xl text-green-600" />
             </div>
             <h2 className="text-2xl font-bold text-slate-800 mb-2">Success!</h2>
             <p className="text-slate-600 mb-8">Your file has been processed and downloaded.</p>
             <button 
                onClick={() => setSuccess(false)} 
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:-translate-y-1"
             >
               Process More Files
             </button>
           </div>
         ) : (
           <>
             {/* UPLOAD AREA */}
             <div 
               {...getRootProps()} 
               className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group
                 ${isDragActive 
                    ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}`}
             >
               <input {...getInputProps()} />
               <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                  <FiUploadCloud className="text-3xl text-slate-400 group-hover:text-indigo-500 transition-colors" />
               </div>
               <p className="text-lg font-bold text-slate-700 group-hover:text-indigo-700">
                   {toolId === 'img-to-pdf' ? "Drag & drop Images here" : "Drag & drop PDF here"}
               </p>
               <p className="text-sm text-slate-400 mt-1">or click to browse files</p>
             </div>

             {/* FILE LIST */}
             {files.length > 0 && (
               <div className="mt-10 animate-fadeIn">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-700">Selected Files ({files.length})</h3>
                    <button onClick={() => setFiles([])} className="text-sm text-red-500 hover:underline font-medium">Clear All</button>
                 </div>
                 
                 <div className="space-y-3 mb-8 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                   {files.map((file, idx) => (
                     <div key={idx} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                       <div className="flex items-center gap-4 overflow-hidden">
                         <div className="bg-white p-2 rounded-lg border border-slate-200">
                            {toolId === 'img-to-pdf' ? <FiImage className="text-purple-500 text-xl" /> : 
                             toolId === 'pdf-to-word' ? <FiFileText className="text-blue-600 text-xl" /> :
                             <FiFile className="text-red-500 text-xl" />}
                         </div>
                         <div className="flex flex-col min-w-0">
                            <span className="text-slate-700 font-medium truncate">{file.name}</span>
                            <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                         </div>
                       </div>
                       <button 
                         onClick={(e) => {
                            e.stopPropagation();
                            setFiles(files.filter((_, i) => i !== idx));
                         }} 
                         className="p-2 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <FiX />
                       </button>
                     </div>
                   ))}
                 </div>

                 {/* TOOL SPECIFIC INPUTS */}
                 {toolId === 'split' && (
                     <div className="mb-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                         <label className="block text-indigo-900 font-bold mb-3 flex items-center gap-2">
                             <FiScissors /> Pages to Extract:
                         </label>
                         <input 
                            type="text" 
                            placeholder="e.g. 1-5, 8, 11-13" 
                            value={pageRange} 
                            onChange={(e) => setPageRange(e.target.value)} 
                            className="w-full p-4 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-mono" 
                         />
                         <p className="text-xs text-indigo-400 mt-2">Enter page numbers or ranges separated by commas.</p>
                     </div>
                 )}
                 {toolId === 'rotate' && (
                     <div className="mb-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center">
                         <label className="block text-indigo-900 font-bold mb-4 flex items-center justify-center gap-2">
                             <FiRotateCw /> Rotation Angle
                         </label>
                         <div className="flex justify-center gap-4">
                             {[90, 180, 270].map((deg) => (
                                 <button 
                                    key={deg}
                                    onClick={() => setRotation(deg)} 
                                    className={`px-6 py-3 rounded-xl font-bold border transition-all ${rotation === deg ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-indigo-200 hover:bg-indigo-50'}`}
                                 >
                                    {deg}°
                                 </button>
                             ))}
                         </div>
                     </div>
                 )}

                 <button 
                   onClick={handleProcess}
                   disabled={loading}
                   className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                 >
                   {loading ? <><FiLoader className="animate-spin" /> Processing...</> : "Convert & Download"}
                 </button>
               </div>
             )}
           </>
         )}
       </div>
    </div>
  );
};

export default PdfToolView;