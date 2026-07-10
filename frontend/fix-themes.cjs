const fs = require('fs');
const path = require('path');

const filesToFix = [
  'Profile.jsx',
  'RegisterCard.jsx',
  'Onboarding.jsx',
  'events/BrowseEvents.jsx',
  'events/EventDetails.jsx'
];

const basePath = '/home/rithik/Videos/MERN/frontend/src/components';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace text-white with text-text-primary
    content = content.replace(/text-white/g, 'text-text-primary');
    // Replace text-black with text-text-primary
    content = content.replace(/text-black/g, 'text-text-primary');
    // Replace bg-white/10 with bg-glass-bg
    content = content.replace(/bg-white\/10/g, 'bg-glass-bg');
    // Replace bg-white/5 with bg-glass-bg
    content = content.replace(/bg-white\/5/g, 'bg-glass-bg');

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Not found: ${fullPath}`);
  }
});
