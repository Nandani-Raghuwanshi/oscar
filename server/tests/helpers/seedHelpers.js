import User from '../../src/models/User.js';
import Project from '../../src/models/Project.js';
import Customer from '../../src/models/Customer.js';
import Referral from '../../src/models/Referral.js';
import Lead from '../../src/models/Lead.js';
import Reward from '../../src/models/Reward.js';
import BrandReferral from '../../src/models/BrandReferral.js';
import BrandReward from '../../src/models/BrandReward.js';
import NotificationTemplate from '../../src/models/NotificationTemplate.js';
import Notification from '../../src/models/Notification.js';
import { TEST_USERS, hashPassword, TEST_PROJECTS, TEST_CUSTOMERS } from './testData.js';

/**
 * Seed all test users
 */
export const seedUsers = async () => {
    const users = {};

    for (const [key, userData] of Object.entries(TEST_USERS)) {
        const hashedPassword = await hashPassword(userData.password);
        const user = await User.create({
            ...userData,
            password: hashedPassword,
            isActive: true,
        });
        users[key] = user;
    }

    return users;
};

/**
 * Seed test projects with builder assignments
 */
export const seedProjects = async (builderId) => {
    const projects = [];

    for (const projectData of TEST_PROJECTS) {
        const project = await Project.create({
            ...projectData,
            builder: builderId,
        });
        projects.push(project);
    }

    return projects;
};

/**
 * Seed test customers
 */
export const seedCustomers = async (projectId, builderId) => {
    const customers = [];

    for (const customerData of TEST_CUSTOMERS) {
        const customer = await Customer.create({
            ...customerData,
            project: projectId,
            builder: builderId,
        });
        customers.push(customer);
    }

    return customers;
};

/**
 * Seed test referrals
 */
export const seedReferrals = async (advocateId, projectId) => {
    const referrals = [];

    const referralData = [
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

    for (const data of referralData) {
        const referral = await Referral.create({
            ...data,
            advocate: advocateId,
            project: projectId,
        });
        referrals.push(referral);
    }

    return referrals;
};

/**
 * Seed test leads
 */
export const seedLeads = async (referralId, assignedToId, projectId) => {
    const lead = await Lead.create({
        referral: referralId,
        assignedTo: assignedToId,
        project: projectId,
        status: 'new',
        priority: 'medium',
        contactHistory: [],
    });

    return lead;
};

/**
 * Seed test rewards
 */
export const seedRewards = async (advocateId, referralId, projectId) => {
    const reward = await Reward.create({
        advocate: advocateId,
        referral: referralId,
        project: projectId,
        amount: 500,
        type: 'referral_bonus',
        status: 'pending',
    });

    return reward;
};

/**
 * Seed test brand referrals
 */
export const seedBrandReferrals = async (advocateId, sourceProjectId, targetProjectId) => {
    const brandReferral = await BrandReferral.create({
        advocate: advocateId,
        sourceProject: sourceProjectId,
        targetProject: targetProjectId,
        referredName: 'Brand Referred Person',
        referredPhone: '5550009999',
        referredEmail: 'brandreferred@test.com',
        status: 'pending',
        notes: 'Test brand referral',
    });

    return brandReferral;
};

/**
 * Seed test brand rewards
 */
export const seedBrandRewards = async (advocateId, brandReferralId, targetProjectId) => {
    const brandReward = await BrandReward.create({
        advocate: advocateId,
        brandReferral: brandReferralId,
        targetProject: targetProjectId,
        amount: 1000,
        type: 'brand_referral',
        status: 'pending',
    });

    return brandReward;
};

/**
 * Seed notification templates
 */
export const seedNotificationTemplates = async () => {
    const template = await NotificationTemplate.create({
        name: 'Test Template',
        subject: 'Test Subject {{userName}}',
        body: 'Test body with {{userName}}',
        type: 'email',
        category: 'general',
        isActive: true,
    });

    return template;
};

/**
 * Complete seed - creates all test data
 */
export const seedComplete = async () => {
    const users = await seedUsers();
    const projects = await seedProjects(users.builder._id);
    const customers = await seedCustomers(projects[0]._id, users.builder._id);

    // Link project advocate to project
    users.projectAdvocate.project = projects[0]._id;
    await users.projectAdvocate.save();

    // Link brand advocate to projects
    users.brandAdvocate.sourceProject = projects[0]._id;
    users.brandAdvocate.targetProject = projects[1]._id;
    await users.brandAdvocate.save();

    // Link sales associate to project
    users.salesAssociate.project = projects[0]._id;
    await users.salesAssociate.save();

    const referrals = await seedReferrals(users.projectAdvocate._id, projects[0]._id);
    const lead = await seedLeads(referrals[0]._id, users.salesAssociate._id, projects[0]._id);
    const reward = await seedRewards(users.projectAdvocate._id, referrals[0]._id, projects[0]._id);

    const brandReferral = await seedBrandReferrals(
        users.brandAdvocate._id,
        projects[0]._id,
        projects[1]._id
    );
    const brandReward = await seedBrandRewards(
        users.brandAdvocate._id,
        brandReferral._id,
        projects[1]._id
    );

    const template = await seedNotificationTemplates();

    return {
        users,
        projects,
        customers,
        referrals,
        lead,
        reward,
        brandReferral,
        brandReward,
        template,
    };
};
