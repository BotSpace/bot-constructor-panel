import React from "react";

type Props = {
  node_description: string;
};

function ComingSoonNodeContent({ node_description }: Props) {
  return (
    <div className="flex flex-col text-center">
      <div className="text-sm text-muted-foreground">{node_description}</div>
      <b>⏳ Ushbu funksional hozircha mavjud emas. Tez orada qo'shiladi!</b>
    </div>
  );
}

export default ComingSoonNodeContent;
