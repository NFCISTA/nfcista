async function measure() {
  const code = 'NF8K29';
  const url = `https://nfcista.vercel.app/r/${code}`;
  console.log('Testing redirect:', url);
  
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    const res = await fetch(url, { redirect: 'manual' });
    const duration = performance.now() - start;
    console.log(
      `[Run ${i + 1}] Status: ${res.status}` +
      ` | Location: ${res.headers.get('location')}` +
      ` | Cache-Control: ${res.headers.get('cache-control')}` +
      ` | Age: ${res.headers.get('age')}` +
      ` | x-vercel-cache: ${res.headers.get('x-vercel-cache')}` +
      ` | Server-Timing: ${res.headers.get('server-timing')}` +
      ` | Time: ${duration.toFixed(2)}ms`
    );
  }

  // Also test unknown card code
  console.log('\nTesting non-existent card code: /r/NONEXISTENT999');
  const start404 = performance.now();
  const res404 = await fetch(`https://nfcista.vercel.app/r/NONEXISTENT999`, { redirect: 'manual' });
  const dur404 = performance.now() - start404;
  console.log(`Status: ${res404.status} | Time: ${dur404.toFixed(2)}ms | Cache: ${res404.headers.get('x-vercel-cache')}`);

  // Also test malformed card code
  console.log('\nTesting malformed card code: /r/!!');
  const startBad = performance.now();
  const resBad = await fetch(`https://nfcista.vercel.app/r/!!`, { redirect: 'manual' });
  const durBad = performance.now() - startBad;
  console.log(`Status: ${resBad.status} | Time: ${durBad.toFixed(2)}ms | Cache: ${resBad.headers.get('x-vercel-cache')}`);
}
measure();
