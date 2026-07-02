const fs = require('fs');
let code = fs.readFileSync('src/components/Admin/AdminPanel.tsx', 'utf8');

// Add state
let stateStart = code.indexOf('const [dicebearB64');
code = code.substring(0, stateStart) + "const [officerImageB64, setOfficerImageB64] = useState('');\n  " + code.substring(stateStart);

// Replace useEffect
let effectStart = code.indexOf('useEffect(() => {\n    if (selectedOfficerForDownload && !selectedOfficerForDownload.imageUrl) {');
let effectEnd = code.indexOf('}, [selectedOfficerForDownload]);', effectStart) + 33;

let newEffect = `useEffect(() => {
    if (selectedOfficerForDownload) {
      if (selectedOfficerForDownload.imageUrl) {
        getBase64Image(selectedOfficerForDownload.imageUrl).then(setOfficerImageB64);
      } else {
        getBase64Image(\`https://api.dicebear.com/7.x/bottts/svg?seed=\${selectedOfficerForDownload.id}\`).then(setOfficerImageB64);
      }
    } else {
      setOfficerImageB64('');
    }
  }, [selectedOfficerForDownload]);`;

code = code.substring(0, effectStart) + newEffect + code.substring(effectEnd);

// Now replace rendering: selectedOfficerForDownload.imageUrl
code = code.replace(/\{selectedOfficerForDownload\.imageUrl \? \([\s\S]*?<img src=\{selectedOfficerForDownload\.imageUrl\}[\s\S]*?\) : \([\s\S]*?<img src=\{dicebearB64 \|\| `https:\/\/api\.dicebear\.com[\s\S]*?\)[\s\S]*?\}/g, 
`{officerImageB64 && (
                            <img src={officerImageB64} className="w-full h-full object-cover mt-[3px] -mr-[4px]" alt="Officer Avatar" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                          )}`);

fs.writeFileSync('src/components/Admin/AdminPanel.tsx', code);
console.log('Fixed officer image handling.');
