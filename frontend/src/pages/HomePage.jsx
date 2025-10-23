import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { sendImageChat, sendCsvChat, sendTextChat } from "../lib/helper";

const HomePage = () => {
    const [contents, setContents] = useState([]);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [csvFile, setCsvFile] = useState(null);
    const fileInputRef = useRef(null);

    // File & Input Handlers
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type === "text/csv") {
            setCsvFile(file);
            setImage(null);
            setPreview(null);
        } else {
            setImage(file);
            setCsvFile(null);
            setPreview(URL.createObjectURL(file));
        }
    };

    const resetAfterSend = () => {
        setPrompt("");
        setLoading(false);
        setImage(null);
        setPreview(null);
        setCsvFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // Stream text from response 
    const streamResponse = async (response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            fullText += chunk;
            setContents((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = fullText;
                return updated;
            });
        }
    };

    // Handle Submit 
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim() && !image && !csvFile) return;

        setContents((prev) => [...prev, { role: "user", content: prompt }]);
        if (preview)
            setContents((prev) => [
                ...prev,
                { role: "user", content: <img src={preview} alt="preview" className="max-w-xs rounded-lg" /> },
            ]);
        setLoading(true);
        setContents((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            let response;
            if (image) response = await sendImageChat(prompt, image);
            else if (csvFile) response = await sendCsvChat(prompt, csvFile);
            else response = await sendTextChat(prompt, contents);

            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                const data = await response.json();
                handleJsonResponse(data);
            } else {
                await streamResponse(response);
            }
        } catch (err) {
            console.error("Streaming error:", err);
            setContents((prev) => [
                ...prev,
                { role: "assistant", content: "Error sending request to server." },
            ]);
        } finally {
            resetAfterSend();
        }
    };

    // Handle JSON response (CSV chart case) 
    const handleJsonResponse = (data) => {
        if (data.image) {
            setContents((prev) => [
                ...prev,
                { role: "assistant", content: data.text },
                {
                    role: "assistant",
                    content: (
                        <img
                            src={`data:image/png;base64,${data.image}`}
                            alt="Chart"
                            className="rounded-lg shadow-md max-w-sm mt-2"
                        />
                    ),
                },
            ]);
        } else if (data.text) {
            setContents((prev) => [...prev, { role: "assistant", content: data.text }]);
        } else if (data.error) {
            setContents((prev) => [
                ...prev,
                { role: "assistant", content: `${data.error}` },
            ]);
        }
    };

    // JSX 
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex flex-1 flex-col items-center justify-center py-6 px-4">
                {/* Content */}
                {contents.length === 0 ? (
                    <h1 className="text-2xl font-semibold mb-4 text-center text-gray-700">
                        Tôi có thể giúp gì cho bạn?
                    </h1>
                ) : (
                    <div className="w-full max-w-3xl rounded-2xl p-4 overflow-y-auto h-[60vh]">
                        {contents.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] p-3 rounded-2xl ${msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-br-none"
                                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                                        }`}
                                >
                                    {typeof msg.content === "string" ? msg.content : msg.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="w-full max-w-3xl mt-4 space-y-3">
                    <div className="flex items-start space-x-3">
                        <div className="relative flex-1">
                            <div className="absolute top-3 left-3 flex items-center justify-center w-10 h-10">
                                {preview ? (
                                    // Preview
                                    <img
                                        src={preview}
                                        alt="preview"
                                        className="w-10 h-10 rounded-md object-cover cursor-pointer hover:opacity-80 transition"
                                        title="Nhấn để xóa ảnh"
                                        onClick={() => {
                                            setPreview(null);
                                            setImage(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    />
                                ) : csvFile ? (

                                    <div
                                        className="max-w-[140px] text-xs bg-blue-400 px-2 py-1 rounded-md cursor-pointer hover:bg-gray-300 transition truncate"
                                        title="Nhấn để xóa file CSV"
                                        onClick={() => {
                                            setCsvFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        {csvFile.name}
                                    </div>
                                ) : (

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-8 h-8 flex items-center justify-center border-2 border-gray-400 text-gray-400 rounded-md hover:text-blue-600 hover:border-blue-600 transition"
                                    >
                                        +
                                    </button>
                                )}
                            </div>

                            {/* Input file */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/png, image/jpeg, text/csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Textarea */}
                            <textarea
                                className="w-full border rounded-lg p-3 h-20 resize-none focus:ring-2 focus:ring-blue-500 pl-16"
                                placeholder="Hỏi bất kỳ điều gì..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>

                        {/* Button send prompt */}
                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition h-fit"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Đang gửi..." : "Gửi"}
                        </button>
                    </div>
                </form>


            </main>
        </div>
    );
};

export default HomePage;
