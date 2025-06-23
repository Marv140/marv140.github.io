document.getElementById('uploadForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const input = document.getElementById('imageInput');
  const status = document.getElementById('status');
  const downloadLink = document.getElementById('downloadLink');
  const downloadSection = document.getElementById('downloadSection');

  status.textContent = '';
  downloadSection.style.display = 'none';

  if (!input.files.length) {
    status.textContent = 'Prosím vyber soubor.';
    return;
  }

  const file = input.files[0];
  const originalName = file.name.split('.').slice(0, -1).join('.') || 'converted'; // odstraní příponu
  const formData = new FormData();
  formData.append('image', file);

  status.textContent = 'Probíhá převod...';

  try {
    const response = await fetch('/convert', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      status.textContent = 'Chyba při převodu obrázku.';
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    downloadLink.href = url;
    downloadLink.download = `${originalName}.webp`;
    downloadSection.style.display = 'block';
    status.textContent = 'Převod úspěšný!';
  } catch (err) {
    status.textContent = 'Došlo k chybě při převodu.';
  }
});