// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    BUILDER: 'builder',
    CRM_MANAGER: 'crm_manager',
    SALES_ASSOCIATE: 'sales_associate',
    PROJECT_ADVOCATE: 'project_advocate',
    BRAND_ADVOCATE: 'brand_advocate'
};

// Role Permissions Map
export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
        'create_user',
        'edit_user',
        'delete_user',
        'create_project',
        'edit_project',
        'delete_project',
        'view_all_users',
        'view_all_escalations',
        'send_bulk_messages',
        'view_audit_trail',
        'generate_reports'
    ],
    [USER_ROLES.BUILDER]: [
        'upload_customers',
        'send_invites',
        'view_reports',
        'view_escalations'
    ],
    [USER_ROLES.CRM_MANAGER]: [
        'manage_advocates',
        'assign_referrals',
        'track_pipeline',
        'escalate_leads',
        'view_payments'
    ],
    [USER_ROLES.SALES_ASSOCIATE]: [
        'initiate_calls',
        'engage_customers',
        'mark_status',
        'mark_payment'
    ],
    [USER_ROLES.PROJECT_ADVOCATE]: [
        'view_project_docs',
        'send_referrals',
        'view_conversions',
        'view_rewards'
    ],
    [USER_ROLES.BRAND_ADVOCATE]: [
        'view_brand_docs',
        'send_referrals',
        'view_conversions',
        'view_rewards'
    ]
};

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
};
