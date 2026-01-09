import React from "react";

type Props = {
  data: any;
};

function ClientSideComponent({ data }: Props) {
  console.log(data);

  return <div>ClientSideComponent</div>;
}

export default ClientSideComponent;
