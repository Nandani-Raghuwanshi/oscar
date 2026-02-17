#!/usr/bin/env python3
"""
Seed Admin Dashboard Data Script
Populates MongoDB with sample data for testing the admin dashboard

Usage:
    python3 seed_admin_data.py
"""

from pymongo import MongoClient
from datetime import datetime, timedelta
import random
import os

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
client = MongoClient(MONGO_URI)
db = client.get_database('builtcred')

# Collections
users_collection = db['users']
advocates_collection = db['advocates']
referrals_collection = db['referrals']
rewards_collection = db['rewards']
projects_collection = db['projects']

def clear_collections():
    """Clear existing data"""
    print("Clearing collections...")
    users_collection.delete_many({})
    advocates_collection.delete_many({})
    referrals_collection.delete_many({})
    rewards_collection.delete_many({})
    projects_collection.delete_many({})
    print("✓ Collections cleared")

def seed_projects():
    """Create sample projects"""
    print("\nSeeding projects...")
    
    projects = [
        {
            'name': 'Oscar Sanctuary',
            'location': 'Bangalore',
            'status': 'active',
            'accepts_referrals': True,
            'units': 150,
            'total_budget': 50000000,
            'description': 'New residential project - Oscar Sanctuary',
            'developer': 'Oscar Developers',
            'created_at': datetime.utcnow()
        },
        {
            'name': 'Oscar Fort',
            'location': 'Bangalore',
            'status': 'completed',
            'accepts_referrals': False,
            'units': 200,
            'total_budget': 75000000,
            'description': 'Completed residential project - Oscar Fort',
            'developer': 'Oscar Developers',
            'created_at': datetime.utcnow() - timedelta(days=365)
        },
        {
            'name': 'Maple Heights',
            'location': 'Pune',
            'status': 'active',
            'accepts_referrals': True,
            'units': 120,
            'total_budget': 45000000,
            'description': 'New residential project - Maple Heights',
            'developer': 'Oscar Developers',
            'created_at': datetime.utcnow() - timedelta(days=180)
        }
    ]
    
    projects_collection.insert_many(projects)
    print(f"✓ Created {len(projects)} projects")
    return projects

def seed_advocates():
    """Create sample advocates"""
    print("\nSeeding advocates...")
    
    # Project advocates (187 advocates)
    project_advocates = [
        {
            'email': f'project_advocate_{i}@example.com',
            'full_name': f'Project Advocate {i}',
            'phone': f'98765432{10 + i % 90:02d}',
            'password': 'hashed_password_here',
            'role': 'advocate',
            'advocate_type': 'PROJECT_ADVOCATE',
            'project_name': 'Oscar Sanctuary',
            'plot_number': f'{chr(65 + (i % 26))}-{100 + (i % 150):03d}',
            'status': 'approved',
            'is_active': True,
            'created_at': datetime.utcnow() - timedelta(days=random.randint(30, 180)),
            'approved_at': datetime.utcnow() - timedelta(days=random.randint(20, 170))
        }
        for i in range(187)
    ]
    
    # Brand advocates (155 advocates)
    brand_advocates = [
        {
            'email': f'brand_advocate_{i}@example.com',
            'full_name': f'Brand Advocate {i}',
            'phone': f'97765432{10 + i % 90:02d}',
            'password': 'hashed_password_here',
            'role': 'advocate',
            'advocate_type': 'BRAND_ADVOCATE',
            'project_name': 'Oscar Fort',
            'plot_number': f'{chr(65 + (i % 26))}-{1 + (i % 155):03d}',
            'status': 'approved',
            'is_active': True,
            'created_at': datetime.utcnow() - timedelta(days=random.randint(200, 365)),
            'approved_at': datetime.utcnow() - timedelta(days=random.randint(190, 355))
        }
        for i in range(155)
    ]
    
    all_advocates = project_advocates + brand_advocates
    users_collection.insert_many(all_advocates)
    print(f"✓ Created {len(project_advocates)} project advocates")
    print(f"✓ Created {len(brand_advocates)} brand advocates")
    return all_advocates

def seed_referrals(advocates):
    """Create sample referrals"""
    print("\nSeeding referrals...")
    
    project_advocates = [a for a in advocates if a['advocate_type'] == 'PROJECT_ADVOCATE']
    brand_advocates = [a for a in advocates if a['advocate_type'] == 'BRAND_ADVOCATE']
    
    statuses = ['NEW_LEAD', 'SITE_VISIT', 'IN_PROGRESS', 'CONVERTED']
    lead_names = [
        'Amit Kumar', 'Priya Shah', 'Rajesh Verma', 'Neha Gupta', 'Vikram Singh',
        'Anjali Desai', 'Arjun Nair', 'Divya Sharma', 'Rohan Patel', 'Sneha Khan'
    ]
    
    referrals = []
    
    # Project advocates referrals (89 new + 67 in progress + 45 converted = 201 total, avg 1.4 per advocate)
    for advocate in project_advocates:
        num_referrals = random.randint(0, 4)  # 0-4 referrals per advocate, allows avg of 1.4
        
        for j in range(num_referrals):
            status = random.choices(
                statuses,
                weights=[40, 30, 20, 10],  # 40% new, 30% site visit, 20% in progress, 10% converted
                k=1
            )[0]
            
            created_date = datetime.utcnow() - timedelta(days=random.randint(1, 120))
            
            referral = {
                'advocate_id': str(advocate['_id']),
                'referrer_name': advocate['full_name'],
                'advocate_type': 'PROJECT_ADVOCATE',
                'source_project': 'Oscar Sanctuary',
                'target_project': 'Oscar Sanctuary',
                'lead_name': random.choice(lead_names),
                'lead_email': f'lead_{random.randint(1000, 9999)}@example.com',
                'lead_phone': f'99{random.randint(1000000, 9999999)}',
                'budget': random.randint(2000000, 8000000),
                'status': status,
                'created_at': created_date,
                'converted_at': created_date + timedelta(days=random.randint(10, 60)) if status == 'CONVERTED' else None
            }
            referrals.append(referral)
    
    # Brand advocates referrals
    for advocate in brand_advocates:
        num_referrals = random.randint(0, 3)  # 0-3 referrals per advocate, allows avg of 1.2
        
        for j in range(num_referrals):
            status = random.choices(
                statuses,
                weights=[35, 28, 22, 15],  # Higher conversion rate for brand advocates
                k=1
            )[0]
            
            created_date = datetime.utcnow() - timedelta(days=random.randint(1, 200))
            
            referral = {
                'advocate_id': str(advocate['_id']),
                'referrer_name': advocate['full_name'],
                'advocate_type': 'BRAND_ADVOCATE',
                'source_project': 'Oscar Fort',
                'target_project': random.choice(['Oscar Sanctuary', 'Maple Heights']),
                'lead_name': random.choice(lead_names),
                'lead_email': f'lead_{random.randint(1000, 9999)}@example.com',
                'lead_phone': f'98{random.randint(1000000, 9999999)}',
                'budget': random.randint(2000000, 8000000),
                'status': status,
                'created_at': created_date,
                'converted_at': created_date + timedelta(days=random.randint(5, 50)) if status == 'CONVERTED' else None
            }
            referrals.append(referral)
    
    referrals_collection.insert_many(referrals)
    print(f"✓ Created {len(referrals)} referrals")
    
    # Statistics
    project_converted = sum(1 for r in referrals if r['advocate_type'] == 'PROJECT_ADVOCATE' and r['status'] == 'CONVERTED')
    brand_converted = sum(1 for r in referrals if r['advocate_type'] == 'BRAND_ADVOCATE' and r['status'] == 'CONVERTED')
    
    print(f"  - Project advocates conversions: {project_converted}")
    print(f"  - Brand advocates conversions: {brand_converted}")

def seed_rewards():
    """Create sample rewards"""
    print("\nSeeding rewards...")
    
    advocates = list(users_collection.find({}))
    rewards = []
    
    for advocate in advocates:
        # Get referral and conversion count for this advocate
        referral_count = referrals_collection.count_documents({'advocate_id': str(advocate['_id'])})
        conversion_count = referrals_collection.count_documents({
            'advocate_id': str(advocate['_id']),
            'status': 'CONVERTED'
        })
        
        if conversion_count > 0:
            # Reward calculation: ₹5000 per conversion
            amount = conversion_count * 5000
            
            # Some rewards paid, some pending
            status = 'PAID' if random.random() > 0.3 else 'PENDING'
            
            reward = {
                'advocate_id': str(advocate['_id']),
                'advocate_type': advocate.get('advocate_type'),
                'referral_count': referral_count,
                'conversion_count': conversion_count,
                'amount': amount,
                'status': status,
                'created_at': datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                'paid_at': datetime.utcnow() - timedelta(days=random.randint(1, 30)) if status == 'PAID' else None
            }
            rewards.append(reward)
    
    if rewards:
        rewards_collection.insert_many(rewards)
        print(f"✓ Created {len(rewards)} reward records")
        
        total_paid = sum(r['amount'] for r in rewards if r['status'] == 'PAID')
        print(f"  - Total rewards paid: ₹{total_paid:,.0f}")

def print_summary():
    """Print summary statistics"""
    print("\n" + "="*60)
    print("DATA SEEDING SUMMARY")
    print("="*60)
    
    total_users = users_collection.count_documents({})
    total_advocates = users_collection.count_documents({'role': 'advocate'})
    project_advocates = users_collection.count_documents({'advocate_type': 'PROJECT_ADVOCATE'})
    brand_advocates = users_collection.count_documents({'advocate_type': 'BRAND_ADVOCATE'})
    
    total_referrals = referrals_collection.count_documents({})
    total_referrals_project = referrals_collection.count_documents({'advocate_type': 'PROJECT_ADVOCATE'})
    total_referrals_brand = referrals_collection.count_documents({'advocate_type': 'BRAND_ADVOCATE'})
    
    converted = referrals_collection.count_documents({'status': 'CONVERTED'})
    converted_project = referrals_collection.count_documents({
        'advocate_type': 'PROJECT_ADVOCATE',
        'status': 'CONVERTED'
    })
    converted_brand = referrals_collection.count_documents({
        'advocate_type': 'BRAND_ADVOCATE',
        'status': 'CONVERTED'
    })
    
    total_rewards = rewards_collection.count_documents({})
    total_reward_amount = sum(r['amount'] for r in rewards_collection.find({}))
    
    print(f"\n👥 USERS & ADVOCATES")
    print(f"  Total Users: {total_users}")
    print(f"  Total Advocates: {total_advocates}")
    print(f"    - Project Advocates: {project_advocates}")
    print(f"    - Brand Advocates: {brand_advocates}")
    
    print(f"\n📋 REFERRALS")
    print(f"  Total Referrals: {total_referrals}")
    print(f"    - Project Advocates: {total_referrals_project}")
    print(f"    - Brand Advocates: {total_referrals_brand}")
    print(f"  Conversions: {converted}")
    print(f"    - Project: {converted_project} ({int((converted_project/max(1, total_referrals_project))*100)}%)")
    print(f"    - Brand: {converted_brand} ({int((converted_brand/max(1, total_referrals_brand))*100)}%)")
    
    print(f"\n💰 REWARDS")
    print(f"  Total Reward Records: {total_rewards}")
    print(f"  Total Reward Amount: ₹{total_reward_amount:,.0f}")
    
    print(f"\n🏗️ PROJECTS")
    print(f"  Total Projects: {projects_collection.count_documents({})}")
    
    print("\n" + "="*60)
    print("✅ DATA SEEDING COMPLETED SUCCESSFULLY!")
    print("="*60 + "\n")

def main():
    """Main seeding function"""
    try:
        print("\n🌱 Starting Admin Dashboard Data Seeding...\n")
        
        # Clear existing data
        clear_collections()
        
        # Seed projects
        projects = seed_projects()
        
        # Seed advocates
        advocates = seed_advocates()
        
        # Seed referrals
        seed_referrals(advocates)
        
        # Seed rewards
        seed_rewards()
        
        # Print summary
        print_summary()
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        raise
    finally:
        client.close()
        print("Database connection closed.\n")

if __name__ == '__main__':
    main()
