import * as monaco from "monaco-editor";

// Snippetlarni qayta ishlatish uchun kichik yordamchi
const createSnippet = (
  monacoInstance: typeof monaco,
  label: string,
  insertText: string,
  detail: string,
  kind = monacoInstance.languages.CompletionItemKind.Snippet
) => ({
  label,
  kind,
  insertText,
  insertTextRules:
    monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
  detail,
});

export const pythonKeywords = (monacoInstance: typeof monaco) => {
  // Takliflarni guruhlarga ajratamiz, bu kodni o'qishni osonlashtiradi

  // 1. Asosiy bloklar uchun Snippetlar
  const mainSnippets = [
    createSnippet(
      monacoInstance,
      "def",
      "def ${1:function_name}(${2:args}):\n\t${0:pass}",
      "Funksiya e'lon qilish"
    ),
    createSnippet(
      monacoInstance,
      "class",
      "class ${1:ClassName}:\n\tdef __init__(self, ${2:args}):\n\t\t${0:pass}",
      "Klass e'lon qilish"
    ),
    createSnippet(
      monacoInstance,
      "if",
      "if ${1:condition}:\n\t${0:pass}",
      "Shart operatori"
    ),
    createSnippet(
      monacoInstance,
      "for",
      "for ${1:item} in ${2:iterable}:\n\t${0:pass}",
      "For sikl operatori"
    ),
    createSnippet(
      monacoInstance,
      "while",
      "while ${1:condition}:\n\t${0:pass}",
      "While sikl operatori"
    ),
    createSnippet(
      monacoInstance,
      "try",
      "try:\n\t${1:pass}\nexcept ${2:Exception} as e:\n\t${0:pass}",
      "Xatoliklarni ushlash (try/except)"
    ),
    createSnippet(
      monacoInstance,
      "with",
      "with ${1:expression} as ${2:variable}:\n\t${0:pass}",
      "Kontekst menejeri (with)"
    ),
    createSnippet(
      monacoInstance,
      "if __name__",
      'if __name__ == "__main__":\n\t${0:pass}',
      "Asosiy skriptni ishga tushirish bloki"
    ),
    createSnippet(
      monacoInstance,
      "lambda",
      "lambda ${1:arguments}: ${0:expression}",
      "Anonim (lambda) funksiya"
    ),
  ];

  // 2. Oddiy kalit so'zlar
  const simpleKeywords = [
    "else",
    "elif",
    "finally",
    "break",
    "continue",
    "pass",
    "return",
    "import",
    "from",
    "in",
    "is",
    "not",
    "and",
    "or",
    "del",
    "global",
    "nonlocal",
    "assert",
    "yield",
    "async",
    "await",
  ].map((keyword) => ({
    label: keyword,
    kind: monacoInstance.languages.CompletionItemKind.Keyword,
    insertText: keyword + " ",
    detail: `"${keyword}" kalit so'zi`,
  }));

  // 3. O'rnatilgan funksiyalar (Built-in Functions)
  const builtInFunctions = [
    createSnippet(
      monacoInstance,
      "print()",
      "print(${0:object})",
      "Konsolga chiqarish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "len()",
      "len(${0:iterable})",
      "Obyekt uzunligini olish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "range()",
      "range(${0:stop})",
      "Raqamlar diapazonini yaratish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "str()",
      "str(${0:object})",
      "Satrga o'girish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "int()",
      "int(${0:x})",
      "Butun songa o'girish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "list()",
      "list(${0:iterable})",
      "Ro'yxatga o'girish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "dict()",
      "dict(${0:key=value})",
      "Lug'at yaratish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "set()",
      "set(${0:iterable})",
      "To'plam yaratish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "open()",
      "open('${1:file}', mode='${2:r}')",
      "Faylni ochish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
    createSnippet(
      monacoInstance,
      "isinstance()",
      "isinstance(${1:object}, ${2:classinfo})",
      "Obyekt turini tekshirish",
      monacoInstance.languages.CompletionItemKind.Function
    ),
  ];

  // 4. "Dunder" (Magic) metodlar
  const dunderMethods = [
    createSnippet(
      monacoInstance,
      "__init__",
      "def __init__(self, ${1:args}):\n\t${0:pass}",
      "Klass initsializatori",
      monacoInstance.languages.CompletionItemKind.Method
    ),
    createSnippet(
      monacoInstance,
      "__str__",
      "def __str__(self):\n\treturn super().__str__()",
      "Obyektning satr ko'rinishi",
      monacoInstance.languages.CompletionItemKind.Method
    ),
    createSnippet(
      monacoInstance,
      "__repr__",
      "def __repr__(self):\n\treturn super().__repr__()",
      "Obyektning rasmiy ko'rinishi",
      monacoInstance.languages.CompletionItemKind.Method
    ),
  ];

  // Barcha takliflarni bitta massivga birlashtiramiz
  return [
    ...mainSnippets,
    ...simpleKeywords,
    ...builtInFunctions,
    ...dunderMethods,
  ];
};
