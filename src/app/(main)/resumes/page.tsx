export const dynamic = "force-dynamic";
export const runtime = "nodejs";
import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next"
import ResumeItem from "./ResumeItem";
import CreateResumeButton from "./CreateResumeButton";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canCreateResume } from "@/lib/permissions";

export const metadata: Metadata= {
    title : "Your Resumes"
}

export default async function Page(){
const {userId} = await auth();

if(!userId){
    return null
}


const [resumes, totalCount, subscriptionLevel] = await Promise.all([
    prisma.resume.findMany({
        where: {
            userId
        },
        orderBy: {
            updatedAt: "desc"
        },
        include: resumeDataInclude
    }),
    prisma.resume.count({
        where: {userId}
    }),
    getUserSubscriptionLevel(userId)
])

    return (<main className="max-w-7x1 mx-auto w-full px-3 py-6 space-y-6">
        <CreateResumeButton 
        canCreate={canCreateResume(subscriptionLevel,totalCount)}
        />
<div className="space-y-1">
    <h1 className="text-3xl font-bold">Your Resumes</h1>
    <p>Total: {totalCount}</p>
</div>
<div className="flex flex-col sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-3">
    {resumes.map((resume) =>(
<ResumeItem key={resume.id} resume={resume} /> 
    ))}
</div>
    </main>
    );
}