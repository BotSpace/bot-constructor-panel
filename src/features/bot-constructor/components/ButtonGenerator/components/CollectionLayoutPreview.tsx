import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollectionLayoutPreviewProps {
  layoutType: "grid" | "list";
  columns?: number;
  maxRows?: number;
  sampleData?: string[];
}

export function CollectionLayoutPreview({
  layoutType,
  columns = 2,
  maxRows = 5,
  sampleData = [],
}: CollectionLayoutPreviewProps) {
  const displayItems = sampleData;
  const totalItems = sampleData.length;
  const itemsPerPage = columns * maxRows;

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Collection Preview
        </CardTitle>
        <CardDescription className="text-xs">
          {columns} ustun × {maxRows} qator = {itemsPerPage} ta tugma (1 sahifada)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className={cn(
            "grid gap-2",
            columns === 1 && "grid-cols-1",
            columns === 2 && "grid-cols-2",
            columns === 3 && "grid-cols-3",
            columns === 4 && "grid-cols-4",
          )}
        >
          {displayItems.map((item, index) => (
            <div
              key={index}
              className="bg-primary/10 border border-primary/30 rounded-md px-3 py-2 text-sm text-center hover:bg-primary/20 transition-colors"
            >
              {item}
            </div>
          ))}
        </div>
        
        {displayItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Collection ma'lumotlari shu yerda ko'rinadi</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
