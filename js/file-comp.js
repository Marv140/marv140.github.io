document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('uploadForm');
  const input = document.getElementById('imageInput');
  const downloadSection = document.getElementById('downloadSection');
  const downloadLink = document.getElementById('downloadLink');
  const status = document.getElementById('status');

  form.addEventListener('submit', e => {
    e.preventDefault();
    downloadSection.classList.add('hidden');
    status.textContent = '';

    const file = input.files[0];
    if (!file) {
      alert('Please select an image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) {
            alert('Error converting the image.');
            return;
          }
          const url = URL.createObjectURL(blob);
          downloadLink.href = url;
          downloadLink.download = file.name.replace(/\.[^.]+$/, '') + '.webp';
          downloadSection.classList.remove('hidden');
          status.textContent = 'Conversion successful!';
        }, 'image/webp');
      };
      img.onerror = () => alert('Unable to load the image.');
      img.src = reader.result;
    };
    reader.onerror = () => alert('Error reading the file.');
    reader.readAsDataURL(file);
  });
});