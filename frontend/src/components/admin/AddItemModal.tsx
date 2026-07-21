import React, { useState, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'list' | 'file';
  placeholder?: string;
}

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string | number | string[]>) => Promise<void>;
  title: string;
  fields: Field[];
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onSubmit, title, fields }) => {
  const [formData, setFormData] = useState<Record<string, string | number | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!isOpen) return null;

  const handleChange = (name: string, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (name: string, file: File) => {
    setIsUploading(name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleChange(name, response.data.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setIsUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
      setFormData({});
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161614] border border-[#222220] rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-xl text-[#F2EFE9]">{title}</h2>
          <button onClick={onClose} className="text-[#F2EFE9]/60 hover:text-[#F2EFE9] transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm text-[#F2EFE9]/80 mb-1 font-mono">{field.label}</label>
              
              {field.type === 'file' ? (
                <div className="space-y-2">
                  <input
                    ref={(el) => { fileInputRefs.current[field.name] = el; }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(field.name, file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[field.name]?.click()}
                    className="w-full border border-dashed border-[#333330] rounded p-3 text-sm text-[#F2EFE9]/60 hover:border-[#B8552F] hover:text-[#F2EFE9] transition-colors flex items-center justify-center gap-2"
                  >
                    {isUploading === field.name ? (
                      <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                    ) : formData[field.name] ? (
                      <><Upload size={14} /> Uploaded ✓ (Click to change)</>
                    ) : (
                      <><Upload size={14} /> Click to upload image</>
                    )}
                  </button>
                  {formData[field.name] && (
                    <img src={formData[field.name] as string} alt="Preview" className="w-full h-32 object-cover rounded border border-line" />
                  )}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="w-full bg-[#1F1F1D] text-[#F2EFE9] border border-[#333330] rounded p-2 focus:outline-none focus:border-[#B8552F] transition-colors"
                  rows={3}
                  placeholder={field.placeholder}
                  value={formData[field.name] as string || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === 'list' ? (
                <input
                  className="w-full bg-[#1F1F1D] text-[#F2EFE9] border border-[#333330] rounded p-2 focus:outline-none focus:border-[#B8552F] transition-colors"
                  placeholder="Comma-separated values"
                  value={formData[field.name] as string || ''}
                  onChange={(e) => handleChange(field.name, e.target.value.split(',').map(item => item.trim()))}
                />
              ) : (
                <input
                  type={field.type}
                  className="w-full bg-[#1F1F1D] text-[#F2EFE9] border border-[#333330] rounded p-2 focus:outline-none focus:border-[#B8552F] transition-colors"
                  placeholder={field.placeholder}
                  value={formData[field.name] as string || ''}
                  onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting || isUploading !== null}
            className="w-full bg-[#B8552F] text-[#F2EFE9] py-2 rounded hover:bg-[#B8552F]/90 transition-colors font-mono disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
};
