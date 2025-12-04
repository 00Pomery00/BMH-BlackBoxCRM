const pw = require('playwright');
(async ()=>{
  const b = await pw.chromium.launch();
  const p = await b.newPage();
  await p.goto('http://127.0.0.1:5173');
  console.log('URL', p.url());
  const items = await p.$$('[data-testid^="lead-item-"]');
  console.log('lead items count:', items.length);
  for (let i=0;i<Math.min(items.length,5);i++){
    const id = await items[i].getAttribute('data-testid');
    const name = await items[i].$eval('.font-semibold', n => n.innerText).catch(()=>null);
    console.log('item', i, id, name);
  }
  if (items.length>0){
    const btn = await items[0].$('button[data-testid^="lead-open-"]');
    console.log('button present?', !!btn);
    await btn.click();
    await p.waitForTimeout(500);
    const modal = await p.$('[data-testid="lead-modal-heading"]');
    console.log('modal present?', !!modal);
    if(modal){
      const txt = await modal.innerText();
      console.log('modal heading text:', txt);
    }
  }
  await b.close();
})();
