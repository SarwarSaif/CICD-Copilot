from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import TeamMember, User
from ..schemas import TeamMember as TeamMemberSchema, TeamMemberCreate

router = APIRouter()

@router.get("/team", response_model=List[TeamMemberSchema])
def get_team_members(db: Session = Depends(get_db)):
    return db.query(TeamMember).all()

@router.get("/team/{team_member_id}", response_model=TeamMemberSchema)
def get_team_member(team_member_id: int, db: Session = Depends(get_db)):
    team_member = db.query(TeamMember).filter(TeamMember.id == team_member_id).first()
    if not team_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return team_member

@router.post("/team", response_model=TeamMemberSchema)
def create_team_member(team_member: TeamMemberCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == team_member.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create team member
    db_team_member = TeamMember(
        name=team_member.name,
        email=team_member.email,
        role=team_member.role,
        user_id=team_member.user_id
    )
    
    db.add(db_team_member)
    db.commit()
    db.refresh(db_team_member)
    
    return db_team_member