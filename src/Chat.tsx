import React, {useState} from "react";
import {GoogleGenAI} from "@google/genai";

const Chat: React.FC = () => {
    const [question, setQuestion] = useState("");
    const [response, setResponse] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

        if (!apiKey) {
            alert("API key is missing. Please check your .env file.");
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: question,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking
                    },
                }
            });

            if (response && response.text) {
                setResponse(response.text.trim());
            } else {
                setResponse("No response text available.");
            }
            console.log(response);
        } catch (error) {
            console.error("Something went wrong: ", error);
            setResponse("Something went wrong. Try again");
        }
    };

    return (
        <div style={{padding: "20px", maxWidth: "600px", margin: "0 auto"}}>
            <h1>Asker</h1>
            <form onSubmit={handleSubmit}>
        <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your request"
            rows={4}
            style={{width: "100%", marginBottom: "10px"}}
        />
                <button type="submit" style={{padding: "10px 20px"}}>
                    Send
                </button>
            </form>
            {response && (
                <div style={{marginTop: "20px", padding: "10px", border: "1px solid #ccc"}}>
                    <h2>Response:</h2>
                    <p>{response}</p>
                </div>
            )}
        </div>
    );
};

export default Chat;