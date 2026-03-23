const fs = require('fs');
const path = require('path');

function findFiles(dir, filter, res = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fw = path.join(dir, file);
    if (fs.statSync(fw).isDirectory()) {
      findFiles(fw, filter, res);
    } else if (filter(fw)) {
      res.push(fw);
    }
  }
  return res;
}

const pageFiles = findFiles('./src/app', f => f.endsWith('.page.ts'));
for (const file of pageFiles) {
  let content = fs.readFileSync(file, 'utf8');
  
  // They currently have styleUrls: [],
  // Let's replace it with the actual styleUrls
  const baseName = path.basename(file, '.page.ts');
  const cssFile = `./${baseName}.page.scss`;

  content = content.replace(/styleUrls:\s*\[\s*\],?/, `styleUrls: ['${cssFile}'],`);
  
  fs.writeFileSync(file, content);
  console.log('Restored css for ' + file);
}
