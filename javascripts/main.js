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


  const pageNumbers = document.querySelectorAll('.page-numbers span');
  const content = document.querySelector('#app');
  const graphs = document.querySelectorAll('.graf1, .graf2, .graf3, .graf4');
  const maskImage = document.querySelector('.mask-image');
  const facesContainer = document.querySelector('.faces-container');
  const changerColor = document.querySelector('.changer-color');
  const faces = document.querySelectorAll('.face');

  const masks = ['mask.svg', 'mask2.svg', 'mask3.svg'];
  let currentMaskIndex = 0;

  changerColor.addEventListener('click', () => {
    currentMaskIndex = (currentMaskIndex + 1) % masks.length;
    maskImage.src = `./images/${masks[currentMaskIndex]}`;
  });

  faces.forEach(face => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    function getPosition(e) {
      return {
        x: e.type.includes('touch') ? e.touches[0].clientX : e.clientX,
        y: e.type.includes('touch') ? e.touches[0].clientY : e.clientY
      };
    }

    function onDragStart(e) {
      const pos = getPosition(e);
      startX = pos.x - currentX;
      startY = pos.y - currentY;
      isDragging = true;
      face.classList.add('dragging');
    }

    function onDragEnd() {
      isDragging = false;
      face.classList.remove('dragging');
    }

    function onDragMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const pos = getPosition(e);
      currentX = pos.x - startX;
      currentY = pos.y - startY;

      face.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.5)`;
    }

    face.addEventListener('mousedown', onDragStart);
    face.addEventListener('touchstart', onDragStart);
    
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchmove', onDragMove);
    
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchend', onDragEnd);
    
    face.addEventListener('dragstart', (e) => {
      e.preventDefault();
    });
  });


  document.addEventListener('selectstart', (e) => {
    if (e.target.classList.contains('face')) {
      e.preventDefault();
    }
  });

  pageNumbers.forEach((number, index) => {
    number.addEventListener('click', () => {

      pageNumbers.forEach(num => num.style.color = '#888888');
      number.style.color = '#000000';


      if (index === 0) {
        merrorText.style.display = 'flex';
        document.querySelector('.subtext').style.display = 'block';
        graphs.forEach(graph => graph.style.display = 'block');
        maskImage.style.display = 'none';
        facesContainer.style.display = 'none';
      } else {
        merrorText.style.display = 'none';
        document.querySelector('.subtext').style.display = 'none';
        graphs.forEach(graph => graph.style.display = 'none');
        if (index === 1) {
          maskImage.style.display = 'block';
          facesContainer.style.display = 'block';
          changerColor.style.display = 'block';
        } else {
          maskImage.style.display = 'none';
          facesContainer.style.display = 'none';
          changerColor.style.display = 'none';
        }
      }
    });
  });
});