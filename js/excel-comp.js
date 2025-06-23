document.getElementById('compareForm').addEventListener('submit', async e => {
  e.preventDefault();
  const f1 = document.getElementById('file1').files[0];
  const f2 = document.getElementById('file2').files[0];
  if (!f1 || !f2) return alert('Both files need to be selected.');
  const [b1, b2] = await Promise.all([f1.arrayBuffer(), f2.arrayBuffer()]);
  const wb1 = XLSX.read(b1, {type:'array'});
  const wb2 = XLSX.read(b2, {type:'array'});
  const s1 = XLSX.utils.sheet_to_json(wb1.Sheets[wb1.SheetNames[0]], {header:1});
  const s2 = XLSX.utils.sheet_to_json(wb2.Sheets[wb2.SheetNames[0]], {header:1});
  const [head] = s1;
  const rows1 = s1.slice(1).map(r=>JSON.stringify(r));
  const rows2 = s2.slice(1).map(r=>JSON.stringify(r));
  const common = [], only1 = [], only2 = [];
  rows1.forEach(r => rows2.includes(r) ? common.push(JSON.parse(r)) : only1.push(JSON.parse(r)));
  rows2.forEach(r => !rows1.includes(r) && only2.push(JSON.parse(r)));
  const makeBlob = data => {
    const ws = XLSX.utils.aoa_to_sheet([head, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const arr = XLSX.write(wb, {bookType:'xlsx', type:'array'});
    return new Blob([arr], {type:'application/octet-stream'});
  };
  document.getElementById('commonLink').href = URL.createObjectURL(makeBlob(common));
  document.getElementById('only1Link').href = URL.createObjectURL(makeBlob(only1));
  document.getElementById('only2Link').href = URL.createObjectURL(makeBlob(only2));
  document.getElementById('results').classList.remove('hidden');
});