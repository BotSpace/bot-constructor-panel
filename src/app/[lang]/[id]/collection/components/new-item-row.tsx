"use client";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { instanceAuth } from "@/services/instance";
import { CollectionDetail } from "@/types/http/collection";

interface NewItemRowProps {
  fields: CollectionDetail["fields"];
  collectionName: string;
  project: string;
  newTableItem: Record<string, any>;
  setNewTableItem: (
    fn: (prev: Record<string, any>) => Record<string, any>
  ) => void;
  onInserted?: () => void;
}

export default function NewItemRow({
  fields,
  collectionName,
  project,
  newTableItem,
  setNewTableItem,
  onInserted,
}: NewItemRowProps) {
  async function addNewItem() {
    if (!fields) {
      toast.error("Fields yuklanmadi, iltimos qayta urinib ko'ring.");
      return;
    }

    const missing = fields.filter((field) => {
      const val = newTableItem[field.name];
      return (
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "")
      );
    });

    if (missing.length > 0) {
      toast.error(
        `Iltimos quyidagi maydon(lar)ni to'ldiring: ${missing
          .map((m) => m.name)
          .join(", ")}`
      );
      return;
    }

    try {
      await instanceAuth.post(
        `collection/${collectionName}/query/?action=insert&project=${project}`,
        {
          ...newTableItem,
        }
      );
      onInserted?.();
    } catch (e) {
      console.error(e);
      toast.error("Item qo'shishda xatolik yuz berdi.");
    }
  }

  return (
    <tr>
      {fields.map((field) => (
        <td
          key={`new-item-${field.id}`}
          className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
        >
          {field.type === "bool" ? (
            <Checkbox
              defaultChecked
              onCheckedChange={(check) => {
                setNewTableItem((prev) => ({ ...prev, [field.name]: check }));
              }}
            ></Checkbox>
          ) : (
            <Input
              onChange={(e: any) =>
                setNewTableItem((prev) => ({
                  ...prev,
                  [field.name]: e.target.value,
                }))
              }
              className="w-full h-full text-sm font-normal"
              type={field.type}
            />
          )}
        </td>
      ))}
      <td>
        <Button onClick={addNewItem} variant="outline">
          Add
        </Button>
      </td>
    </tr>
  );
}
