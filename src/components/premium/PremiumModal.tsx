"use client"
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createCheckoutSession } from "./actions";
import { env } from "@/env";

const premiumFeatures = ["AI Tools","Up to 3 resumes"]
const premiumPlusFeatures = ["Inifnite Resumes", "Design customizations"]

export default function PremiumModal(){
const{open,setOpen}=usePremiumModal();

const {toast} =useToast();

const [loading,setLoading] = useState(false)
async function handlePremiumClick(priceId:string) {
  try{
   setLoading(true)
   const redirectUrl = await createCheckoutSession(priceId);
   if (typeof redirectUrl === 'string') {
     window.location.href = redirectUrl;
   } 
  }catch (error){
    console.error(error);
    toast({
        variant:"destructive",
        description: "Something went wrong. Please try again."
    })
  } finally {
    setLoading(false)
  }
    
}

    return <Dialog open={open} onOpenChange={() => {
        if (!loading){
            setOpen(!open)
        }
    }}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Resume Craft Premium</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
                <p>Get a premium subscription to unlock more features.</p>
                <div className="flex">
                    <div className="flex w-1/2 flex-col space-y-5">
                    <h3 className="text-center text-lg font-bold">Premium</h3>
                    <ul className="list-inside space-y-2">
                    {premiumFeatures.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                            <Check className="size-4 text-violet-600" />
                            {feature}

                        </li>
                    ))}</ul> <Button variant="outline" onClick={() => handlePremiumClick(
                        env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY
                    )} disabled={loading}>Get Premium</Button>
                    </div>
                    <div className="border-1 mx-6"></div>
                    <div className="flex w-1/2 flex-col space-y-5">
                    <h3 className="text-center text-lg font-bold bg-gradient-to-r from-violet-700 to-violet-300 bg-clip-text text-transparent">Premium Plus</h3>
                    <ul className="list-inside space-y-2">
                    {premiumPlusFeatures.map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                            <Check className="size-4 text-violet-600" />
                            {feature}
                        </li>
                    ))}</ul> <Button variant="premium" onClick={() => handlePremiumClick(
                        env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_PLUS_MONTHLY
                    )} disabled={loading}>Get Premium Plus</Button>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
}