#!/usr/bin/env python3
"""
Seed script for RBAC system - Creates test users with different roles and statuses.

Usage: python3 seed_roles.py

Creates the following test accounts:
- Regular User (auto-approved)
- Project Advocate (pending approval)
- Brand Advocate (pending approval)  
- Admin (approved)
- Rejected User (rejected status)
"""

import os
import sys
from datetime import datetime
from pymongo import MongoClient
from werkzeug.security import generate_password_hash

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "builtcred"
COLLECTION_NAME = "users"

# Test users to create
TEST_USERS = [
    {
        "email": "user@test.com",
        "full_name": "Regular User",
        "password": "UserPass123",
        "role": "user",
        "status": "approved",
        "advocate_type": None,
        "is_active": True,
    },
    {
        "email": "advocate.project@test.com",
        "full_name": "John Project Advocate",
        "password": "AdvocatePass123",
        "role": "advocate",
        "status": "pending",
        "advocate_type": "project_advocate",
        "is_active": True,
    },
    {
        "email": "advocate.brand@test.com",
        "full_name": "Jane Brand Advocate",
        "password": "AdvocatePass123",
        "role": "advocate",
        "status": "pending",
        "advocate_type": "brand_advocate",
        "is_active": True,
    },
    {
        "email": "advocate.brand2@test.com",
        "full_name": "Bob Brand Advocate",
        "password": "AdvocatePass123",
        "role": "advocate",
        "status": "pending",
        "advocate_type": "brand_advocate",
        "is_active": True,
    },
    {
        "email": "rejected@test.com",
        "full_name": "Rejected User",
        "password": "RejectedPass123",
        "role": "advocate",
        "status": "rejected",
        "advocate_type": "project_advocate",
        "is_active": True,
        "rejection_reason": "Application does not meet our standards",
    },
    {
        "email": "admin@test.com",
        "full_name": "Administrator",
        "password": "AdminPass123",
        "role": "admin",
        "status": "approved",
        "advocate_type": None,
        "is_active": True,
    },
]


def hash_password(password):
    """Hash password using Werkzeug security."""
    return generate_password_hash(password)


def seed_database():
    """Seed the database with test users."""
    try:
        # Connect to MongoDB
        print(f"Connecting to MongoDB at {MONGO_URI}...")
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        print(f"Connected to database '{DB_NAME}', collection '{COLLECTION_NAME}'")
        
        # Check if users already exist
        existing_emails = {user["email"] for user in collection.find({}, {"email": 1})}
        
        created_count = 0
        skipped_count = 0
        
        for user_data in TEST_USERS:
            email = user_data["email"]
            
            if email in existing_emails:
                print(f"⏭️  Skipped: {email} (already exists)")
                skipped_count += 1
                continue
            
            # Hash the password
            password = user_data.pop("password")
            user_data["password"] = hash_password(password)
            
            # Add timestamps
            now = datetime.utcnow()
            user_data["created_at"] = now
            user_data["updated_at"] = now
            
            # Add approval tracking fields if needed
            if user_data.get("status") == "approved" and user_data.get("role") == "admin":
                user_data["approved_at"] = now
                user_data["approved_by"] = None  # System-approved
            elif user_data.get("status") == "rejected":
                user_data["rejected_at"] = now
                user_data["rejected_by"] = None  # System-rejected
            
            # Insert user
            result = collection.insert_one(user_data)
            print(f"✅ Created: {email}")
            print(f"   - Role: {user_data['role']}")
            print(f"   - Status: {user_data['status']}")
            if user_data.get("advocate_type"):
                print(f"   - Advocate Type: {user_data['advocate_type']}")
            created_count += 1
        
        # Print summary
        print("\n" + "="*60)
        print("SEED SUMMARY")
        print("="*60)
        print(f"✅ Created: {created_count} new users")
        print(f"⏭️  Skipped: {skipped_count} existing users")
        
        # Print test account info
        print("\n" + "="*60)
        print("TEST ACCOUNTS CREATED")
        print("="*60)
        
        print("\n🔑 Regular User (Approved - Full Access)")
        print("   Email: user@test.com")
        print("   Password: UserPass123")
        print("   Role: user")
        print("   Status: approved ✅")
        
        print("\n🔑 Project Advocate (Pending - Needs Admin Approval)")
        print("   Email: advocate.project@test.com")
        print("   Password: AdvocatePass123")
        print("   Role: advocate")
        print("   Advocate Type: project_advocate")
        print("   Status: pending ⏳")
        
        print("\n🔑 Brand Advocate (Pending - Needs Admin Approval)")
        print("   Email: advocate.brand@test.com")
        print("   Password: AdvocatePass123")
        print("   Role: advocate")
        print("   Advocate Type: brand_advocate")
        print("   Status: pending ⏳")
        
        print("\n🔑 Brand Advocate #2 (Pending - Needs Admin Approval)")
        print("   Email: advocate.brand2@test.com")
        print("   Password: AdvocatePass123")
        print("   Role: advocate")
        print("   Advocate Type: brand_advocate")
        print("   Status: pending ⏳")
        
        print("\n🔑 Rejected User (No Access)")
        print("   Email: rejected@test.com")
        print("   Password: RejectedPass123")
        print("   Role: advocate")
        print("   Status: rejected ❌")
        print("   Reason: Application does not meet our standards")
        
        print("\n🔑 Administrator (Full Access)")
        print("   Email: admin@test.com")
        print("   Password: AdminPass123")
        print("   Role: admin")
        print("   Status: approved ✅")
        
        print("\n" + "="*60)
        print("NEXT STEPS")
        print("="*60)
        print("1. Start the frontend: npm run dev")
        print("2. Start the backend: python server/app.py")
        print("3. Test with different user roles:")
        print("   - Login as 'user@test.com' for immediate access")
        print("   - Login as 'advocate.project@test.com' for pending status")
        print("   - Login as 'admin@test.com' to access /admin panel")
        print("4. Approve advocates in admin panel at /admin")
        print("\nFor testing guide, see: RBAC_QUICK_TEST.md")
        print("="*60)
        
        client.close()
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print(f"\nTroubleshooting:")
        print("- Ensure MongoDB is running (default: mongodb://localhost:27017/)")
        print("- Check MONGO_URI environment variable if using custom connection")
        print("- Install required packages: pip install pymongo werkzeug")
        return False


if __name__ == "__main__":
    print("="*60)
    print("RBAC User Seeding Script")
    print("="*60)
    print()
    
    success = seed_database()
    sys.exit(0 if success else 1)
