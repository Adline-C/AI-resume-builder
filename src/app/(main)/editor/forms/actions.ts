"use server";
import genAI from "@/lib/gemini"; // Updated import
import { canUseAITools } from "@/lib/permissions";
import { getUserSubscriptionLevel } from "@/lib/subscription";
 // Import Gemini SDK
import { GenerateSummaryInput, generateSummarySchema, GenerateWorkExperienceInput, generateWorkExperienceSchema, WorkExperience } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

// Initialize Gemini

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const systemMessage = `
    You are a job resume generator AI. Your task is to write a professional introduction summary for a resume with the given user's provided data.
    ONLY return the summary and DO NOT include any other information in the response. Keep it concise and professional.
  `;

  const userMessage = `
    Please generate a professional resume summary from this data:
    Job Title: ${jobTitle || "N/A"} 
    Work Experience:${workExperiences
      ?.map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} 
        from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}
        Description: ${exp.description || "N/A"}
      `
      )
      .join("\n\n")}

    Education:${educations
      ?.map(
        (edu) => `
        Degree: ${edu.degree || "N/A"} at ${edu.institution || "N/A"} 
        from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
      `
      )
      .join("\n\n")}

    Skills:${skills}
  `;

  console.log("systemMessage", systemMessage);
  console.log("userMessage", userMessage);

  // Initialize the Gemini model
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    // Combine system and user messages for Gemini
    const prompt = `${systemMessage}\n\n${userMessage}`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    if (!aiResponse) {
      throw new Error("Failed to generate AI Response");
    }

    return aiResponse;
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to generate summary");
  }
}

export async function generateWorkExperience(input: GenerateWorkExperienceInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const {description}= generateWorkExperienceSchema.parse(input)

  const systemMessage = `
  You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input. Try to refine the words a bit from the user entry.
  Your response must adhere to the following structure. You can omit fields if they can't be infered from the provided data, but don't add any new ones.
  
  Job title: <job title>
  Company: <company name>
  Start date: <format: YYYY-MM-DD> (Only if provided)
  End date: <format: YYYY-MM-DD> (Only if provided)
  Description: <an optimized description in bullet format,might be infered from the job title>
  `

  const userMessage = `Please provide a work experience entry from this description: ${description}`

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    // Combine system and user messages for Gemini
    const prompt = `${systemMessage}\n\n${userMessage}`;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    if (!aiResponse) {
      throw new Error("Failed to generate AI Response");
    }
console.log("aiResponse",aiResponse)

    return {
      position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
      company: aiResponse.match(/Company: (.*)/)?.[1] || "",
      description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
      startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
      endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
    } satisfies WorkExperience
  } catch (error) {
    console.error("Error generating summary with Gemini:", error);
    throw new Error("Failed to generate summary");
  }


  
}