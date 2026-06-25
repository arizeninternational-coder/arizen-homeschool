"use client";

import React from "react";
import { Upload, Wand2, RefreshCw, CheckCircle, Trash2 } from "lucide-react";

/**
 * Admin controls mock — shows what the admin illustration
 * management UI should look like. Not wired to any backend.
 */
export function AdminControlsMock() {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-100 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shadow-sm">
          <span className="text-lg">⚙️</span>
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">Admin Controls Mock</h4>
          <p className="text-xs text-slate-600">
            This is a visual target for admin tools. Not functional or wired to backend.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Generate button */}
        <div>
          <h5 className="text-sm font-bold text-slate-700 mb-2">AI Image Generation</h5>
          <button className="w-full py-3 px-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Wand2 size={18} />
            <span>Generate Illustration (Mock)</span>
          </button>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Generates a child-friendly illustration using AI
          </p>
        </div>

        {/* Upload button */}
        <div>
          <h5 className="text-sm font-bold text-slate-700 mb-2">Upload Custom Image</h5>
          <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
            <Upload size={18} />
            <span>Upload Image (Mock)</span>
          </button>
        </div>

        {/* Manage buttons */}
        <div>
          <h5 className="text-sm font-bold text-slate-700 mb-2">Manage Illustrations</h5>
          <div className="grid grid-cols-2 gap-3">
            <button className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 text-sm">
              <CheckCircle size={16} />
              Approve
            </button>
            <button className="py-2.5 px-3 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 text-sm">
              <RefreshCw size={16} />
              Regenerate
            </button>
          </div>
          <button className="w-full mt-2 py-2.5 px-3 bg-red-50 text-red-600 font-bold rounded-xl border-2 border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5 text-sm">
            <Trash2 size={16} />
            Remove Illustration
          </button>
        </div>

        {/* Status indicator */}
        <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <p className="text-sm text-amber-900 font-semibold">
              Design Target Only
            </p>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            These controls are not functional. This shows the intended design for future implementation.
          </p>
        </div>
      </div>
    </div>
  );
}
