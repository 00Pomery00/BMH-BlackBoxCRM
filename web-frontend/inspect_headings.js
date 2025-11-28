const pw=require('playwright');
(async()=>{
  const b=await pw.chromium.launch();
  const p=await b.newPage();
  await p.goto('http://127.0.0.1:5173');
  const hs=await p.$$eval('h1,h2,h3', nodes=>nodes.map(n=>n.innerText));
  console.log('HEADINGS:', JSON.stringify(hs));
  await b.close();
})();
