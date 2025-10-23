const API_BASE = "http://127.0.0.1:8000";

export const sendImageChat = (prompt, image) => {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("file", image);
    return fetch(`${API_BASE}/chat/image`, { method: "POST", body: formData });
};

export const sendCsvChat = (prompt, csvFile) => {
    const formData = new FormData();
    formData.append("prompt", prompt);
    if (csvFile) formData.append("file", csvFile);
    return fetch(`${API_BASE}/chat/csv`, { method: "POST", body: formData });
};

export const sendTextChat = (prompt, contents) => {
    const safeMessages = contents.map((msg) => ({
        role: msg.role,
        content: typeof msg.content === "string" ? msg.content : "[image]",
    }));
    const payload = { messages: [...safeMessages, { role: "user", content: prompt }] };
    return fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
};

