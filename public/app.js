// tab switching
document.querySelectorAll('nav button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});
// default
document.querySelector('nav button').click();

// ingest handler
document.getElementById('btn-ingest').onclick = async () => {
  const raw = document.getElementById('urls').value;
  const urls = raw.split(/,\s*/).filter(u => u);
  const res = await fetch('/api/ingest', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ urls })
  }).then(r => r.json());
  document.getElementById('ingest-result').textContent = JSON.stringify(res, null, 2);
};

// query handler
document.getElementById('btn-query').onclick = async () => {
  const q = document.getElementById('qtext').value;
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ query: q })
  }).then(r => r.json());
  document.getElementById('query-result').textContent = `Answer:\n${res.answer}\nSaved to: ${res.file}`;
};
