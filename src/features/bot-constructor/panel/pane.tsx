import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import Elements from "./elements/elements";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {};

function Panel({ }: Props) {
  return (
    <Tabs defaultValue="Elements" className="w-[350px] p-2 bg-muted/40">
      <TabsList className="grid text-sm w-full grid-cols-3 gap-2 my-1">
        <TabsTrigger value="Elements">Elementlar</TabsTrigger>
        <TabsTrigger value="Integrations">Integrations</TabsTrigger>
        <TabsTrigger value="Plugins">Plugins</TabsTrigger>
      </TabsList>

      <Separator />

      <ScrollArea className="relative h-[calc(100vh-145px)] flex flex-col">
        <TabsContent value="Elements">
          <Elements />
        </TabsContent>
        <TabsContent value="Integrations">
          <Elements />
        </TabsContent>
        <TabsContent value="Plugins">
          <Elements />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

export default Panel;
