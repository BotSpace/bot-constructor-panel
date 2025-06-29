"use client";

import { useEffect, useMemo, useRef, useState } from "react"; // Kerakli hook'larni import qilamiz
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Constructor from "@/constructor/constructor";
import { Elements } from "@/constructor/data/elements";
import { ConstructorPageHeader } from "./components/header";

export default function Page() {
  // 1. Qidiruv matnini saqlash uchun state
  const [searchTerm, setSearchTerm] = useState("");

  // 2. Input maydoniga to'g'ridan-to'g'ri murojaat qilish uchun ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 3. Filtrlangan elementlar ro'yxati
  // useMemo'dan foydalanish har bir renderda qayta hisoblashni oldini oladi,
  // faqat `searchTerm` o'zgarganda ishlaydi. Bu optimizatsiya uchun muhim.
  const filteredElements = useMemo(() => {
    if (!searchTerm) {
      return Elements; // Agar qidiruv bo'sh bo'lsa, to'liq ro'yxatni qaytaramiz
    }

    const lowercasedFilter = searchTerm.toLowerCase();

    // Har bir guruhni (Triggers, Actions) alohida tekshirib chiqamiz
    return Elements.map((group) => {
      // Guruh ichidagi elementlarni filtrlaymiz
      const filtered = group.elements.filter(
        (element) =>
          element.name.toLowerCase().includes(lowercasedFilter) ||
          element.description.toLowerCase().includes(lowercasedFilter)
      );

      // Agar guruhda mos elementlar bo'lsa, yangi guruh obyekti yaratamiz
      if (filtered.length > 0) {
        return { ...group, elements: filtered };
      }

      return null; // Aks holda, guruhni o'tkazib yuboramiz
    }).filter(Boolean); // null qiymatlarni massivdan olib tashlaymiz
  }, [searchTerm]); // `searchTerm` o'zgargandagina qayta ishlaydi

  // 4. Ctrl + L shortcut'ini sozlash uchun useEffect
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // `event.metaKey` - bu Mac'dagi Command tugmasi
      // `event.ctrlKey` - bu Windows/Linux'dagi Control tugmasi
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault(); // Brauzerning standart harakatini (masalan, address bar'ga fokus) bekor qilamiz
        searchInputRef.current?.focus(); // Input maydoniga fokus qilamiz
      }
    };

    // Komponent yuklanganda hodisa tinglovchisini qo'shamiz
    window.addEventListener("keydown", handleKeyDown);

    // Komponent DOM'dan o'chirilganda tinglovchini olib tashlaymiz (xotira tozaligi uchun)
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Bo'sh massiv [] - bu effekt faqat bir marta, komponent yuklanganda ishga tushishini bildiradi

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <ConstructorPageHeader />

      <div className="flex">
        {/* Components Panel */}
        <ScrollArea className="h-[calc(100vh-56px)] flex flex-col w-72 border-r border-white/[0.08]">
          {/* Panel Header */}
          <div className="border-b border-white/[0.08] p-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <Input
                // Ref'ni inputga bog'laymiz
                ref={searchInputRef}
                placeholder="Search components... (Ctrl+L)" // Foydalanuvchiga ishora
                className="h-8 pl-9 text-sm placeholder:text-slate-400 focus-visible:border-white/20 focus-visible:ring-0"
                // State'ni yangilaymiz
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Components List */}
          <div className="p-3 overflow-y-auto">
            {/* Tekshiruv: agar qidiruv natijasida hech narsa topilmasa */}
            {filteredElements.length > 0 ? (
              <div className="space-y-1">
                {/* Filtrlangan elementlarni render qilamiz */}
                {filteredElements.map(
                  (group) =>
                    // Guruh null bo'lishi mumkinligi uchun qo'shimcha tekshiruv
                    group && (
                      <div key={group.title} className="mb-4">
                        <h3 className="text-xs font-semibold text-slate-600 mb-2">
                          {group.title}
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {group.elements.map((element, index) => (
                            <div
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify(element)
                                );
                              }}
                              key={index}
                              className="cursor-grab active:cursor-grabbing flex items-center gap-2 rounded-lg border border-transparent p-2.5 transition-all hover:border-white/[0.08] hover:bg-white/[0.02]"
                            >
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs ${element.color}`}
                              >
                                {element.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                  {element.name}
                                </div>
                                <div className="text-xs">
                                  {element.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            ) : (
              <div className="text-center text-sm mt-8">
                Hech narsa topilmadi.
              </div>
            )}

            {/* Load More (agar qidiruv bo'sh bo'lsa ko'rsatiladi) */}
            {!searchTerm && (
              <div className="mt-4 flex items-center justify-center">
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Load more components
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Main Canvas Area */}
        <main className="flex-1 flex flex-col">
          <Constructor />
        </main>
      </div>
    </div>
  );
}
1;
