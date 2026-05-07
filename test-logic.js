const fs = require('fs');

const tsCode = fs.readFileSync('src/app/page.tsx', 'utf8');
console.log(tsCode.includes('filteredRecipes = useMemo'));
