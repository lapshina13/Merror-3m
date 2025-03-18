document.addEventListener('DOMContentLoaded', () => {
  const merrorText = document.querySelector('.merror-text');
  const text = 'MERROR';
  merrorText.textContent = '';

  text.split('').forEach((letter, index) => {
    const span = document.createElement('span');
    span.textContent = letter;
    span.style.opacity = '0';
    span.style.animation = `fadeIn 0.5s ease-in forwards`;
    span.style.animationDelay = `${index * 0.5}s`;
    merrorText.appendChild(span);
  });
});