# Demo chat app 

This is a lightweight chat application that supports:
- Multi-turn conversation.
- Chatting about an uploaded image.
- Chatting about data from a CSV provided either as a file upload.

## Installation

Install environment.

```bash
git clone https://github.com/xxilu/DemoChatAppII.git
cd demochatappii
```

```bash
conda create -n demochatappii python=3.11
conda activate demochatappii
```

Install library backend
```bash
cd backend
You need to create a .env file and add your OPENAI_API_KEY=sk-... to use this project!!!
pip install -r requirements.txt
```

Install library frontend
```bash
cd frontend
npm install 
npm i react-router
npm install tailwindcss @tailwindcss/vite
npm i daisyui
```

## Usage

Run backend
```bash
uvicorn main:app --reload
```

Run frontend 
```bash
npm run dev
```
Then, you can use this port: http://localhost:5173 to test on your local

Demo Video
https://www.youtube.com/watch?v=Qdgk1NzhV9g
