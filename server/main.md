example records for each schema

# advocates
{
  "_id": {
    "$oid": "6995517269ccdd5f0bd96439"
  },
  "user_id": "6993fff3ed6b93d3a0059afe",
  "name": "Project Advocate 1",
  "email": "project_advocate_1@example.com",
  "phone": "9876543211",
  "type": "PROJECT_ADVOCATE",
  "source_project_id": null,
  "status": "ACTIVE",
  "created_at": {
    "$date": "2026-02-18T05:43:14.805Z"
  },
  "updated_at": {
    "$date": "2026-02-18T05:43:14.805Z"
  },
  "referral_count": 0,
  "conversion_count": 0,
  "total_earnings": 0,
  "metadata": {}
}

# projects
{
  "_id": {
    "$oid": "6993fff3ed6b93d3a0059afa"
  },
  "name": "Oscar Sanctuary",
  "location": "Bangalore",
  "status": "active",
  "accepts_referrals": true,
  "units": 150,
  "total_budget": 50000000,
  "description": "New residential project - Oscar Sanctuary",
  "developer": "Oscar Developers",
  "created_at": {
    "$date": "2026-02-17T05:43:15.284Z"
  }
}

# referrals
{
  "_id": {
    "$oid": "6993fff3ed6b93d3a0059c53"
  },
  "advocate_id": "6993fff3ed6b93d3a0059afd",
  "referrer_name": "Project Advocate 0",
  "advocate_type": "PROJECT_ADVOCATE",
  "source_project": "Oscar Sanctuary",
  "target_project": "Oscar Sanctuary",
  "lead_name": "Amit Kumar",
  "lead_email": "lead_2047@example.com",
  "lead_phone": "997858790",
  "budget": 7992479,
  "status": "NEW_LEAD",
  "created_at": {
    "$date": "2026-01-28T05:43:15.312Z"
  },
  "converted_at": null
}

# rewards
{
  "_id": {
    "$oid": "6993fff3ed6b93d3a0059eaf"
  },
  "advocate_id": "6993fff3ed6b93d3a0059b02",
  "advocate_type": "PROJECT_ADVOCATE",
  "referral_count": 3,
  "conversion_count": 2,
  "amount": 10000,
  "status": "PAID",
  "created_at": {
    "$date": "2026-01-12T05:43:15.361Z"
  },
  "paid_at": {
    "$date": "2026-02-09T05:43:15.361Z"
  }
}

# users
{
  "_id": {
    "$oid": "6993fff3ed6b93d3a0059afd"
  },
  "email": "project_advocate_0@example.com",
  "full_name": "Project Advocate 0",
  "phone": "9876543210",
  "password": "pbkdf2:sha256:600000$mZgseuuFBxZggKIC$d9e031080bc1dd5f10a0caafe520f795ca90a77707e4408f5810567778b31b6d",
  "role": "advocate",
  "advocate_type": "PROJECT_ADVOCATE",
  "project_name": "Oscar Sanctuary",
  "plot_number": "A-100",
  "status": "approved",
  "is_active": true,
  "created_at": {
    "$date": "2025-08-25T05:43:15.303Z"
  },
  "approved_at": {
    "$date": "2026-01-22T05:43:15.303Z"
  }
}

# objective
this is the current schema, i want to optimize it,

1) remove advocates collection
2) maintain the same functionality with the users collection
3) update all backend and frontend to maintain the same context eliminate advocate collection