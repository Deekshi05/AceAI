"use client";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightIcon, Send } from "lucide-react";
function Interview({ params }) {
  const router = useRouter();

  const handleStartInterview = () => {
    router.push(`/interview/${params.interviewid}/start`);
  };
  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <div className="max-w-3xl w-full">
        <Image
          src="/interview_screen.jpg"
          alt="Interview Screen"
          width={400}
          height={500}
          className="w-full h-[300px] object-cover"
        />
        <div className="p-6 flex flex-col items-center space-y-5">
          <h2 className="font-bold text-3xl">Ready to Start Interview</h2>
          <p className="text-gray-500 text-center">
            The Interview will be last 30minutes.Are you ready?
          </p>
          <Button onClick={handleStartInterview}>
            Start Interview <ArrowRightIcon />
          </Button>
          <hr />
          <div className="p-6 bg-grey-50 rounded-2xl">
            <h2 className="font-bold text-2xl">
              Want to send interview link to someone?
            </h2>
            <div className="flex gap-5 w-full items-center max-w-l mg-2">
              <Input placeholder="Enter email address" className="flex-1" />
              <Button>
                <Send />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;
