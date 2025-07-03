'use client'

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {};

export default function Page({}: Props) {
  
  const route = useRouter()

  useEffect(() => {
    route.push('/constructor')
  }, [])
  
  return null;

}