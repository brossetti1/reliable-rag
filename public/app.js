// tab switching
console.log('🔀 Setting up tab switching handlers');
document.querySelectorAll('nav button').forEach(btn => {
  btn.onclick = () => {
    console.log(`🖱️ Tab clicked: ${btn.dataset.tab}`);
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});
// default
console.log('✅ Activating default tab');
document.querySelector('nav button').click();

// ingest handler
console.log('🔌 Setting up ingest handler');
document.getElementById('btn-ingest').onclick = async () => {
  console.log('🖱️ Ingest button clicked');
  const raw = document.getElementById('urls').value;
  const urls = raw.split(/,\s*/).filter(u => u);
  console.log('📤 Sending URLs to server:', urls);

  try {
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls })
    });
    const data = await res.json();
    console.log('📥 Ingest response received:', data);
    document.getElementById('ingest-result').textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    console.error('❌ Error during ingest fetch:', err);
    document.getElementById('ingest-result').textContent = `Error: ${err}`;
  }
};

// query handler
console.log('🔌 Setting up query handler');
document.getElementById('btn-query').onclick = async () => {
  console.log('🖱️ Query button clicked');
  const q = document.getElementById('qtext').value;
  console.log('📤 Sending query to server:', q);

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    const data = await res.json();
    console.log('📥 Query response received:', data);
    document.getElementById('query-result').textContent = `Answer:\n${data.answer}\nSaved to: ${data.file}`;
  } catch (err) {
    console.error('❌ Error during query fetch:', err);
    document.getElementById('query-result').textContent = `Error: ${err}`;
  }
};
