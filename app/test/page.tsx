import { ButtonBuilder } from "@/components/builder/button-builder";
import { Header } from "./header";
import { Toaster } from "@/components/ui/sonner";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <ButtonBuilder />
      </main>
      <Toaster />
    </div>
  );
}
