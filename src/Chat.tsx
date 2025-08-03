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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div
            style={{
                padding: "20px",
                maxWidth: "600px",
                width: "90%",
                margin: "0 auto",
                fontFamily: "Arial, sans-serif",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease-in-out",
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                    color: "#333",
                    fontSize: "2rem",
                }}
            >
                Asker
            </h1>
            <form onSubmit={handleSubmit}>
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your request..."
                rows={4}
                style={{
                    width: "100%",
                    marginBottom: "10px",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    fontSize: "1rem",
                    resize: "none",
                    boxSizing: "border-box",
                }}
            />
                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007BFF",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        width: "100%",
                    }}
                >
                    Send
                </button>
            </form>
            {response && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "15px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        fontSize: "1rem",
                    }}
                >
                    <h2
                        style={{
                            marginBottom: "10px",
                            color: "#333",
                            fontSize: "1.5rem",
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "5px",
                        }}
                    >
                        Response:
                    </h2>
                    <p
                        style={{
                            whiteSpace: "pre-wrap",
                            color: "#555",
                            lineHeight: "1.5",
                        }}
                    >
                        {response}
                    </p>
                </div>
            )}
        </div>
    );
};

export default Chat;