const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

/**
 * Migration runner - executes all or specific migrations
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const args = process.argv.slice(2);
  const onlyMigration = args.find(arg => arg.startsWith('--only='))?.split('=')[1];
  
  try {
    // Get all migration files
    const files = await fs.readdir(migrationsDir);
    const migrations = files
      .filter(file => file.endsWith('.js') && !file.includes('README'))
      .sort();
    
    console.log('🚀 Pokemon TCG Catalog - Migration Runner\n');
    
    if (migrations.length === 0) {
      console.log('No migrations found.');
      return;
    }
    
    // Filter migrations if --only specified
    const migrationsToRun = onlyMigration
      ? migrations.filter(m => m.includes(onlyMigration))
      : migrations;
    
    if (migrationsToRun.length === 0) {
      console.log(`No migrations found matching: ${onlyMigration}`);
      return;
    }
    
    console.log(`Found ${migrationsToRun.length} migration(s) to run:`);
    migrationsToRun.forEach(m => console.log(`  - ${m}`));
    console.log('');
    
    // Run each migration
    for (const migration of migrationsToRun) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`Running: ${migration}`);
      console.log(${'='.repeat(50)}\n`);
      
      await runMigration(path.join(migrationsDir, migration));
    }
    
    console.log('\n✅ All migrations completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Migration runner failed:', error);
    process.exit(1);
  }
}

function runMigration(migrationPath) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [migrationPath], {
      stdio: 'inherit',
      env: process.env
    });
    
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Migration failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// Run migrations
runMigrations();