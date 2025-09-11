"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobDescription from "./JobDescription";
import ResumeUpload from "./ResumeUpload";
import { DialogClose } from "@radix-ui/react-dialog";
import { Loader2Icon } from "lucide-react";
import { useUserDetailContext } from "@/app/Provider";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
function CreateInterviewDialog({ onInterviewCreated }) {
  const [formData, setFormData] = useState({});
  const [file, setFiles] = useState();
  const [loading, setLoading] = useState(false);
  const { UserDetail } = useUserDetailContext();
  const saveInterviewQuestion = useMutation(
    api.interview.saveInterviewQuestion
  );
  const router = useRouter();
  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async () => {
    // Check if we have either a file OR job description
    if (!file && (!formData?.jobTitle || !formData?.jobDescription)) {
      toast.error(
        "Please either upload a resume OR provide job title and description"
      );
      return;
    }

    // Debug user context
    console.log("UserDetail:", UserDetail);
    console.log("UserDetail._id:", UserDetail?._id);

    if (!UserDetail?._id) {
      toast.error("User not authenticated. Please sign in first.");
      return;
    }

    setLoading(true);
    const formData_ = new FormData();
    formData_.append("file", file ?? "");
    formData_.append("jobTitle", formData?.jobTitle || "");
    formData_.append("jobDescription", formData?.jobDescription || "");

    try {
      const res = await axios.post(
        "/api/generate-interview-questions",
        formData_
      );
      console.log(res.data);
      if (res?.data?.status == 429) {
        toast.warning(
          "You have reached your limit. Please try again later or upgrade your plan."
        );
        return;
      }

      if (
        !res.data?.questions ||
        !Array.isArray(res.data.questions) ||
        res.data.questions.length === 0
      ) {
        toast.error(
          "Failed to generate interview questions. Please try again or check your input."
        );
        setLoading(false);
        return;
      }

      // Extract the nested questions array
      const questionsData = res.data.questions[0]?.questions;

      if (
        !questionsData ||
        !Array.isArray(questionsData) ||
        questionsData.length === 0
      ) {
        toast.error(
          "Failed to generate interview questions. Please try again or check your input."
        );
        setLoading(false);
        return;
      }

      // Map the questions to ensure proper structure
      const mappedQuestions = questionsData.map((q) => ({
        question: q.question || "",
        answer: q.answer || "",
      }));
      const resp = await saveInterviewQuestion({
        questions: mappedQuestions,
        resumeUrl: res.data?.imageKitUrl || undefined,
        uid: UserDetail?._id,
        jobTitle: formData?.jobTitle,
        jobDescription: formData?.jobDescription,
      });

      console.log("Interview saved successfully with ID:", resp);
      toast.success("Interview created successfully!");

      // Call the callback to refresh the interview list
      if (onInterviewCreated) {
        onInterviewCreated();
      }

      router.push("/interview/" + resp);
    } catch (e) {
      console.error("Error saving interview:", e);
      toast.error(
        "Failed to save interview. " + (e.message || "Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+Create Interview</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Please submit following details</DialogTitle>
          <DialogDescription>
            Choose how you want to create your interview
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="resume-upload" className="w-full mt-3">
          <TabsList>
            <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
            <TabsTrigger value="job-description">Job Description</TabsTrigger>
          </TabsList>
          <TabsContent value="resume-upload">
            <ResumeUpload
              setFiles={(file) => setFiles(file)}
              onHandleInputChange={onHandleInputChange}
            />
          </TabsContent>
          <TabsContent value="job-description">
            <JobDescription onHandleInputChange={onHandleInputChange} />
          </TabsContent>
        </Tabs>
        <DialogFooter className="flex gap-4 mt-4">
          <DialogClose asChild>
            <Button variant={"ghost"}>Cancel</Button>
          </DialogClose>
          <Button
            onClick={onSubmit}
            disabled={
              loading ||
              (!file && (!formData?.jobTitle || !formData?.jobDescription))
            }
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
