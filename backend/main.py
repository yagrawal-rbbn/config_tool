import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import Diagram
from rules import generate_config

# To run this backend, use the command from the root directory:
# python -m uvicorn backend.main:app --reload --port 8080

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Allows requests from the frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.post("/api/generate-config")
async def generate_config_api(diagram: Diagram):
    config = generate_config(diagram)
    return {"config": config}