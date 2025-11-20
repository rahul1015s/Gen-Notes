import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import toast from "react-hot-toast";
import api from '../lib/axios.js';
import TiptapEditor from '../components/TiptapEditor.jsx';

const CreatePage = () => {
  // State variables for form inputs & loading state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folderId'); // Get folderId from URL

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    // Check if content has actual text (not just empty HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (!textContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    setLoading(true);

    try {
      // Send POST request to create note with optional folderId
      const noteData = { 
        title: title.trim(), 
        content 
      };

      // If creating in a folder, add folderId to the request
      if (folderId) {
        noteData.folderId = folderId;
      }

      await api.post("/api/v1/notes", noteData);
      
      toast.success("Note Created Successfully!");
      setTitle("");
      setContent("");
      
      // Navigate back to all-notes, keep folder filter if was creating in folder
      if (folderId) {
        navigate("/all-notes");
      } else {
        navigate("/all-notes");
      }
    } catch (error) {
      // Handle specific rate limit error
      if (error.response?.status === 429) {
        toast.error(
          <span>
            Slow down! You are creating notes too fast.<br />
            <span className="text-red-500">Try again after 15 minutes.</span>
          </span>,
          {
            duration: 4000,
            icon: <AlertTriangle className="text-red-500" />,
          }
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to create note!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="w-full max-w-2xl mx-auto">

        {/* Back Button */}
        <Link to="/" className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline">
          <ArrowLeft className="size-4" />
          Back to Notes
        </Link>

        {/* Card Container */}
        <div className="bg-base-100 shadow rounded-xl p-6">

          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">📝</span>
            <div>
              <h2 className="text-3xl font-semibold">Create New Note</h2>
              {folderId && <p className="text-sm text-base-content/70 mt-1">📂 In selected folder</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block mb-2 font-medium text-base">
                Title <span className="text-error">*</span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Enter your note title"
                className="input input-bordered w-full focus:input-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Content Input via Editor */}
            <div>
              <label htmlFor="content" className="block mb-2 font-medium text-base">
                Content <span className="text-error">*</span>
              </label>
              <TiptapEditor
                value={content}
                onChange={setContent}
                height="450px"
              />
              <p className="text-xs text-base-content/60 mt-2">
                Use the toolbar to format your text. Supports bold, italic, lists, links, and more.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Link 
                to="/" 
                className="btn btn-ghost"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Creating..." : "Create Note"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;