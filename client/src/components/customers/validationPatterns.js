// Validation regex patterns for customer data
export const VALIDATION_PATTERNS = {
    // E.164 format for phone (allows +country_code with 10-15 digits)
    phone: /^\+?[1-9]\d{1,14}(\s|\-|\(|\))*\d*$/,
    // Alternative: more permissive phone format
    phonePermissive: /^[\d\s\-\+\(\)]{7,}$/,
    // Standard email validation
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    // More strict email
    emailStrict: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    // Customer name (2+ characters, letters/numbers/spaces/hyphens/apostrophes)
    name: /^[a-zA-Z0-9\s\-']{2,}$/,
    // Tags (alphanumeric and underscores)
    tag: /^[a-zA-Z0-9_]+$/,
};

// Validate individual customer data
export const validateCustomerData = (customer) => {
    const errors = {};

    if (!customer.name || !VALIDATION_PATTERNS.name.test(customer.name.trim())) {
        errors.name = 'Invalid name';
    }

    if (!customer.phone || !VALIDATION_PATTERNS.phonePermissive.test(customer.phone)) {
        errors.phone = 'Invalid phone';
    }

    if (customer.email && !VALIDATION_PATTERNS.emailStrict.test(customer.email)) {
        errors.email = 'Invalid email';
    }

    return errors;
};
