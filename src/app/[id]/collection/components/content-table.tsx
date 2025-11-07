"use client";

import { useEffect, useState } from "react";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";

import TableHeader from "./table-header";
import NewItemRow from "./new-item-row";
import DataRows from "./data-rows";
import EmptyState from "./empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentTableProps {
  collection: CollectionListItem;
  project: string;
}

export default function ContentTable({
  collection,
  project,
}: ContentTableProps) {
  const [newTableItem, setNewTableItem] = useState<Record<string, any>>({});

  const { data, refetch } = useReactQueryAction<
    APIDetailCreateResponse<CollectionDetail>
  >({
    url: `collection/${collection.name}/?project=` + project,
  });

  useEffect(() => {
    if (data) {
      setNewTableItem({});

      data.data.fields.forEach(({ type, name }) => {
        setNewTableItem((prev) => ({
          ...prev,
          [name]: type === "bool" ? true : "",
        }));
      });
    }
  }, [data]);

  const { data: collectionData, refetch: refetchCollectionData } =
    useReactQueryAction<APIDetailCreateResponse<[]>>({
      url: `collection/${collection.name}/query/`,
      method: "POST",
      query: { action: "find", project: project },
      data: { limit: 10, skip: 0, sort: { first_name: 1 } },
      enabled: !!data,
    });

  if (data)
    return (
      <div className="overflow-x-auto">
        {data?.data.fields.length ? (
          <table className="w-full">
            <TableHeader
              fields={data.data.fields}
              collection={collection}
              project={project}
              onSuccess={() => {
                refetch();
              }}
            />

            <tbody>
              <NewItemRow
                fields={data.data.fields}
                collectionName={collection.name}
                project={project}
                newTableItem={newTableItem}
                setNewTableItem={setNewTableItem}
                onInserted={() => refetchCollectionData()}
              />

              {collectionData?.data ? (
                <DataRows
                  fields={data.data.fields}
                  collectionName={collection.name}
                  collectionData={collectionData?.data}
                />
              ) : (
                <>
                  <tr>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[130px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[210px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[200px] h-[15px]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[160px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[130px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[130px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[100px] h-[15px]" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[80px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[200px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[170px] h-[15px]" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="w-[140px] h-[15px]" />
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        ) : (
          <EmptyState
            collection={collection}
            project={project}
            onSuccess={() => refetch()}
          />
        )}
      </div>
    );
  return (
    <>
      <table>
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3">
              <Skeleton className="w-[300px] h-[16px]" />
            </th>
            <th className="px-4 py-3">
              <Skeleton className="w-[200px] h-[16px]" />
            </th>
            <th className="px-4 py-3">
              <Skeleton className="w-[300px] h-[16px]" />
            </th>
            <th className="px-4 py-3">
              <Skeleton className="w-[350px] h-[16px]" />
            </th>
          </tr>
        </thead>
      </table>
    </>
  );
}
