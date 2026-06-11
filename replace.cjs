const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === 'node_modules' || file === '.next') return;
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('./');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace react-router-dom imports
    if (content.includes('react-router-dom')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/g, (match, importsStr) => {
            let nextNavImports = [];
            let nextLinkImport = false;
            
            if (importsStr.includes('useNavigate')) nextNavImports.push('useRouter');
            if (importsStr.includes('useLocation')) nextNavImports.push('usePathname');
            if (importsStr.includes('useParams')) nextNavImports.push('useParams');
            if (importsStr.includes('Link')) nextLinkImport = true;
            
            let res = '';
            if (nextNavImports.length > 0) {
                res += `import { ${nextNavImports.join(', ')} } from 'next/navigation';\n`;
            }
            if (nextLinkImport) {
                res += `import Link from 'next/link';\n`;
            }
            return res.trim() === '' ? match : res; // If it's something else, leave it (shouldn't happen)
        });
    }

    // Replace useNavigate with useRouter
    content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\)/g, 'const $1 = useRouter()');
    
    // Replace useLocation with usePathname
    content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, 'const $1 = usePathname()');
    content = content.replace(/location\.pathname/g, 'pathname');

    // Replace <Link to="..."> with <Link href="...">
    content = content.replace(/<Link\s+to=/g, '<Link href=');

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log('Fixed', file);
        changedCount++;
    }
});

console.log('Total files changed:', changedCount);
