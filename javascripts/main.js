document.addEventListener("DOMContentLoaded", () => {
  const merrorText = document.querySelector(".merror-text");
  let text = "MERROR";
  merrorText.textContent = "";

  // Анимация появления букв текста MERROR
  text.split("").forEach((letter, index) => {
    const span = document.createElement("span");
    span.textContent = letter;
    span.style.opacity = "0";
    span.style.animation = `fadeIn 0.5s ease-in forwards`;
    span.style.animationDelay = `${index * 0.5}s`;
    merrorText.appendChild(span);
  });

  // Получение всех необходимых элементов DOM — позволяют управлять разметкой html
  const pageNumbers = document.querySelectorAll(".page-numbers span");
  const content = document.querySelector("#app");
  const graphs = document.querySelectorAll(".graf1, .graf2, .graf3, .graf4");
  const maskImage = document.querySelector(".mask-image");
  const facesContainer = document.querySelector(".faces-container");
  const changerColor = document.querySelector(".changer-color");
  const mirrorsContainer = document.querySelector(".mirrors-container");
  const closeSign = document.querySelector(".close-sign");
  const borderLeft = document.querySelector(".border-left");
  const borderRight = document.querySelector(".border-right");
  const posterPage = document.querySelector(".poster-page");
  const drawingPage = document.querySelector(".drawing-page");
  const drawingCanvas = document.getElementById("drawingCanvas");
  const posterInputs = document.querySelectorAll(".poster-input");
  const posterWrappers = document.querySelectorAll(".poster-wrapper");
  const ctx = drawingCanvas?.getContext("2d");

  // Индекс текущего постера для мобильной версии
  let currentPosterIndex = 0;

  // Обновление постера для мобильной версии
  function updateActivePoster() {
    if (window.innerWidth <= 768) {
      posterWrappers.forEach((wrapper, index) => {
        wrapper.style.display = "none";
        wrapper.classList.toggle("active", index === currentPosterIndex);
        if (index === currentPosterIndex) {
          wrapper.style.display = "block";
        }
      });
    } else {
      posterWrappers.forEach((wrapper) => {
        wrapper.style.display = "block";
        wrapper.classList.remove("active");
      });
    }
  }

  // Настройка навигации между постерами
  function handlePosterNavigation() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!prevBtn || !nextBtn) return;

    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));

    // Получение новых ссылок на кнопки
    const newPrevBtn = document.querySelector(".prev-btn");
    const newNextBtn = document.querySelector(".next-btn");

    newPrevBtn?.addEventListener("click", () => {
      currentPosterIndex =
        (currentPosterIndex - 1 + posterWrappers.length) %
        posterWrappers.length;
      updateActivePoster();
    });

    newNextBtn?.addEventListener("click", () => {
      currentPosterIndex = (currentPosterIndex + 1) % posterWrappers.length;
      updateActivePoster();
    });
  }

  // Изменения размера окна
  window.addEventListener("resize", updateActivePoster);

  // Для рисования
  let isDrawing = false;
  let cursorBlue = true;
  let cursorInterval;
  let paintSize = 100;

  // Загрузка изображения кисти
  let paintImage = new Image();
  paintImage.src = "./images/drawPaintV1.png";

  // Получение элементов лиц и зеркал
  const faces = document.querySelectorAll(".face");
  const mirrors = document.querySelectorAll(".mirror");

  //Маски
  const masks = ["mask.png", "mask2.png", "mask3.png"];
  let currentMaskIndex = 0;
  let currentPage = 0;
  let gameInterval;
  let currentMirrorIndex = 0;
  let isShadowCaught = false;
  let pagesVisited = new Set();
  let hasVisitedAllPages = false;

  // Игра с зеркалами
  function startMirrorGame() {
    if (gameInterval) clearInterval(gameInterval);
    currentMirrorIndex = 0;
    isShadowCaught = false;

    mirrors.forEach((mirror) => {
      const index = Array.from(mirrors).indexOf(mirror) + 1;
      mirror.src = `./images/mirror${index}.png`;
    });

    gameInterval = setInterval(() => {
      if (isShadowCaught) return;

      if (currentMirrorIndex > 0) {
        const prevMirror = mirrors[currentMirrorIndex - 1];
        prevMirror.src = prevMirror.src.replace("Active", "");
      } else {
        mirrors[2].src = mirrors[2].src.replace("Active", "");
      }

      const currentMirror = mirrors[currentMirrorIndex];
      currentMirror.src = currentMirror.src.replace(".png", "Active.png");

      currentMirrorIndex = (currentMirrorIndex + 1) % 3;
    }, 200);
  }

  // Клик по зеркалу
  mirrors[2].addEventListener("click", () => {
    if (
      currentPage === 2 &&
      !isShadowCaught &&
      mirrors[2].src.includes("Active")
    ) {
      isShadowCaught = true;
      clearInterval(gameInterval);
      mirrors[2].src = "./images/brokenMirror.png";
    }
  });

  // Проверка заполнения всех полей ввода
  function checkAllInputsFilled() {
    const allFilled = Array.from(posterInputs).every(
      (input) => input.value.trim() !== ""
    );
    document
      .querySelectorAll(".face5-overlay, .face3-overlay, .faceposter3-overlay")
      .forEach((face) => {
        face.style.animation = allFilled
          ? "pulse 1s infinite ease-in-out"
          : "none";
      });
  }

  posterInputs.forEach((input) => {
    input.addEventListener("input", checkAllInputsFilled);
  });

  // Смена цвета маски
  changerColor.addEventListener("click", () => {
    // Добавляю анимацию перехода
    maskImage.style.animation = "maskTransition 0.5s ease-in-out";

    // Меняю маску на следующую в середине анимации
    setTimeout(() => {
      currentMaskIndex = (currentMaskIndex + 1) % masks.length;
      maskImage.src = `./images/${masks[currentMaskIndex]}`;
    }, 250);

    // Удаляю анимацию после завершения
    maskImage.addEventListener(
      "animationend",
      () => {
        maskImage.style.animation = "";
      },
      { once: true }
    );
  });

  // Настройка перетаскивания лиц
  faces.forEach((face) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    // Получение позиции курсора/касания на мобилке
    function getPosition(e) {
      return {
        x: e.type.includes("touch") ? e.touches[0].clientX : e.clientX,
        y: e.type.includes("touch") ? e.touches[0].clientY : e.clientY,
      };
    }

    // Начало перетаскивания
    function onDragStart(e) {
      const pos = getPosition(e);
      const style = window.getComputedStyle(face);
      const matrix = new DOMMatrix(style.transform);

      offsetX = pos.x - matrix.m41;
      offsetY = pos.y - matrix.m42;

      isDragging = true;
      face.style.zIndex = "1000";
    }

    // Окончание перетаскивания
    function onDragEnd() {
      isDragging = false;
      face.style.zIndex = "1";
    }

    // Процесс перетаскивания
    function onDragMove(e) {
      if (!isDragging) return;
      e.preventDefault();

      const pos = getPosition(e);
      const x = pos.x - offsetX;
      const y = pos.y - offsetY;

      face.style.transform = `translate(${x}px, ${y}px)`;
    }

    face.addEventListener("mousedown", onDragStart);
    face.addEventListener("touchstart", onDragStart);

    window.addEventListener("mousemove", onDragMove);
    window.addEventListener("touchmove", onDragMove);

    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchend", onDragEnd);

    face.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
  });

  // Предотвращение стандартного поведения перетаскивания
  document.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("face")) e.preventDefault();
  });

  // Показ начальной страницы
  showPage(0);

  // Навигация по страницам
  pageNumbers.forEach((number, index) => {
    number.addEventListener("click", () => {
      pagesVisited.add(index + 1);
      if (pagesVisited.size === 4) {
        hasVisitedAllPages = true;
      }
      showPage(index + 1); // Pages 1-4
    });
  });

  // Кнопка закрытия
  closeSign.addEventListener("click", () => {
    if (currentPage === 3) {
      posterPage.style.display = "none";
    } else if (currentPage === 4) {
      drawingPage.style.display = "none";
      document.body.style.cursor = "default";
      if (cursorInterval) {
        clearInterval(cursorInterval);
        cursorInterval = null;
      }
    }
    showPage(0);
  });

  // Функция показа страницы
  function showPage(pageNumber) {
    document.querySelector(".page-numbers").style.display =
      pageNumber === 0 ? "flex" : "none";
    document.querySelector(".page-numbers").style.zIndex = "10";
    const posterPageElement = document.querySelector(".poster-page");
    const drawingPageElement = document.querySelector(".drawing-page");

    closeSign.style.display = pageNumber === 0 ? "none" : "block";
    if (posterPageElement)
      posterPageElement.style.display = pageNumber === 3 ? "block" : "none";
    if (drawingPageElement)
      drawingPageElement.style.display = pageNumber === 4 ? "block" : "none";

    if (pageNumber === 0 && hasVisitedAllPages) {
      merrorText.textContent = "";
      const newText = "You did it";
      newText.split("").forEach((letter, index) => {
        const span = document.createElement("span");
        span.textContent = letter;
        span.style.opacity = "0";
        span.style.animation = `fadeIn 0.5s ease-in forwards`;
        span.style.animationDelay = `${index * 0.5}s`;
        merrorText.appendChild(span);
      });
    }

    if (pageNumber === 0) {
      merrorText.style.display = "flex";
      document.querySelector(".subtext").style.display = "block";
      graphs.forEach((graph) => (graph.style.display = "block"));
      maskImage.style.display = "none";
      facesContainer.style.display = "none";
      mirrorsContainer.style.display = "none";
      updateActivePoster();
      handlePosterNavigation();
      changerColor.style.display = "none";
      borderLeft.style.display = "none";
      borderRight.style.display = "none";
    } else {
      merrorText.style.display = "none";
      document.querySelector(".subtext").style.display = "none";
      graphs.forEach((graph) => (graph.style.display = "none"));
      closeSign.style.display = "block";

      if (pageNumber === 2) {
        maskImage.style.display = "none";
        facesContainer.style.display = "none";
        mirrorsContainer.style.display = "flex";
        changerColor.style.display = "none";
        borderLeft.style.display = "block";
        borderRight.style.display = "block";
        isShadowCaught = false;
        closeSign.src = "./images/closeSign.svg";
        startMirrorGame();
      } else if (pageNumber === 1) {
        maskImage.style.display = "block";
        facesContainer.style.display = "block";
        mirrorsContainer.style.display = "none";
        changerColor.style.display = "block";
        borderLeft.style.display = "none";
        borderRight.style.display = "none";
        closeSign.src = "./images/closeSign.svg";
      } else if (pageNumber === 3) {
        maskImage.style.display = "none";
        facesContainer.style.display = "none";
        mirrorsContainer.style.display = "none";
        posterPage.style.display = "block";
        changerColor.style.display = "none";
        document.body.style.cursor = "default";
        borderLeft.style.display = "none";
        borderRight.style.display = "none";
        closeSign.src = "./images/closeSignWhite.svg";
      } else if (pageNumber === 4) {
        maskImage.style.display = "none";
        facesContainer.style.display = "none";
        mirrorsContainer.style.display = "none";
        posterPage.style.display = "none";
        drawingPage.style.display = "block";
        document.body.style.cursor = "url(./images/cursorBlue.svg), auto";
        changerColor.style.display = "none";
        borderLeft.style.display = "none";
        borderRight.style.display = "none";
        closeSign.src = "./images/closeSignWhite.svg";
        setupDrawing();
      } else {
        maskImage.style.display = "none";
        facesContainer.style.display = "none";
        mirrorsContainer.style.display = "none";
        changerColor.style.display = "none";
        borderLeft.style.display = "none";
        borderRight.style.display = "none";
        closeSign.src = "./images/closeSignWhite.svg";
      }

      if (pageNumber !== 2 && gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
      }
    }
    currentPage = pageNumber;
  }

  // Настройка холста для рисования
  function setupDrawing() {
    if (!drawingCanvas || !ctx) return;

    // Сброс курсора на стандартный для всех страниц
    document.body.style.cursor = "default";

    drawingCanvas.width = 782;
    drawingCanvas.height = 550;
    ctx.globalAlpha = 0.8;

    document.body.style.cursor = "url(./images/cursorBlue.svg), auto";

    drawingCanvas.addEventListener("mousedown", startDrawing);
    drawingCanvas.addEventListener("mousemove", draw);
    drawingCanvas.addEventListener("mouseup", stopDrawing);
    drawingCanvas.addEventListener("mouseout", stopDrawing);
  }

  // Начало рисования
  function startDrawing(e) {
    isDrawing = true;
    startCursorAnimation();
    draw(e);
  }

  // Остановка рисования
  function stopDrawing() {
    isDrawing = false;
    if (cursorInterval) {
      clearInterval(cursorInterval);
      cursorInterval = null;
      if (currentPage !== 4) {
        document.body.style.cursor = "default";
      }
    }
    if (currentPage === 4) {
      document.body.style.cursor = "url(./images/cursorBlue.svg), auto";
    }
    ctx.beginPath();
  }

  // Запуск анимации курсора
  function startCursorAnimation() {
    if (currentPage !== 4) return;

    if (cursorInterval) clearInterval(cursorInterval);
    cursorInterval = setInterval(() => {
      cursorBlue = !cursorBlue;
      document.body.style.cursor = `url(./images/cursor${
        cursorBlue ? "Blue" : "Black"
      }.svg), auto`;
    }, 100);
  }

  // Функция рисования
  function draw(e) {
    if (!isDrawing || !ctx || !drawingCanvas) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (drawingCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (drawingCanvas.height / rect.height);

    const sizeVariation = paintSize * (0.8 + Math.random() * 0.4);

    ctx.drawImage(
      paintImage,
      x - sizeVariation / 2,
      y - sizeVariation / 2,
      sizeVariation,
      sizeVariation
    );
  }
});
