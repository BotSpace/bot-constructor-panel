import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import GetProductionBotToken from "./components/get-production-bot-token";
import { useState } from "react";
import { ReleaseForm } from "./types";
import SelectPlan from "./components/select-plan/select-plan";


function ReleasePanel() {

  const [form, setform] = useState<ReleaseForm>({
    token: '',
    plan_id: '',
    sale_for_long_time: '3 months',
  })

  const updateForm = (key: string, value: string) => {
    setform({
      ...form,
      [key]: value,
    })
  }


  return (
    <Dialog open={false}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'lg'} className="cursor-pointer !bg-blue-500">Pulish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">

        {/* <GetProductionBotToken
          header={
            <DialogHeader>
              <DialogTitle>Bot tokenini kiriting</DialogTitle>
              <DialogDescription>
                Bot tokenini kiriting va pulish botni ishga tushirish uchun bepul token oling.
              </DialogDescription>
            </DialogHeader>
          }
          updateForm={updateForm} /> */}

        <SelectPlan
          header={
            <DialogHeader>
              <DialogTitle>Tarifni tanlang</DialogTitle>
              <DialogDescription>
                Tarifni tanlang va botni ishga tushirish uchun to'lov qiling.
              </DialogDescription>
            </DialogHeader>
          }
          updateForm={updateForm} />


        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Next</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  )

}

export { ReleasePanel };
