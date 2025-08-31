"use client";
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

function CreateInterviewDialog() {
const [formData,setFormData]=useState({});
const [file,setFiles]=useState();
const[loading,setLoading]=useState(false);
  const onHandleInputChange=(field, value)=>{
    setFormData((prev)=>(
      {
        ...prev,
        [field]:value
      }
    ))
  }

  const onSubmit=async ()=>{
    if(!file)return;
    setLoading(true);
    const formData=new FormData();
    formData.append("file",file);
    try{
      const res=await axios.post('/api/generate-interview-questions',formData);
      console.log(res.data);
    }catch(e){
      console.log(e);
    }
    finally{
      setLoading(false);
    }
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
            <ResumeUpload setFiles={(file)=>setFiles(file)}/>
          </TabsContent>
          <TabsContent value="job-description">
            <JobDescription onHandleInputChange={onHandleInputChange}/>
          </TabsContent>
        </Tabs>
        <DialogFooter className='flex gap-6'>
         <DialogClose asChild>
          <Button variant={'ghost'}>Cancel</Button>
         </DialogClose>
         <Button onClick={onSubmit} disabled={loading|| !file}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateInterviewDialog;
