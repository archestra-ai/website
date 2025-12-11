const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_URL = 'https://github.com/archestra-ai/archestra.git';
const TEMP_DIR = '.platform-docs-temp';
const TARGET_DIR = '.platform-docs';

function pullDocs(forceRemote = false) {
  console.log('🔄 Checking if platform docs need to be pulled...');

  // In development, check if local docs exist (unless forcing remote)
  const localDocsPath = path.join(__dirname, '../../../archestra/docs');
  if (!forceRemote && process.env.NODE_ENV !== 'production' && fs.existsSync(localDocsPath)) {
    console.log('✅ Using local archestra docs from:', localDocsPath);

    // Also copy openapi.json to public directory for SwaggerUI in local dev
    const localOpenapiJson = path.join(localDocsPath, 'openapi.json');
    if (fs.existsSync(localOpenapiJson)) {
      const publicDocsDir = path.join(__dirname, '..', 'public', 'docs');
      if (!fs.existsSync(publicDocsDir)) {
        fs.mkdirSync(publicDocsDir, { recursive: true });
      }
      fs.copyFileSync(localOpenapiJson, path.join(publicDocsDir, 'openapi.json'));
      console.log('   📋 Copied openapi.json to public/docs/');
    }
    return;
  }

  // Check if we already have pulled docs
  const targetPath = path.join(__dirname, '..', TARGET_DIR);
  if (fs.existsSync(targetPath)) {
    console.log('✅ Platform docs already exist in:', TARGET_DIR);
    return;
  }

  console.log('📦 Pulling platform documentation from GitHub...');

  const tempPath = path.join(__dirname, '..', TEMP_DIR);

  try {
    // Clean up any existing temp directory
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }

    // Clone only the docs folder using sparse checkout (more efficient)
    console.log('🔗 Cloning archestra repository (docs only)...');
    execSync(`git clone --depth 1 --filter=blob:none --sparse ${REPO_URL} ${TEMP_DIR}`, {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });

    // Set up sparse checkout for the docs folder and all its contents
    execSync('git sparse-checkout set docs', {
      cwd: tempPath,
      stdio: 'inherit',
    });

    // Pull the files
    execSync('git checkout', {
      cwd: tempPath,
      stdio: 'inherit',
    });

    // Move docs folder to target location
    const docsSource = path.join(tempPath, 'docs');
    if (fs.existsSync(docsSource)) {
      // Clean up any existing target directory
      if (fs.existsSync(targetPath)) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      }

      // Move the entire docs folder to target location
      fs.renameSync(docsSource, targetPath);

      console.log('✅ Platform docs successfully pulled to:', TARGET_DIR);

      // List what was pulled for verification
      const pages = path.join(targetPath, 'pages');
      const assets = path.join(targetPath, 'assets');
      const openapiJson = path.join(targetPath, 'openapi.json');
      if (fs.existsSync(pages)) {
        const pageCount = fs.readdirSync(pages).filter((f) => f.endsWith('.md')).length;
        console.log(`   📄 Found ${pageCount} documentation pages`);
      }
      if (fs.existsSync(assets)) {
        console.log(`   🖼️  Found assets directory`);
      }

      // Copy openapi.json to public directory for SwaggerUI
      if (fs.existsSync(openapiJson)) {
        const publicDocsDir = path.join(__dirname, '..', 'public', 'docs');
        if (!fs.existsSync(publicDocsDir)) {
          fs.mkdirSync(publicDocsDir, { recursive: true });
        }
        fs.copyFileSync(openapiJson, path.join(publicDocsDir, 'openapi.json'));
        console.log(`   📋 Copied openapi.json to public/docs/`);
      }
    } else {
      throw new Error('Docs folder not found in cloned repository');
    }
  } catch (error) {
    console.error('❌ Failed to pull platform docs:', error.message);
    console.error('   Documentation may not be available in production.');
    // Don't fail the build, just warn
  } finally {
    // Clean up temp directory
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true, force: true });
    }
  }
}

// Run if this script is executed directly
if (require.main === module) {
  // Check for --force flag
  const forceRemote = process.argv.includes('--force');
  pullDocs(forceRemote);
}

module.exports = { pullDocs };
