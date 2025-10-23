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
[![Watch the video]([[https://img.youtube.com/vi/_5tFXJQIzi4/0.jpg](https://i9.ytimg.com/vi_webp/Qdgk1NzhV9g/mqdefault.webp?v=68fa5866&sqp=CIiw6ccG&rs=AOn4CLAqmGXS3w-pOT-O_7rVYHa1lEIGaQ](https://media.istockphoto.com/id/472909414/vi/anh/d%E1%BA%A5u-hi%E1%BB%87u-demo-th%E1%BA%BB-%C4%91%E1%BA%A7y-m%C3%A0u-s%E1%BA%AFc.jpg?s=2048x2048&w=is&k=20&c=ItmGs80RWKp1zUdTe9iS2x3QXjSjzSUm4sEaEnidsHQ=)))]([https://www.youtube.com/watch?v=_5tFXJQIzi4](https://www.youtube.com/watch?v=Qdgk1NzhV9g))
