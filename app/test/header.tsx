import { MessageSquarePlus } from "lucide-react";

export function Header() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container h-16 flex items-center">
        <MessageSquarePlus className="h-6 w-6 mr-2" />
        <h1 className="text-xl font-bold">TeleMarkup Builder</h1>
      </div>
    </header>
  );
}
