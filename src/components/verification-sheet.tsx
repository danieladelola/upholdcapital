"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import SheetButton from "./sheet-button"

export function VerificationSheet() {
  const [open, setOpen] = useState(false)
  const [documentType, setDocumentType] = useState("Driver's License")
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(selectedFile.type)) {
        alert('Please select a valid image file (SVG, PNG, JPG or GIF)');
        return;
      }
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleSubmit = () => {
    // Implement verification submission logic here
    console.log("Submitting verification:", { documentType, file })
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="w-full">
        <SheetButton title="Verification" description="Verification and confirmation of identity"/>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Verify your account</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Your account is not verified. To verify, kindly provide your information with a valid means of identification attached as an image document.
          </p>

          <div className="space-y-2">
            <Label htmlFor="document-type">Document Type:</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Driver's License">Driver's License</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
                <SelectItem value="Identity card">Identity card</SelectItem>
                <SelectItem value="Social security card">Social security card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Document:</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="document"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 ${
                  dragActive ? 'border-primary' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <Input
                  id="document"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
            </div>
            {file ? (
              <p className="text-sm text-green-600">File selected: {file.name}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No file chosen</p>
            )}
          </div>

          <Button className="w-full" onClick={handleSubmit}>Submit</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

