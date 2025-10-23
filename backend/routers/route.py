from fastapi import APIRouter, Request, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from services.gptHelper import stream_gpt_response, read_csv_file, generate_chart_from_prompt, create_gpt_messages

import base64

router = APIRouter()

@router.post("/chat")
async def chat_text(request: Request):
    """Chat with text"""
    try:
        data = await request.json()
        messages = data.get("messages", [])
    except Exception as e:
        return {"error": f"Error read JSON: {str(e)}"}

    if not any(msg["role"] == "system" for msg in messages):
        messages.insert(0, {
            "role": "system",
            "content": "Bạn là một trợ lý AI thân thiện, trả lời ngắn gọn bằng tiếng Việt.",
        })

    return StreamingResponse(stream_gpt_response(messages), media_type="text/plain")

@router.post("/chat/image")
async def chat_with_image(prompt: str = Form(...), file: UploadFile = File(...)):
    """Chat with photos"""
    try:
        img_bytes = await file.read()
        base64_image = base64.b64encode(img_bytes).decode("utf-8")
        image_url = f"data:image/{file.filename.split('.')[-1]};base64,{base64_image}"

        messages = [
            {"role": "system", "content": "Bạn là một trợ lý AI biết phân tích ảnh và mô tả nội dung bằng tiếng Việt."},
            {
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt or "Mô tả nội dung bức ảnh này."},
                    {"type": "input_image", "image_url": image_url},
                ],
            },
        ]
        return StreamingResponse(stream_gpt_response(messages), media_type="text/plain")

    except Exception as e:
        return {"error": f"Error process image: {str(e)}"}
    
@router.post("/chat/csv")
async def chat_with_csv(prompt: str = Form(...), file: UploadFile = File(None)):
    """Receive CSV (file or URL), analyze and chat with the data"""
    try:
        df = await read_csv_file(file)

        # Vẽ biểu đồ
        if any(kw in prompt.lower() for kw in ["vẽ", "plot", "biểu đồ", "chart", "histogram", "scatter", "bar"]):
            return generate_chart_from_prompt(df, prompt)

        # Trả lời bình thường
        messages = create_gpt_messages(prompt, df)
        return StreamingResponse(stream_gpt_response(messages), media_type="text/plain")

    except Exception as e:
        return JSONResponse({"error": f"Error read CSV: {str(e)}"})


    

