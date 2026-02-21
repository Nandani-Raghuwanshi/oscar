import bcrypt from 'bcryptjs';

// Test user credentials for each role
export const TEST_USERS = {
    admin: {
        email: 'admin@test.com',
        password: 'Admin123!',
        phone: '1234567890',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
    },
    builder: {
        email: 'builder@test.com',
        password: 'Builder123!',
        phone: '1234567891',
        firstName: 'Builder',
        lastName: 'User',
        role: 'builder',
    },
    crmManager: {
        email: 'crm-manager@test.com',
        password: 'CRM123!',
        phone: '1234567892',
        firstName: 'CRM',
        lastName: 'Manager',
        role: 'crm_manager',
    },
    salesAssociate: {
        email: 'sales@test.com',
        password: 'Sales123!',
        phone: '1234567893',
        firstName: 'Sales',
        lastName: 'Associate',
        role: 'sales_associate',
    },
    projectAdvocate: {
        email: 'project-advocate@test.com',
        password: 'PA123!',
        phone: '1234567894',
        firstName: 'Project',
        lastName: 'Advocate',
        role: 'project_advocate',
    },
    brandAdvocate: {
        email: 'brand-advocate@test.com',
        password: 'BA123!',
        phone: '1234567895',
        firstName: 'Brand',
        lastName: 'Advocate',
        role: 'brand_advocate',
    },
};

// Hash password helper
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Test projects
export const TEST_PROJECTS = [
    {
        name: 'Project Alpha',
        location: 'Test Location A',
        status: 'active',
        description: 'Test project alpha description',
    },
    {
        name: 'Project Beta',
        location: 'Test Location B',
        status: 'active',
        description: 'Test project beta description',
    },
];

// Test customers
export const TEST_CUSTOMERS = [
    {
        name: 'Customer One',
        email: 'customer1@test.com',
        phone: '5551234567',
        address: '123 Test St',
        status: 'active',
    },
    {
        name: 'Customer Two',
        email: 'customer2@test.com',
        phone: '5551234568',
        address: '456 Test Ave',
        status: 'active',
    },
];

// CSV content for customer upload testing
export const CUSTOMER_CSV_VALID = `name,email,phone,address,createAdvocateAccount
Test Customer 1,csvtest1@test.com,5559876543,789 CSV St,true
Test Customer 2,csvtest2@test.com,5559876544,012 CSV Ave,false`;

export const CUSTOMER_CSV_INVALID_HEADERS = `fullname,emailaddress,phonenumber
Invalid,invalid@test.com,5550001111`;

export const CUSTOMER_CSV_MISSING_FIELDS = `name,email,phone,address
Missing Phone,,5550002222,No Email St`;

// Test referrals
export const TEST_REFERRALS = [
    {
        referredName: 'Referred Person 1',
        referredPhone: '5550001234',
        referredEmail: 'referred1@test.com',
        status: 'pending',
        notes: 'Test referral 1',
    },
    {
        referredName: 'Referred Person 2',
        referredPhone: '5550001235',
        referredEmail: 'referred2@test.com',
        status: 'qualified',
        notes: 'Test referral 2',
    },
];

// Test notification template
export const TEST_NOTIFICATION_TEMPLATE = {
    name: 'Test Template',
    subject: 'Test Subject {{userName}}',
    body: 'Test body with {{userName}} and {{projectName}}',
    type: 'email',
    category: 'general',
    isActive: true,
};

// Helper to generate long note (>= 50 words)
export const generateLongNote = () => {
    return 'This is a test note that contains more than fifty words to satisfy the validation requirement for lead status updates. ' +
        'It includes detailed information about the customer interaction, their needs, preferences, and next steps. ' +
        'The note also covers timeline expectations and any concerns raised during the conversation.';
};
