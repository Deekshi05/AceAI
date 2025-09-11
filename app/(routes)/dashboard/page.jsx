"use client";
import React from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import EmptyState from "./EmptyState";
import CreateInterviewDialog from "../_components/CreateInterviewDialog";
import InterviewCard from "./InterviewCard";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

function dashboard() {
  const { user, isLoaded } = useUser();
  const convex = useConvex();
  const deleteInterview = useMutation(api.interview.deleteInterview);
  const [interviewList, setInterviewList] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedInterviews, setSelectedInterviews] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoaded && user?.emailAddresses?.[0]?.emailAddress) {
      fetchUserInterviews();
    }
  }, [isLoaded, user]);

  const fetchUserInterviews = async () => {
    try {
      setLoading(true);
      // First get the user from Convex
      const userData = await convex.query(api.users.getUserByEmail, {
        email: user.emailAddresses[0].emailAddress,
      });

      if (userData) {
        // Then get their interviews
        const interviews = await convex.query(api.interview.getUserInterviews, {
          userId: userData._id,
        });
        setInterviewList(interviews || []);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setInterviewList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInterviews.length === 0) {
      toast.error("Please select interviews to delete");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedInterviews.length} interview session(s)? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true);
      try {
        await Promise.all(
          selectedInterviews.map((interviewId) =>
            deleteInterview({ interviewId })
          )
        );
        toast.success(
          `${selectedInterviews.length} interview session(s) deleted successfully`
        );
        setSelectedInterviews([]);
        fetchUserInterviews();
      } catch (error) {
        console.error("Error deleting interviews:", error);
        toast.error("Failed to delete some interview sessions");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleSelectInterview = (interviewId) => {
    setSelectedInterviews((prev) =>
      prev.includes(interviewId)
        ? prev.filter((id) => id !== interviewId)
        : [...prev, interviewId]
    );
  };

  const selectAllInterviews = () => {
    if (selectedInterviews.length === interviewList.length) {
      setSelectedInterviews([]);
    } else {
      setSelectedInterviews(interviewList.map((interview) => interview._id));
    }
  };

  if (!isClient || !isLoaded || loading) {
    return (
      <div className="py-20 px-10 md:px-28 lg:px-44 xl:px-56">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg text-gray-500"> My Dashboard</h2>
            <h2 className="text-3xl font-bold">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 px-10 md:px-28 lg:px-44 xl:px-56">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-lg text-gray-500"> My Dashboard</h2>
          <h2 className="text-3xl font-bold">
            Welcome, {user?.fullName || user?.firstName || "User"}
          </h2>
        </div>
        <CreateInterviewDialog onInterviewCreated={fetchUserInterviews} />
      </div>

      {interviewList.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Your Interview Sessions ({interviewList.length})
            </h3>
            {interviewList.length > 0 && (
              <div className="flex items-center space-x-3">
                {selectedInterviews.length > 0 && (
                  <Button
                    onClick={handleBulkDelete}
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedInterviews.length})
                  </Button>
                )}
                <Button
                  onClick={selectAllInterviews}
                  variant="outline"
                  size="sm"
                >
                  {selectedInterviews.length === interviewList.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviewList.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onInterviewDeleted={fetchUserInterviews}
                isSelected={selectedInterviews.includes(interview._id)}
                onToggleSelect={() => toggleSelectInterview(interview._id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default dashboard;
