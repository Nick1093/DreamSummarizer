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
from firebase_admin import credentials, firestore, initialize_app

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://dream-summarizer.vercel.app",
    "https://dream-summarizer-backend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Firebase using environment variables
firebase_credentials = {
    "type": "service_account",  # This is usually always "service_account"
    "project_id": os.getenv("PROJECT_ID"),
    "private_key_id": os.getenv("PRIVATE_KEY_ID"),
    "private_key": os.getenv('PRIVATE_KEY'),
    "client_email": os.getenv("CLIENT_EMAIL"),
    "client_id": os.getenv("CLIENT_ID"),
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",  # These are standard URLs
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": os.getenv("CLIENT_X509_CERT_URL"),
    "universe_domain": "googleapis.com"  # This is usually standard
}

# Initialize Firebase using the dictionary directly
cred = credentials.Certificate(firebase_credentials)
initialize_app(cred)
db = firestore.client()

# Define your desired output structure
class DreamSummaryInfo(BaseModel):
    dream_summary_title: str
    dream_summary_text: str

class DreamCreate(BaseModel):
    title: str
    summary: str

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")
# Patch the OpenAI client
client = instructor.from_openai(OpenAI())

class Transcript(BaseModel):
    text: str

@app.get("/")
async def root():
    return {"message": "Welcome to the Dream Interpreter API!"}

@app.get("/test-firebase")
async def test_firebase():
    try:
        # Try a simple query
        docs = db.collection('dreams').limit(1).stream()
        return {"status": "Firebase connection successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase connection failed: {str(e)}")


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


# if __name__ == '__main__':
#     uvicorn.run(app)