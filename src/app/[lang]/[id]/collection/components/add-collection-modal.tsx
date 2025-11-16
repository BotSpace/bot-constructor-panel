import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { varibulNameValidator } from "@/lib/input-validators";
import { instanceAuth } from "@/services/instance";
import { CollectionDetail, CollectionListItem } from "@/types/http/collection";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddNewCollectionModalProps {
  onSuccess: () => void;
  children?: React.ReactNode;
  collection: CollectionListItem;
  fields: CollectionDetail["fields"];
  project_id: string;
}

export function AddNewCollectionModal({
  onSuccess,
  children,
  collection,
  fields,
  project_id,
}: AddNewCollectionModalProps) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] =
    useState<CollectionDetail["fields"][number]["type"]>("text");
  const [open, setOpen] = useState(false);

  const isValidFieldName = varibulNameValidator(fieldName);
  const isFormValid = fieldName && fieldType && isValidFieldName;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Iltimos field nomini va turini to'g'ri tanlang.");
      return;
    }

    instanceAuth
      .patch(`collection/${collection.name}/?project=${project_id}`, {
        fields: [...fields, { name: fieldName, type: fieldType }],
      })
      .then(() => {
        onSuccess();
        toast.success("Yangi field muvaffaqiyatli qo'shildi!");
        setFieldName("");
        setFieldType("text");
        setOpen(false);
      })
      .catch((err) => {
        console.error("Field qo'shishda xatolik yuz berdi:", err);
        toast.error("Field qo'shishda xatolik yuz berdi");
      });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yangi Field Qo'shish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Field nomi"
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              required
            />
            <Select
              value={fieldType}
              onValueChange={(value) =>
                setFieldType(
                  value as CollectionDetail["fields"][number]["type"]
                )
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a data type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Data types</SelectLabel>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="bool">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">
            Nom o'zgaruvchi nomlash qoidalariga muvofiq bo'lishi kerak: harf
            yoki _ bilan boshlanishi, va faqat harflar, raqamlar va _ dan iborat
            bo'lishi kerak.
          </p>
          {fieldName && !isValidFieldName && (
            <p className="text-xs text-red-500">
              Noto'g'ri format — misol: my_field, _name, var1
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={!isFormValid}>
              Qo'shish
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Bekor qilish
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
