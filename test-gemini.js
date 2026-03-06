import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// The specific key provided by the user
const API_KEY = process.env.GOOGLE_API_KEY || "AIzaSyDNtXl1JAHnja9LHkOLyVKWp6Kr0ZcX0Dw";

async function testGemini() {
    console.log("Starting Gemini API Test...");
    console.log(`Using Model: gemini-2.5-flash`);
    console.log(`Using apiVersion: v1`);

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            apiVersion: "v1"
        });

        console.log("Model initialized. Generating content...");

        const result = await model.generateContent("Diga 'Olá, o modelo gemini-2.5-flash está funcionando perfeitamente!'");
        const response = await result.response;

        console.log("\n✅ SUCCESS! Response from Gemini:");
        console.log(response.text());

    } catch (error) {
        console.error("\n❌ ERROR: Failed to communicate with Gemini API.");
        console.error("Error Details:", error.message);
        if (error.status) console.error("Status Code:", error.status);
        process.exit(1);
    }
}

testGemini();
