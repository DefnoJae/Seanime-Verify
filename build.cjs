const fs=require('node:fs'),path=require('node:path');
const root=__dirname,base='https://raw.githubusercontent.com/DefnoJae/Seanime-Verify/main/';
// Seanime serializes this callback into a separate UI VM. Keep its library inside it.
const library=fs.readFileSync(path.join(root,'src/verify.js'),'utf8');
const payload=fs.readFileSync(path.join(root,'src/plugin.js'),'utf8').replace('/* VERIFY_LIBRARY */',library);
fs.writeFileSync(path.join(root,'plugin.js'),payload);
fs.writeFileSync(path.join(root,'Manifest.json'),JSON.stringify({id:'seanimeverify',name:'Seanime Verify',version:'0.1.2',author:'DefnoJae',type:'plugin',language:'javascript',lang:'en',description:'Preview: detects verification challenges for MKissa and Anime Nexus; does not solve CAPTCHAs.',manifestURI:base+'Manifest.json',readme:base+'README.md',website:'https://github.com/DefnoJae/Seanime-Verify',payload,plugin:{version:'1',permissions:{allow:{networkAccess:{allowedDomains:['https://mkissa.to/anime','https://api.anime.nexus/api/anime/shows']}}}}},null,2)+'\n');
