import React from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Updated to Fi icons for consistent "VidyaPath" design
import { 
  FiLayers, FiScissors, FiMinimize2, FiFileText, 
  FiImage, FiRotateCw, FiTool 
} from 'react-icons/fi';
import { FaTools } from 'react-icons/fa'; //  Keeping the main tool icon

const PdfTools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'merge',
      name: 'Merge PDF',
      desc: 'Combine multiple PDF files into one single document.',
      icon: <FiLayers size={32} />,
      color: 'text-rose-500 bg-rose-50 group-hover:bg-rose-100',
      path: '/pdf-tools/merge'
    },
    {
      id: 'split',
      name: 'Split PDF',
      desc: 'Extract specific pages or split a file into multiple parts.',
      icon: <FiScissors size={32} />,
      color: 'text-orange-500 bg-orange-50 group-hover:bg-orange-100',
      path: '/pdf-tools/split'
    },
    {
      id: 'compress',
      name: 'Compress PDF',
      desc: 'Reduce file size while maintaining high visual quality.',
      icon: <FiMinimize2 size={32} />,
      color: 'text-emerald-500 bg-emerald-50 group-hover:bg-emerald-100',
      path: '/pdf-tools/compress'
    },
    {
      id: 'rotate',
      name: 'Rotate PDF',
      desc: 'Rotate specific pages clockwise or anticlockwise.',
      icon: <FiRotateCw size={32} />,
      color: 'text-indigo-500 bg-indigo-50 group-hover:bg-indigo-100',
      path: '/pdf-tools/rotate'
    },
    {
      id: 'img-to-pdf',
      name: 'Images to PDF',
      desc: 'Convert JPG or PNG images into a standard PDF document.',
      icon: <FiImage size={32} />,
      color: 'text-purple-500 bg-purple-50 group-hover:bg-purple-100',
      path: '/pdf-tools/img-to-pdf'
    },
    {
      id: 'pdf-to-word',
      name: 'PDF to Word',
      desc: 'Convert PDF documents into editable Word files instantly.',
      icon: <FiFileText size={32} />,
      color: 'text-blue-500 bg-blue-50 group-hover:bg-blue-100',
      path: '/pdf-tools/pdf-to-word'
    },
  ];

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50 text-gray-800 font-sans animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-slate-800 text-white rounded-xl mb-4 shadow-lg shadow-slate-200">
                <FaTools size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                PDF Toolkit
            </h1>
            <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto">
                Essential utilities to manage your documents. Merge, split, compress, and convert with ease.
            </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 
                         hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1 hover:border-indigo-100
                         transition-all duration-300 cursor-pointer group flex flex-col items-start"
            >
              {/* Icon Container */}
              <div className={`mb-5 w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${tool.color}`}>
                {tool.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {tool.name}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {tool.desc}
              </p>
              
              {/* Arrow Indicator */}
              <div className="mt-auto pt-6 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
                  <span className="text-indigo-600 font-bold text-sm">Open Tool &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PdfTools;