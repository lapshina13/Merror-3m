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
  const mirrorsContainer = document.querySelector('.mirrors-container');
  const closeSign = document.querySelector('.close-sign');
  const borderLeft = document.querySelector('.border-left');
  const borderRight = document.querySelector('.border-right');
  const faces = document.querySelectorAll('.face');
  const mirrors = document.querySelectorAll('.mirror');

  const masks = ['mask.svg', 'mask2.svg', 'mask3.svg'];
  let currentMaskIndex = 0;
  let currentPage = 0;
  let gameInterval;
  let currentMirrorIndex = 0;
  let isShadowCaught = false;

  function startMirrorGame() {
    if (gameInterval) clearInterval(gameInterval);
    currentMirrorIndex = 0;
    isShadowCaught = false;
    
    mirrors.forEach(mirror => {
      const index = Array.from(mirrors).indexOf(mirror) + 1;
      mirror.src = `/images/mirror${index}.png`;
    });

    gameInterval = setInterval(() => {
      if (isShadowCaught) return;

      if (currentMirrorIndex > 0) {
        const prevMirror = mirrors[currentMirrorIndex - 1];
        prevMirror.src = prevMirror.src.replace('Active', '');
      } else {
        mirrors[2].src = mirrors[2].src.replace('Active', '');
      }

      const currentMirror = mirrors[currentMirrorIndex];
      currentMirror.src = currentMirror.src.replace('.png', 'Active.png');

      currentMirrorIndex = (currentMirrorIndex + 1) % 3;
    }, 1000);
  }

  mirrors[2].addEventListener('click', () => {
    if (currentPage === 2 && !isShadowCaught && mirrors[2].src.includes('Active')) {
      isShadowCaught = true;
      clearInterval(gameInterval);
      mirrors[2].src = '/images/brokenMirror.png';
    }
  });

  changerColor.addEventListener('click', () => {
    currentMaskIndex = (currentMaskIndex + 1) % masks.length;
    maskImage.src = `/images/${masks[currentMaskIndex]}`;
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


  document.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('face')) e.preventDefault();
  });

  showPage(0);

  pageNumbers.forEach((number, index) => {
    number.addEventListener('click', () => {
      showPage(index + 1); // Pages 1-4
    });
  });

  closeSign.addEventListener('click', () => {
    showPage(0);
  });

  function showPage(pageNumber) {
    document.querySelector('.page-numbers').style.display = pageNumber === 0 ? 'flex' : 'none';
    
    closeSign.style.display = pageNumber === 0 ? 'none' : 'block';

    if (pageNumber === 0) {
      merrorText.style.display = 'flex';
      document.querySelector('.subtext').style.display = 'block';
      graphs.forEach(graph => graph.style.display = 'block');
      maskImage.style.display = 'none';
      facesContainer.style.display = 'none';
      mirrorsContainer.style.display = 'none';
      changerColor.style.display = 'none';
      borderLeft.style.display = 'none';
      borderRight.style.display = 'none';
    } else {
      merrorText.style.display = 'none';
      document.querySelector('.subtext').style.display = 'none';
      graphs.forEach(graph => graph.style.display = 'none');
      
      if (pageNumber === 2) {
        maskImage.style.display = 'none';
        facesContainer.style.display = 'none';
        mirrorsContainer.style.display = 'flex';
        changerColor.style.display = 'none';
        borderLeft.style.display = 'block';
        borderRight.style.display = 'block';
        isShadowCaught = false;
        startMirrorGame();
      } else if (pageNumber === 1) {
        maskImage.style.display = 'block';
        facesContainer.style.display = 'block';
        mirrorsContainer.style.display = 'none';
        changerColor.style.display = 'block';
        borderLeft.style.display = 'none';
        borderRight.style.display = 'none';
      } else {
        maskImage.style.display = 'none';
        facesContainer.style.display = 'none';
        mirrorsContainer.style.display = 'none';
        changerColor.style.display = 'none';
        borderLeft.style.display = 'none';
        borderRight.style.display = 'none';
      }
      
      if (pageNumber !== 2 && gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      }
    }
    currentPage = pageNumber;
  }
});