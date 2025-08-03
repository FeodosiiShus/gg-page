import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import hljs from "highlight.js";
import "highlight.js/styles/github.css"; // Выберите стиль подсветки

const Chat: React.FC = () => {
    const [question, setQuestion] = useState("");
    const [history, setHistory] = useState<{ question: string; response: string }[]>(
        []
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

        if (!apiKey) {
            alert("API key is missing. Please check your .env file.");
            return;
        }

        const ai = new GoogleGenAI({ apiKey });

        setIsLoading(true);
        let timeoutId: NodeJS.Timeout;

        try {
            const context = history
                .map((item) => `Q: ${item.question}\nA: ${item.response}`)
                .join("\n");

            const fullPrompt = context
                ? `${context}\nQ: ${question}`
                : `Q: ${question}`;

            timeoutId = setTimeout(() => {
                setHistory((prevHistory) => [
                    { question, response: "Error: Response timeout exceeded (30 seconds)." },
                    ...prevHistory,
                ]);
                setIsLoading(false);
            }, 30000);

            const aiResponse = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: fullPrompt,
                config: {
                    thinkingConfig: {
                        thinkingBudget: 0,
                    },
                },
            });

            clearTimeout(timeoutId);

            const responseText = aiResponse?.text?.trim() || "No response text available.";

            const formattedResponse = formatResponse(responseText);

            setHistory((prevHistory) => [
                { question, response: formattedResponse },
                ...prevHistory,
            ]);

            setQuestion("");
        } catch (error) {
            console.error("Something went wrong: ", error);
            setHistory((prevHistory) => [
                { question, response: "Error: Something went wrong. Try again." },
                ...prevHistory,
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading) {
                handleSubmit(e as unknown as React.FormEvent);
            }
        }
    };

    const formatResponse = (response: string): string => {
        const formatted = response
            .replace(/```([\s\S]*?)```/g, (match, code) => {
                const highlightedCode = hljs.highlightAuto(code).value;
                return `<pre style="background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 0.9rem;"><code>${highlightedCode}</code></pre>`;
            }) // Блоки кода с подсветкой
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Жирный текст
            .replace(/_(.*?)_/g, "<em>$1</em>") // Курсив
            .replace(/\n/g, "<br />") // Переносы строк
            .replace(/(#+)\s(.+)/g, (match, hashes, text) => {
                const level = hashes.length;
                return `<h${level} style="margin: 10px 0; font-size: ${1.5 - 0.2 * level}rem; font-weight: bold;">${text}</h${level}>`;
            }); // Заголовки
        return formatted;
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
                    fontSize: "1.8rem",
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
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        marginBottom: "10px",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                        resize: "none",
                        boxSizing: "border-box",
                        backgroundColor: isLoading ? "#f0f0f0" : "#fff",
                        cursor: isLoading ? "not-allowed" : "text",
                    }}
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: isLoading ? "#ccc" : "#007BFF",
                        color: isLoading ? "#666" : "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isLoading ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        width: "100%",
                    }}
                >
                    {isLoading ? "Waiting..." : "Send"}
                </button>
            </form>
            <div
                style={{
                    marginTop: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {history.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            padding: "15px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            fontSize: "0.9rem",
                        }}
                    >
                        <h2
                            style={{
                                marginBottom: "10px",
                                color: "#333",
                                fontSize: "1.2rem",
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "5px",
                            }}
                        >
                            Question:
                        </h2>
                        <p
                            style={{
                                whiteSpace: "pre-wrap",
                                color: "#555",
                                lineHeight: "1.5",
                                fontSize: "1rem", // Единообразный размер шрифта
                            }}
                        >
                            {item.question}
                        </p>
                        <h2
                            style={{
                                marginTop: "10px",
                                marginBottom: "10px",
                                color: "#333",
                                fontSize: "1.2rem",
                                borderBottom: "1px solid #ddd",
                                paddingBottom: "5px",
                            }}
                        >
                            Response:
                        </h2>
                        <div
                            dangerouslySetInnerHTML={{ __html: item.response }}
                            style={{
                                color: "#555",
                                lineHeight: "1.5",
                                fontSize: "1rem", // Единообразный размер шрифта
                                overflowWrap: "break-word",
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;