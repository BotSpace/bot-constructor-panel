import React from "react";
import ClientSideComponent from "./client";

type Props = {};

const data = [
  {
    name: "John Doe",
    age: 30,
    email: "john.doe@example.com",
    interests: ["coding", "music", "travel"],
    address: {
      city: "Tashkent",
      country: "Uzbekistan",
      zip: "100000",
    },
    active: true,
  },
  {
    name: "Jane Smith",
    age: 28,
    email: "jane.smith@example.com",
    interests: ["reading", "sports"],
    address: {
      city: "Samarkand",
      country: "Uzbekistan",
      zip: "140100",
    },
    active: false,
  },
  {
    name: "Ali Karimov",
    age: 35,
    email: "ali.karimov@example.com",
    interests: ["photography", "food"],
    address: {
      city: "Bukhara",
      country: "Uzbekistan",
      zip: "200100",
    },
    active: true,
  },
];

function Page({}: Props) {
  return <ClientSideComponent data={data} />;
}

export default Page;
