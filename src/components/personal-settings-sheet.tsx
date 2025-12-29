"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PersonalSettingsContent } from "./personal-settings-content";
import { Button } from "./ui/button";

export function PersonalSettingsSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant={"link"}>Personal Settings</Button>
      </SheetTrigger>
      <SheetContent>
        <PersonalSettingsContent />
      </SheetContent>
    </Sheet>
  );
}
