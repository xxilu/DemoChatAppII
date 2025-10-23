from fastapi import UploadFile
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from dotenv import load_dotenv
import os, base64, io, pandas as pd
from openai import OpenAI

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# =========================================================
# =============== HELPER FUNCTIONS ========================
# =========================================================

# Streaming GPT 
def stream_gpt_response(messages: list):
    """Response stream from GPT"""
    stream = client.responses.create(
        model="gpt-4.1-nano",
        input=messages,
        max_output_tokens=512,
        stream=True,
    )
    for event in stream:
        if event.type == "response.output_text.delta":
            yield event.delta
        elif event.type == "response.completed":
            break

# Read file CSV
async def read_csv_file(file: UploadFile = None, ):
    """Read CSV data from file"""
    if file:
        contents = await file.read()
        return pd.read_csv(io.BytesIO(contents))
    else:
        raise ValueError("No CSV file uploaded")


# Create a chart
def generate_chart_from_prompt(df: pd.DataFrame, prompt: str) -> dict:
    """Analyze prompts and create corresponding charts"""
    lower_prompt = prompt.lower()
    num_cols = df.select_dtypes(include="number").columns.tolist()
    if not num_cols:
        return {"error": "No columns of numbers were found to plot the chart"}

    plt.figure(figsize=(6, 4))
    chart_title = ""
    mentioned_col = next((c for c in df.columns if c.lower() in lower_prompt), None)
    col = mentioned_col if mentioned_col else num_cols[0]

    # Chart type
    if "hist" in lower_prompt or "phân phối" in lower_prompt:
        df[col].hist(bins=20, color="skyblue", edgecolor="black")
        chart_title = f"Histogram của cột {col}"
    elif "scatter" in lower_prompt or "phân tán" in lower_prompt:
        if len(num_cols) >= 2:
            plt.scatter(df[num_cols[0]], df[num_cols[1]], alpha=0.6)
            chart_title = f"Biểu đồ scatter: {num_cols[0]} vs {num_cols[1]}"
        else:
            df[col].plot(kind="line")
            chart_title = f"Biểu đồ line của {col}"
    elif "bar" in lower_prompt or "cột" in lower_prompt:
        df[col].head(10).plot(kind="bar", color="orange")
        chart_title = f"Biểu đồ cột của {col}"
    else:
        df[col].plot(kind="line")
        chart_title = f"Biểu đồ line của {col}"

    # Plot and base64 encode
    plt.title(chart_title)
    plt.xlabel(col)
    plt.ylabel("Giá trị")
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return {"text": f"Đây là {chart_title}.", "image": img_base64}


# Create GPT context
def create_gpt_messages(prompt: str, df: pd.DataFrame) -> list:
    """Create prompt to send GPT"""
    context = f"""
    Đây là DataFrame {df}.
    {prompt}
    Hãy trả lời ngắn gọn, tiếng Việt.
    """
    return [
        {"role": "system", "content": "Bạn là một trợ lý dữ liệu giúp phân tích file CSV."},
        {"role": "user", "content": context},
    ]
