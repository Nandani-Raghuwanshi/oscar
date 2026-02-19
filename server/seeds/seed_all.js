const { spawnSync } = require('child_process');
const path = require('path');

function run(script) {
    console.log(`\n--- Running: ${script} ---`);
    const res = spawnSync('node', [path.join(__dirname, script)], { stdio: 'inherit', env: process.env });
    if (res.error) {
        console.error('Error running', script, res.error);
        process.exit(1);
    }
    if (res.status !== 0) {
        console.error(`${script} exited with code ${res.status}`);
        process.exit(res.status);
    }
}

async function main() {
    run('seed_roles.js');
    run('seed_admin_data.js');
    run('seed_projects.js');
    run('seed_advocates.js');
    run('seed_referrals_rewards.js');
    console.log('\nAll seeds completed successfully');
}

main();
