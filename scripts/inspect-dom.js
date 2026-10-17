const http = require('http');

http.get('http://127.0.0.1:9222/json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const tabs = JSON.parse(data);
    const target = tabs.find(t => t.url.includes('demo-customer'));
    if (!target) return console.log('Target tab not found');

    const WebSocket = require('ws');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    ws.on('open', () => {
      const code = `
        (() => {
          const winWidth = window.innerWidth;
          const scrollWidth = document.documentElement.scrollWidth;
          const card = document.querySelector('.max-w-\\\\[420px\\\\]') || document.querySelector('main > div');
          const header = document.querySelector('header');
          const quickConnect = document.querySelector('section[aria-label="Quick Connect Actions"]');
          const quickButtons = Array.from(document.querySelectorAll('section[aria-label="Quick Connect Actions"] a')).map(a => ({
            label: a.innerText.trim(),
            rect: a.getBoundingClientRect()
          }));
          const badges = Array.from(document.querySelectorAll('.rounded-full')).map(b => ({
            text: b.innerText.trim(),
            rect: b.getBoundingClientRect()
          }));

          return JSON.stringify({
            winWidth,
            scrollWidth,
            cardRect: card ? card.getBoundingClientRect() : null,
            headerRect: header ? header.getBoundingClientRect() : null,
            quickConnectRect: quickConnect ? quickConnect.getBoundingClientRect() : null,
            quickButtons,
            badges
          });
        })()
      `;

      ws.send(JSON.stringify({
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: code,
          returnByValue: true
        }
      }));
    });

    ws.on('message', (msg) => {
      const resp = JSON.parse(msg);
      if (resp.id === 1) {
        console.log('Result:', JSON.parse(resp.result.result.value));
        ws.close();
        process.exit(0);
      }
    });
  });
});
