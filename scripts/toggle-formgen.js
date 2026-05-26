const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packageJsonPath = path.resolve(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const args = process.argv.slice(2);
const mode = args[0];

const LOCAL_PATH = 'file:../tduck-front-full/src/formgen';
// 尝试从 package.json 的原来版本恢复，如果不方便获取，可以固定为 "1.9.5"
const PROD_VERSION = '1.9.5'; 

if (!['dev', 'prod'].includes(mode)) {
  console.error('❌ 请提供正确的模式参数: dev (调试模式) 或 prod (正式模式)');
  console.log('用法示例: node toggle-formgen.js dev');
  process.exit(1);
}

let modified = false;

if (mode === 'dev') {
  if (pkg.dependencies['tduck-form-generator'] !== LOCAL_PATH) {
    pkg.dependencies['tduck-form-generator'] = LOCAL_PATH;
    modified = true;
    console.log('🔄 正在切换到【本地调试模式】...');
  } else {
    console.log('✅ 当前已经是【本地调试模式】');
  }
} else if (mode === 'prod') {
  if (pkg.dependencies['tduck-form-generator'] !== PROD_VERSION) {
    pkg.dependencies['tduck-form-generator'] = PROD_VERSION;
    modified = true;
    console.log('🔄 正在切换到【正式引用模式】...');
  } else {
    console.log('✅ 当前已经是【正式引用模式】');
  }
}

if (modified) {
  // 保存 package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('📦 正在重新安装依赖，请稍候...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.resolve(__dirname, '../') });
    console.log(`\n✨ 切换完成！当前 tduck-form-generator 依赖为: ${pkg.dependencies['tduck-form-generator']}`);
    if (mode === 'dev') {
      console.log('👉 提示: 请确保在 tduck-front-full/src/formgen 目录下运行了 `npm run watch`');
    }
  } catch (error) {
    console.error('❌ 依赖安装失败，请手动执行 npm install');
  }
}
