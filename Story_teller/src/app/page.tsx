"use client";

import { useState } from "react";
import PostAnalyzer from "@/components/PostAnalyzer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Story Teller - AI Post Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image and text to generate AI-powered summaries using multimodal analysis
          </p>
        </header>
        
        <PostAnalyzer />
      </div>
    </div>
  );
}