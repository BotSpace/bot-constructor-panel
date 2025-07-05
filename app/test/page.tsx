import { Tabs, TabsList } from "@/components/ui/tabs";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import React from "react";

type Props = {};

function page({}: Props) {
  return (
    <div className="max-w-[400px]">
      <Tabs value="inline">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inline">Reply Keyboard</TabsTrigger>
        </TabsList>
        <TabsContent value="inline" className="mt-4 space-y-4"></TabsContent>
      </Tabs>
    </div>
  );
}

export default page;
