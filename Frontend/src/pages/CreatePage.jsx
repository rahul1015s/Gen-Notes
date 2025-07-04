import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import toast from "react-hot-toast";
import api from '../lib/axios.js';



const CreatePage = () => {
  // State variables for form inputs & loading state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim() || !content.trim()) {
      toast.error("Title and Content should not be empty.");
      return;
    }

    setLoading(true);

    try {

      // Send POST request to create note
      await api.post("/notes", { title, content });
      toast.success("Note Created Successfully.");
      navigate("/all-notes"); // Navigate to home after success
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
        toast.error("Failed to create note!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4">
      <div className="w-full max-w-xl">

        {/* Back Button */}
        <Link to="/" className="flex items-center gap-2 text-sm text-primary mb-6 hover:underline">
          <ArrowLeft className="size-4" />
          Back to Notes
        </Link>

        {/* Card Container */}
        <div className="bg-base-100 shadow rounded-xl p-6">

          <h2 className="text-2xl font-semibold mb-6">Create New Note</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Title Input */}
            <div>
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                placeholder="Note Title"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block mb-1 font-medium">Content</label>
              <textarea
                placeholder="Write your note here..."
                className="textarea textarea-bordered w-full min-h-[120px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
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
