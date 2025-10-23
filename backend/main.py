from fastapi.middleware.cors import CORSMiddleware

from routers.route import router
# from routers.uploads import router

from fastapi import FastAPI

app = FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


