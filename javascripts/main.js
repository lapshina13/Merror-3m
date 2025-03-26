document.addEventListener("DOMContentLoaded", () => {
  const merrorText = document.querySelector(".merror-text");
  let text = "MERROR";
  merrorText.textContent = "";

  const shatteredImage = document.createElement("img");
  shatteredImage.src = "./images/shatered.svg";
  shatteredImage.style.position = "absolute";
  shatteredImage.style.top = "0px";
  shatteredImage.style.left = "47%";
  shatteredImage.style.transform = "translateX(-50%)";
  shatteredImage.style.display = "none";
  shatteredImage.style.zIndex = "1";
  document.querySelector("#app").appendChild(shatteredImage);

  text.split("").forEach((letter, index) => {
    const span = document.createElement("span");
    span.textContent = letter;
    span.style.opacity = "0";
    span.style.animation = `fadeIn 0.5s ease-in forwards`;
    span.style.animationDelay = `${index * 0.5}s`;
    merrorText.appendChild(span);
  });

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

  let currentPosterIndex = 0;

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

  function handlePosterNavigation() {
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    if (!prevBtn || !nextBtn) return;

    // Remove existing event listeners
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));

    // Get fresh references
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

  window.addEventListener("resize", updateActivePoster);

  let isDrawing = false;
  let cursorBlue = true;
  let cursorInterval;
  let paintSize = 100;

  let paintImage = new Image();
  paintImage.src = "./images/drawPaintV1.png";

  const faces = document.querySelectorAll(".face");
  const mirrors = document.querySelectorAll(".mirror");

  const masks = ["mask.svg", "mask2.svg", "mask3.svg"];
  let currentMaskIndex = 0;
  let currentPage = 0;
  let gameInterval;
  let currentMirrorIndex = 0;
  let isShadowCaught = false;
  let pagesVisited = new Set();
  let hasVisitedAllPages = false;

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

  // Remove the duplicate function and update the existing one
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

  changerColor.addEventListener("click", () => {
    currentMaskIndex = (currentMaskIndex + 1) % masks.length;
    maskImage.src = `./images/${masks[currentMaskIndex]}`;
  });

  faces.forEach((face) => {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    function getPosition(e) {
      return {
        x: e.type.includes("touch") ? e.touches[0].clientX : e.clientX,
        y: e.type.includes("touch") ? e.touches[0].clientY : e.clientY,
      };
    }

    function onDragStart(e) {
      const pos = getPosition(e);
      const style = window.getComputedStyle(face);
      const matrix = new DOMMatrix(style.transform);

      offsetX = pos.x - matrix.m41;
      offsetY = pos.y - matrix.m42;

      isDragging = true;
      face.style.zIndex = "1000";
    }

    function onDragEnd() {
      isDragging = false;
      face.style.zIndex = "1";
    }

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

  document.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("face")) e.preventDefault();
  });

  showPage(0);

  pageNumbers.forEach((number, index) => {
    number.addEventListener("click", () => {
      pagesVisited.add(index + 1);
      if (pagesVisited.size === 4) {
        hasVisitedAllPages = true;
      }
      showPage(index + 1); // Pages 1-4
    });
  });

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
    // shatteredImage.style.display = (pageNumber === 0 && hasVisitedAllPages) ? 'block' : 'none';
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

  function setupDrawing() {
    if (!drawingCanvas || !ctx) return;

    // Reset cursor to default for all pages
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

  function startDrawing(e) {
    isDrawing = true;
    startCursorAnimation();
    draw(e);
  }

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
