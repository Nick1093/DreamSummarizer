from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI

import instructor
from datetime import datetime, timezone

# configuring database
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("./serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# Define your desired output structure
class DreamSummaryInfo(BaseModel):
    dream_summary_title: str
    dream_summary_text: str

class DreamCreate(BaseModel):
    title: str
    summary: str


# Load environment variables
load_dotenv()

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
# Patch the OpenAI client
client = instructor.from_openai(OpenAI())

app = FastAPI()

# Configure CORS (keeping existing configuration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transcript(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "Welcome to the Dream Interpreter API!"}

@app.post("/summarize")
async def summarize_dream(transcript: Transcript):
    try:
        # Extract structured data from natural language
        summary_info = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_model=DreamSummaryInfo,
            messages=[{"role": "user", "content": transcript.text}],
        )

        return {
            "original_text": transcript.text,
            "dream_summary_title": summary_info.dream_summary_title,
            "dream_summary_text": summary_info.dream_summary_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# saving dream to database
@app.post("/save-dream")
async def create_dream(dream: DreamCreate):
    try:
        # Create a new dream document with current timestamp
        dream_data = {
            "title": dream.title,
            "summary": dream.summary,
            "created_at": datetime.now(),
        }
        
        # Add to Firestore
        doc_ref = db.collection('dreams').add(dream_data)
        
        # Get the document ID
        dream_id = doc_ref[1].id
        
        return {
            "message": "Dream saved successfully",
            "dream_id": dream_id,
            "data": dream_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save dream: {str(e)}")


@app.get("/get-dreams")
async def get_dreams():
    try:
        # Get reference to dreams collection and order by created_at in descending order
        dreams_ref = db.collection('dreams').order_by('created_at', direction=firestore.Query.DESCENDING)
        
        # Get all documents
        docs = dreams_ref.stream()
        
        # Convert to list of dictionaries
        dreams = []
        for doc in docs:
            dream_data = doc.to_dict()
            # Add the document ID to the dream data
            dream_data['id'] = doc.id
            # Convert timestamp to string for JSON serialization
            if 'created_at' in dream_data:
                dream_data['created_at'] = dream_data['created_at'].strftime("%Y-%m-%d %H:%M:%S")
            dreams.append(dream_data)
        
        return {
            "status": "success",
            "dreams": dreams,
            "count": len(dreams)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dreams: {str(e)}")