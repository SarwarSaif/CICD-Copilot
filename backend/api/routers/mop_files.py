from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import MopFile
from ..schemas import MopFile as MopFileSchema, MopFileCreate

router = APIRouter()

@router.get("/mop-files", response_model=List[MopFileSchema])
def get_all_mop_files(db: Session = Depends(get_db)):
    return db.query(MopFile).all()

@router.get("/mop-files/recent", response_model=List[MopFileSchema])
def get_recent_mop_files(limit: int = 5, db: Session = Depends(get_db)):
    return db.query(MopFile).order_by(MopFile.created_at.desc()).limit(limit).all()

@router.get("/mop-files/{mop_file_id}", response_model=MopFileSchema)
def get_mop_file(mop_file_id: int, db: Session = Depends(get_db)):
    mop_file = db.query(MopFile).filter(MopFile.id == mop_file_id).first()
    if not mop_file:
        raise HTTPException(status_code=404, detail="MOP file not found")
    return mop_file

@router.post("/mop-files/upload", response_model=MopFileSchema)
async def upload_mop_file(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Read file content
    content = await file.read()
    
    # Decode binary content to string
    content_str = content.decode("utf-8")
    
    # Create MOP file record
    mop_file_data = MopFileCreate(
        name=name if name else file.filename.split(".")[0],
        description=description,
        content=content_str,
        user_id=1  # Mock user ID for development
    )
    
    # Create MOP file in database
    mop_file = MopFile(
        name=mop_file_data.name,
        description=mop_file_data.description,
        content=mop_file_data.content,
        user_id=mop_file_data.user_id
    )
    
    db.add(mop_file)
    db.commit()
    db.refresh(mop_file)
    
    return mop_file