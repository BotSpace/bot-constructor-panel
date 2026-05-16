import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import GetProductionBotToken from "./components/get-production-bot-token";
import { useEffect, useState } from "react";
import { ReleaseForm } from "./types";
import SelectPlan from "./components/select-plan/select-plan";
import Billing from "./components/payment/payment";
import { useReactQueryAction } from "@/services/react-query";
import { APIDetailCreateResponse } from "@/types/http/response";
import { Balance } from "./components/payment/types";


function ReleasePanel() {
  const { data: userBalance } = useReactQueryAction<APIDetailCreateResponse<Balance>>({
    url: "/user/balance",
    refetchInterval: 15000, // Har 15 soniyada yangilash
  });

  const [form, setform] = useState<ReleaseForm>({
    token: '',
    plan_id: '',
    sale_for_long_time: '3 months',
    total_price: 0,
  })
  const [step, setStep] = useState<('select_plan' | 'payment' | "get_token")>('select_plan')

  function getNextStep() {
    if (!userBalance?.data) return 'select_plan'
    switch (step) {
      case 'select_plan':
        if (form.total_price <= userBalance?.data.balance)
          setStep('payment')
        else
          setStep('get_token')
        break
      case 'payment':
        setStep('get_token')
        break
      case 'get_token':
        break
      default:
        setStep('select_plan')
        break
    }
  }

  const updateForm = (key: string, value: string) => {
    setform({
      ...form,
      [key]: value,
    })
  }



  useEffect(() => {
    if (!userBalance?.data) return;

    if (userBalance?.data.balance > form.total_price)
      setStep('get_token')

  }, [userBalance])


  // Debug mode
  useEffect(() => {
    console.log(form)
  }, [form])


  if (!userBalance?.data) return null;
  return (
    <Dialog open={true}>
      <DialogTrigger asChild>
        <Button variant="outline" size={'lg'} className="cursor-pointer !bg-blue-500">Pulish</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-y-auto">
        {
          step === "select_plan" ?
            <SelectPlan
              header={
                <DialogHeader>
                  <DialogTitle>Tarifni tanlang</DialogTitle>
                  <DialogDescription>
                    Tarifni tanlang va botni ishga tushirish uchun to'lov qiling.
                  </DialogDescription>
                </DialogHeader>
              }
              handleNextStep={getNextStep}
              updateForm={updateForm} /> :
            step === "payment" ?
              <Billing initialAmmount={form.total_price - userBalance?.data.balance} userBalance={userBalance?.data} /> :
              <GetProductionBotToken
                header={
                  <DialogHeader>
                    <DialogTitle>Bot tokenini kiriting</DialogTitle>
                    <DialogDescription>
                      Bot tokenini kiriting va pulish botni ishga tushirish uchun bepul token oling.
                    </DialogDescription>
                  </DialogHeader>
                }
                updateForm={updateForm} />
        }

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
