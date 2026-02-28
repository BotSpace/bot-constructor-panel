# React Flow uchun Custom Formatter Yaratish Qo'llanmasi

Siz yozgan bot constructor platformasidagi node'lar va ulanishlar oddiy daraxt (tree) strukturasidan ancha murakkab ekanligi ko'rinib turibdi. Formatlash algoritmini to'g'ri qurish uchun avvalo nima uchun hozirgi yechim ishlamaganini tushunish va keyin maqsadli yechimni ishlab chiqish kerak.

---

## 1. Nima uchun `dagre` sizning Node'laringizda ishlamadi?

Sizdagi nodelar strukturasi **Dagreda hisobga olinmagan** ko'plab o'ziga xosliklarga ega:

1. **Aralash yo'nalishlar (Mixed Directions):**
   Dagre butun graf uchun bitta yo'nalish belgilaydi (Top-to-Bottom yoki Left-to-Right). Lekin sizda:
   - Asosiy oqim: Tepadan pastga (Target tepada, Source pastda).
   - Shartli zanjir: `If` $\rightarrow$ `ElseIf` $\rightarrow$ `Else` zanjirida tugunlar yondan ulanadi (Source o'ngda, Target chapda).
     Dagre buni bitta rank'ga (gorizontal chiziqqa) joylashtirishga qiynaladi va graf chalkashib ketadi.

2. **Handle (Port) larning aniq pozitsiyalari:**
   Dagre node'ning aniq qayeridan (tepadanmi, yondanmi) chiziq chiqayotganini bilmaydi.

3. **Cross-Reference ulanishlari:**
   `EditMessageNode` yoxud `DeleteMessageNode`lardagi `EditMessageSource` $\rightarrow$ `SelectedMessageTarget` kabi ulanishlar algoritm uchun **aylanma yoxud sakrash**dek ko'rinadi. Aslida ular tartibga ta'sir qilmasligi, shunchaki yon tomondan chiziluvchi ishorat (reference) bo'lishi kerak edi.

---

## 2. To'g'ri Yechim: Custom Recursive (DFS) yoxud ELKjs

Bunday murakkab bot konstruktorlari uchui asosan ikkita yo'l tutiladi.

### A Variant: ELKjs kutubxonasidan foydalanish (Osonroq)

ELK (Eclipse Layout Kernel) Dagredan ko'ra ancha kuchli. U har bir Edge qaysi pordan (handle) chiqqani va qaysi portga kirganini tushuna oladi va shunga qarab orthogonal (tekis va 90 gradusli) graf chizadi. Lekin u ham barcha turdagi "sayohatchi" (cross-link) edge'larda o'zini ozgina g'alati tutishi mumkin.

### B Variant: O'zimizning Custom Formatter'ni yozish (Eng yaxshi nazorat!)

Chunki sizning ssenariyingizda Node'lar ma'lum bir naqsh (pattern) ga asoslangan. Agar Custom formatter yoza olsangiz, barcha chalkashliklarning oldini olasiz.

Quyida **Custom Formatter** qanday ishlashi kerakligi bo'yicha algoritmni ko'rib chiqamiz.

---

## 3. Custom Formatter Algoritmi Qadamlari (`src/features/bot-constructor/lib/format-flow.ts` ga tatbiq etish uchun)

Bot oqimi asosan **Trigger**'lardan boshlanadi. Formatlashning asosiy g'oyasi – Edge'larni ustunligiga qarab filtrlash va har bir bo'g'inni eng yuqoridan (Trigger) pastga qarab, Depth-First Search (DFS) orqali chizib chiqish.

### 1-qadam: Grafdan "Secondary" (Qo'shimcha) Edge'larni chetlatib turish

Qurilishni hisoblashda biz faqat **Asosiy oqimni** (Parent $\rightarrow$ Child) inobatga olishimiz kerak.

- **Ignore qilinadigan ulanishlar:** `EditMessageSource`, `DeleteMessageSource` lardan chiqib, `SelectedMessageTarget` ga tushgan Edge'lar. Bular layout algoritmi hisobidan chiqarib tashlanadi, chunki ular oqimning davomi emas, o'tib ketgan eski node'ga bo'lgan havola xolos. Shuningdek, `else-message-source` ham ignore qilinishi yoki alohida yon tomondagi shox sifatida ishlashi mumkin.

### 2-qadam: Boshlang'ich (Root) Nodelarni aniqlash

Sizda oqimlarning boshi: `CommandTriggerNode`, `MessageTriggerNode`, `CronTriggerNode` va h.k.
Hech qanday `target` handle'iga edge ulanmagan node'larni **Root Node'lar** deymiz.
Ularni Y = 0 va tartib bilan X koordinata bo'ylab (masalan X=0, 400, 800) terib chiqamiz.

### 3-qadam: Daraxt bo'ylab yurish (DFS or Recursive Layout)

Har bir joylashgan node uchun, undan chiqayotgan chiziqlarni (Edge) ko'rib chiqamiz:

_Masalan, N1 joylashgan (X1, Y1):_

- Agar N1 dan bitta odatiy `source` chiqsa va N2 ga ulansa, N2 ning koordinatasi: `Y2 = Y1 + nodeHeight + gapY` bo'ladi. X2 esa N1 ning markazi yoxud uning bolalarini simmetrik yonma-yon joylashtiradigan nuqta.
- Agar Node'dan bittadan ortiq yo'l chiqsa (Masalan `CheckMembershipNode`, `LoadCollectionItemNode`), ularni ham X o'qi bo'ylab yonma-yon (`gapX` tashlab) va bitta pog'ona pastda (Y + offset) joylashtirasiz.

### 4-qadam: Murakkab zanjir: `If` $\rightarrow$ `ElseIf` $\rightarrow$ `Else`

Buning xatti-harakati boshqa Nodelardan katta farq qiladi. Ularni maxsus qoida bilan joylashtiramiz:

- N1 = `IfConditionNode`. Funksiyamiz uning `next` portidan chiqqan bolasi bilan `true` portidan chiqqan bolasini ajratishi kerak.
- N2 = `If` ning tugagandan keyingi sharti (Yani `ElseIfNode` `next` portidan kelib tushgan). **Qoida:** N2 tuguni N1 tugunining **Yonida** turishi kerak.
  - `Y2 = Y1` (bir xil balandlikda).
  - `X2 = X1 + nodeWidth + gapHorizontal`.
- N3 = `If` ning `true` portidan tushgan bola. U pastda turadi:
  - `Y3 = Y1 + nodeHeight + gapVertical`.
  - `X3 = X1`.

Shu tarzda algoritmingiz barcha `If`-`ElseIf`-`Else` larni devorda taxlangan g'ishtdek gorizontal terib chiqadi, ularning har birining ostidan ketgan "rost" shoxobchalar esa pastlikka qarab oqib tushaveradi.

---

## 4. `format-flow.ts` uchun boshlang'ich psevdokod (Namuna)

Sizdagi `getFormatFlow` funksiyasi uchun struktura karkasi shunga juda o'xshash bo'ladi:

```typescript
import { Node, Edge } from "reactflow";

// O'lchamlar va Masofalar
const NODE_WIDTH = 300;
const NODE_HEIGHT = 150;
const GAP_X = 100;
const GAP_Y = 100;

interface FormatFlowProps {
  nodes: Node[];
  edges: Edge[];
}

export const getFormatFlow = ({ nodes, edges }: FormatFlowProps) => {
  // 1. O'zgaruvchilarni va Edge'larni tozalash/tayyorlash
  // (Reference edge'larni o'tkazib yuboramiz. Masalan: EditMessage reference'lari)
  const treeEdges = edges.filter(
    (e) =>
      e.sourceHandle !== "edit-message-source" &&
      e.sourceHandle !== "delete-message-source",
  );

  // 2. Har bir node uchun bolalarni topish (adjacency list)
  const childrenMap = new Map<
    string,
    Array<{ childId: string; handle: string }>
  >();

  treeEdges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) childrenMap.set(edge.source, []);
    childrenMap.get(edge.source)!.push({
      childId: edge.target,
      handle: edge.sourceHandle || "source-handler",
    });
  });

  // 3. Root nodelarni aniqlash (hech qanday targetEdge'i yo'q nodelar)
  // Ammo CommandTrigger kabilarga kimdir ulangan bo'lsa ham ularni Triggerligi hisobidan ajratib olsa bo'ladi
  const targetIds = new Set(treeEdges.map((e) => e.target));
  const rootNodes = nodes.filter(
    (n) => !targetIds.has(n.id) || n.type?.includes("Trigger"),
  );

  // 4. Joylashtirish algoritmi (DFS)
  const placedNodes = new Set<string>();
  const newNodePositions = new Map<string, { x: number; y: number }>();

  // Eng chetki hududdagi X ni ushlab turadi, toki boshqa shoxlar ustma-ust tushib qolmasligi uchun
  let globalMaxX = 0;

  const placeNodeAndChildren = (
    nodeId: string,
    x: number,
    y: number,
  ): number => {
    if (placedNodes.has(nodeId)) return globalMaxX; // Sikllar oldini olish

    placedNodes.add(nodeId);
    newNodePositions.set(nodeId, { x, y });

    const nodeItem = nodes.find((n) => n.id === nodeId);
    let currentX = Math.max(x, globalMaxX); // O'ngdagi bo'sh joydan boshlash

    const children = childrenMap.get(nodeId) || [];

    // Maxsus tartibni qurish, masalan ElseIf uchun
    if (
      nodeItem?.type === "IfConditionNode" ||
      nodeItem?.type === "ElseIfNode"
    ) {
      const trueChild = children.find((c) => c.handle === "true");
      const nextChild = children.find((c) => c.handle === "next");

      // True tarmog'i (pastga ketadi)
      if (trueChild) {
        currentX = placeNodeAndChildren(
          trueChild.childId,
          currentX,
          y + NODE_HEIGHT + GAP_Y,
        );
      }
      // Next tarmog'i (o'ngga ketadi ElseIf/Else ni olib)
      if (nextChild) {
        // Balandlik shu nodeniki bilan bir xil, lekin X oldingi shoxning oxiridan + GAP_X bo'ladi
        placeNodeAndChildren(
          nextChild.childId,
          currentX + NODE_WIDTH + GAP_X,
          y,
        );
      }
    } else {
      // Oddiy Nodelar: Barcha bolalarini yonma-yon pastga qo'yib chiqish
      let childX = currentX;
      children.forEach((child) => {
        childX = placeNodeAndChildren(
          child.childId,
          childX,
          y + NODE_HEIGHT + GAP_Y,
        );
        childX += NODE_WIDTH + GAP_X; // Keyingi bola bilan masofa
      });
      if (children.length > 0) {
        currentX = childX - (NODE_WIDTH + GAP_X); // ota uchun chegarani saqlash
      }
    }

    // keyingi Trigger yoki mustaqil oqim kelganda devor yostig'iga kirmasligi uchun maxX ni yangilaymiz
    globalMaxX = Math.max(globalMaxX, currentX);
    return currentX;
  };

  // 5. Barcha Root nodelarni ketma-ket joylab chiqamiz
  let rootX = 0;
  rootNodes.forEach((root) => {
    placeNodeAndChildren(root.id, rootX, 0);
    rootX = globalMaxX + NODE_WIDTH + GAP_X * 2; // triggerlar o'rtasidagi masofa
  });

  // 6. Nodelarni yangi position bilan qaytarish
  const formattedNodes = nodes.map((node) => {
    const defaultPos = newNodePositions.get(node.id);
    return {
      ...node,
      position: defaultPos || node.position, // Topilmaganlarni o'z holicha qoldiradi
    };
  });

  return { nodes: formattedNodes, edges };
};
```

### Xulosa: Custom Algoritmning afzalliklari

- **If $\rightarrow$ ElseIf zanjirini mukammal tizadi:** Boshqa kutubxonalar kabi buzg'unchilik qilmaydi. Ular eng chiroyli gorizontal ustun ko'rinishida turadi.
- **Kesishishlar va Sikllarni tozaladi:** Algoritm "Delete/Edit message" larga qarashli _Ref Edge'larni_ tahlildan yashiradi, shu orqali React Flow bu chiziqlarni to'gridan taxtadan (canvasdan) yonma-yon aylanib o'tish bilan (bezier / smoothstep) o'zi chiroyli tasvirlab beradi lkn uni Node lar ustidan olib o'tmaydi.
- Oqimlar qanchalik murakkab bo'lmasin, ularni o'stirishda (Tree Width / Tree Height) mutlaq erkinlik beradi. Custom layout bot interfeyslari orasida ko'pincha **eng barqaror variant** hisoblanadi. Siz o'z nodelaringizni o'lchamlarini `NODE_WIDTH` orqali to'g'irlab olsangiz bo'ldi.
