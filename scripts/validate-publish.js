// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const rootDir = path.resolve(__dirname, '..');

// console.log(' Running hyperDart Pre-Publish Validation...\n');

// let hasError = false;

// // 1. Check hyperdart.config.js
// const configPath = path.join(rootDir, 'hyperdart.config.js');
// if (!fs.existsSync(configPath)) {
//   console.error('Error: hyperdart.config.js is missing!');
//   process.exit(1);
// }

// const config = (await import(`file://${configPath}`)).default;

// // 2. Check GitHub link
// if (!config.github || typeof config.github !== 'string' || !config.github.startsWith('https://github.com/')) {
//   console.error(' Error: Valid "github" repository URL is required in hyperdart.config.js');
//   hasError = true;
// } else if (config.github.includes('/tree/')) {
//   console.error(' Error: "github" must be the repo root URL, not a /tree/main link.');
//   hasError = true;
// } else {
//   console.log(` GitHub link verified: ${config.github}`);
// }

// // 3. Check Demo Video link
// if (!config.demovideo || typeof config.demovideo !== 'string' || (!config.demovideo.includes('youtube.com') && !config.demovideo.includes('youtu.be'))) {
//   console.error(' Error: Valid YouTube "demovideo" link is required in hyperdart.config.js');
//   hasError = true;
// } else {
//   console.log(` Demo video link verified: ${config.demovideo}`);
// }

// // 4. Check keywords
// if (!Array.isArray(config.keywords) || config.keywords.length === 0) {
//   console.error(' Error: "keywords" array must contain at least 1 keyword.', configkeywords);
//   hasError = true;
// } else {
//   console.log(` Keywords verified (${config.keywords.length} found).`);
// }

// // 5. Check regex
// if (!Array.isArray(config.regex) || config.regex.length === 0) {
//   console.error(' Error: "regex" array must contain at least 1 trigger pattern.');
//   hasError = true;
// } else {
//   console.log(`Trigger regex patterns verified (${config.regex.length} found).`);
// }

// // 6. Check build output in dist
// const distPath = path.join(rootDir, 'dist');
// if (!fs.existsSync(distPath) || fs.readdirSync(distPath).length === 0) {
//   console.error('Error: Build output "dist/" directory is missing or empty. Run "npm run build" first.');
//   hasError = true;
// } else {
//   console.log('Build output directory "dist/" verified.');
// }

// console.log('');

// if (hasError) {
//   console.error(' Validation failed! Please fix the errors above before publishing.');
//   process.exit(1);
// }

// console.log('hyperDart Pre-publish Validation PASSED! Ready for dev registry publication.\n');
// process.exit(0);


// // import { createRequire } from 'module';
// // import { existsSync } from 'fs';
// // import { pathToFileURL } from 'url';
// // import path from 'path';

// // const require = createRequire(import.meta.url);
// // const pkg = require('../package.json');

// // // Check that the built module file exists
// // if (!existsSync(pkg.module)) {
// //   console.error(
// //     `\x1b[31mError: Module file '${pkg.module}' is missing. Please build the project first.\x1b[0m`
// //   );
// //   process.exit(1);
// // }

// // // Load hyperdart.config.js
// // const configPath = path.resolve('hyperdart.config.js');
// // const config = (await import(pathToFileURL(configPath).href)).default;


// // function isEmpty(value) {
// //   if (value == null) return true;
// //   if (!Array.isArray(value)) return true;
// //   if (value.length === 0) return true;
// //   if (value.every((item) => item === '')) return true;
// //   return false;
// // }

// // const errors = [];

// // // Validates that a config field is a non-empty string pointing to an existing path
// // function validatePath(value, fieldName) {
// //   if (typeof value !== 'string' || value.trim() === '') {
// //     errors.push(`  * ${fieldName} is missing or empty.`);
// //     return;
// //   }
// //   if (!existsSync(path.resolve(value))) {
// //     errors.push(`  * ${fieldName} '${value}' does not exist.`);
// //   }
// // }

// // function parseHttpUrl(value) {
// //   try {
// //     const url = new URL(value.trim());
// //     return url.protocol === 'https:' || url.protocol === 'http:' ? url : null;
// //   } catch {
// //     return null;
// //   }
// // }

// // // Accepts https://github.com/<owner> or https://github.com/<owner>/<repo>
// // function isValidGithubUrl(value) {
// //   const url = parseHttpUrl(value);
// //   if (!url || !['github.com', 'www.github.com'].includes(url.hostname.toLowerCase())) return false;
// //   const [owner, repo, ...rest] = url.pathname.split('/').filter(Boolean);
// //   if (!owner || rest.length > 0) return false;
// //   if (!/^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/.test(owner)) return false;
// //   return repo === undefined || /^[A-Za-z0-9._-]+$/.test(repo);
// // }

// // // Accepts youtube.com/watch?v=ID, youtube.com/(embed|shorts|live|v)/ID and youtu.be/ID
// // function isValidYoutubeUrl(value) {
// //   const url = parseHttpUrl(value);
// //   if (!url) return false;
// //   const host = url.hostname.toLowerCase();
// //   const videoId = /^[A-Za-z0-9_-]{11}$/;
// //   if (host === 'youtu.be') return videoId.test(url.pathname.slice(1));
// //   if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) return false;
// //   if (url.pathname === '/watch') return videoId.test(url.searchParams.get('v') || '');
// //   const match = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/]+)\/?$/);
// //   return Boolean(match && videoId.test(match[1]));
// // }

// // // Validates a required URL field with the given checker
// // function validateUrl(value, fieldName, isValid, expected) {
// //   if (typeof value !== 'string' || value.trim() === '') {
// //     errors.push(`  * ${fieldName} is missing or empty.`);
// //   } else if (!isValid(value)) {
// //     errors.push(`  * ${fieldName} '${value}' is not a valid ${expected}.`);
// //   }
// // }

// // //Validate github and demovideo
// // validateUrl(config?.github, 'github', isValidGithubUrl, 'GitHub URL (https://github.com/<owner>/<repo>)');
// // validateUrl(config?.demovideo, 'demovideo', isValidYoutubeUrl, 'YouTube video link');

// // //Validate triggers.keywords
// // const keywords = config?.triggers?.keywords;
// // if (isEmpty(keywords)) {
// //   errors.push(
// //     "  * triggers.keywords is missing, empty, or contains only empty strings ('')."
// //   );
// // }

// // //Validate query_format.regex
// // const regex = config?.query_format?.regex;
// // if (isEmpty(regex)) {
// //   errors.push(
// //     "  * query_format.regex is missing, empty, or contains only empty strings ('')."
// //   );
// // }

// // //Validate client.location
// // const clientLocation = config?.client?.location;
// // if (typeof clientLocation !== 'string' || clientLocation.trim() === '') {
// //   errors.push('  * client.location is missing or empty.');
// // } else {
// //   const resolvedLocation = path.resolve(clientLocation);

// //   if (!existsSync(resolvedLocation)) {
// //     errors.push(
// //       `  * client.location '${clientLocation}' does not exist. Please build the project first.`
// //     );
// //   } else if (resolvedLocation !== path.resolve(pkg.module)) {
// //     errors.push(
// //       `  * client.location '${clientLocation}' must match package.json "module" ('${pkg.module}').`
// //     );
// //   }
// // }

// // if (errors.length > 0) {
// //   console.error('\x1b[31m');
// //   console.error('Publish blocked - hyperdart.config.js has invalid fields:');
// //   errors.forEach((e) => console.error(e));
// //   console.error(
// //     '\nPlease fill in real values before publishing.\x1b[0m'
// //   );
// //   process.exit(1);
// // }

// // console.log('\x1b[32m\u2714 Pre-publish validation passed.\x1b[0m');