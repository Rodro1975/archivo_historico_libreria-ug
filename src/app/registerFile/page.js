"use client";

import WorkBar from "@/components/WorkBar";
import FileForm from "@/components/FileForm";

export default function RegisterFilePage() {
  return (
    <div className="min-h-screen bg-blue">
      <WorkBar />
      <div className="pt-24">
        <FileForm />
      </div>
    </div>
  );
}
