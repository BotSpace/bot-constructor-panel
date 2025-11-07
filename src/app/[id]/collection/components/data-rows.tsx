"use client";

import { CollectionDetail } from "@/types/http/collection";
import { toKey } from "./utils";

interface DataRowsProps {
  fields: CollectionDetail["fields"];
  collectionName: string;
  collectionData: any[] | undefined;
}

export default function DataRows({
  fields,
  collectionName,
  collectionData,
}: DataRowsProps) {
  if (!Array.isArray(collectionData) || collectionData.length === 0)
    return null;

  return (
    <>
      {collectionData.map((item: Record<string, any>, idx: number) => {
        const rowKey =
          toKey(item.id ?? item._id, `${collectionName}-${idx}`) + `-${idx}`;

        return (
          <tr
            key={rowKey}
            className="border-b border-border hover:bg-secondary/30 transition-colors"
          >
            {fields.map((field, fIdx) => {
              const cellKey = toKey(
                field.id ?? field.name,
                `${rowKey}-f${fIdx}`
              );
              return (
                <td
                  key={cellKey}
                  className="px-4 py-4 text-sm text-muted-foreground"
                >
                  {item[field.name] ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}
