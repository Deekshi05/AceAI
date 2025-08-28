"use client";
import React ,{useState} from "react";
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

function CreateInterviewDialog() {
const [formData,setFormData]=useState();
  const onHandleInputChange=()=>{
    setFormData(()=>(
      {
        ...formData,
        [field]:value
      }
    ))
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+Create Interview</Button>
      </DialogTrigger>
      <DialogContent className='min-w-3xl'>
        <DialogHeader>
          <DialogTitle>Please submit following details</DialogTitle>
          <DialogDescription>
            Choose how you want to create your interview
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="resume-upload" className="w-full mt-5">
          <TabsList>
            <TabsTrigger value="resume-upload">Resume Upload</TabsTrigger>
            <TabsTrigger value="job-description">Job Description</TabsTrigger>
          </TabsList>
          <TabsContent value="resume-upload">
            <ResumeUpload/>
          </TabsContent>
          <TabsContent value="job-description">
            <JobDescription onHandleInputChange={onHandleInputChange}/>
          </TabsContent>
        </Tabs>
        <DialogFooter className='flex gap-6'>
         <DialogClose asChild>
          <Button variant={'ghost'}>Cancel</Button>
         </DialogClose>
         <Button>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
