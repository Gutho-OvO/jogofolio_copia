// ===== TELAS DE INÍCIO E SELEÇÃO DE FILE =====

let currentScreen = "title"; // "title", "fileSelect", ou "game"
let selectedFile = null;
let hoveredFile = null;

// Dados dos saves (será carregado do localStorage)
let saveFiles = [
  { id: 1, exists: false, playerName: "", playtime: "00:00", location: "" },
  { id: 2, exists: false, playerName: "", playtime: "00:00", location: "" },
  { id: 3, exists: false, playerName: "", playtime: "00:00", location: "" }
];

// ===== SISTEMA DE SAVE/LOAD =====
function loadSaveFiles() {
  for (let i = 1; i <= 3; i++) {
    const saveData = localStorage.getItem(`jogofolio_save_${i}`);
    if (saveData) {
      try {
        const data = JSON.parse(saveData);
        saveFiles[i - 1] = {
          id: i,
          exists: true,
          playerName: data.playerName || "Player",
          playtime: data.playtime || "00:00",
          location: data.location || "Riverviews"
        };
      } catch (e) {
        console.error(`Erro ao carregar save ${i}:`, e);
      }
    }
  }
}

function createNewSave(fileId) {
  const saveData = {
    playerName: "Newt",
    playtime: "00:00",
    location: "Riverviews",
    playerX: 500,
    playerY: 964,
    currentMap: "city",
    hasCoin: false,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`jogofolio_save_${fileId}`, JSON.stringify(saveData));
  loadSaveFiles();
  return saveData;
}

function loadGame(fileId) {
  const saveData = localStorage.getItem(`jogofolio_save_${fileId}`);
  
  if (saveData) {
    try {
      const data = JSON.parse(saveData);
      
      // Carrega os dados do save
      player.x = data.playerX || 500;
      player.y = data.playerY || 964;
      currentMap = data.currentMap || "city";
      playerHasCoin = data.hasCoin || false;
      
      return true;
    } catch (e) {
      console.error("Erro ao carregar save:", e);
      return false;
    }
  }
  
  return false;
}

function saveGame(fileId) {
  const saveData = {
    playerName: "Newt",
    playtime: "00:00", // Você pode adicionar um timer depois
    location: currentMap === "city" ? "Riverviews" : 
              currentMap === "building" ? "Prédio Rosa" : 
              currentMap === "room" ? "Sala do Computador" : "Cinema",
    playerX: player.x,
    playerY: player.y,
    currentMap: currentMap,
    hasCoin: playerHasCoin,
    timestamp: Date.now()
  };
  
  localStorage.setItem(`jogofolio_save_${fileId}`, JSON.stringify(saveData));
  console.log(`Jogo salvo no FILE ${fileId}`);
}

// ===== DESENHA TELA DE TÍTULO =====
function drawTitleScreen() {
  // Fundo gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#000000');
  gradient.addColorStop(0.4, '#1a0a00');
  gradient.addColorStop(1, '#ff6b00');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const isMobile = window.isMobile;
  
  // Centraliza no mobile também
  const centerY = canvas.height / 2;
  
  // Título JOGOFÓLIO - centralizado
  ctx.fillStyle = '#ffffff';
  const titleSize = isMobile ? 28 : 82;
  ctx.font = `bold ${titleSize}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = isMobile ? '3px' : '12px';
  ctx.fillText('JOGOFÓLIO', canvas.width / 2, centerY - (isMobile ? 60 : 80));
  
  // Versão
  ctx.fillStyle = '#ffb380';
  const versionSize = isMobile ? 12 : 18;
  ctx.font = `${versionSize}px "Courier New", monospace`;
  ctx.letterSpacing = isMobile ? '2px' : '4px';
  ctx.fillText('v0.2', canvas.width / 2, centerY - (isMobile ? 35 : 30));
  
  // Botão START - centralizado
  const btnWidth = isMobile ? 170 : 300;
  const btnHeight = isMobile ? 45 : 80;
  const btnX = canvas.width / 2 - btnWidth / 2;
  const btnY = centerY + (isMobile ? -5 : 20);
  
  ctx.fillStyle = '#000000';
  ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = isMobile ? 3 : 5;
  ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
  
  ctx.fillStyle = '#ffffff';
  const btnTextSize = isMobile ? 18 : 28;
  ctx.font = `bold ${btnTextSize}px "Courier New", monospace`;
  ctx.letterSpacing = isMobile ? '3px' : '4px';
  ctx.fillText('START', canvas.width / 2, btnY + (isMobile ? 29 : 52));
  
  // Texto inferior
  ctx.fillStyle = '#ffb380';
  const bottomTextSize = isMobile ? 9 : 12;
  ctx.font = `${bottomTextSize}px "Courier New", monospace`;
  ctx.letterSpacing = isMobile ? '1px' : '2px';
  const bottomText = isMobile ? 'Tap START to begin' : 'Press START to begin your journey';
  ctx.fillText(bottomText, canvas.width / 2, canvas.height - (isMobile ? 20 : 30));
  
  // Armazena posição do botão para cliques
  window.startButton = { x: btnX, y: btnY, width: btnWidth, height: btnHeight };
}

function drawFileSelectScreen() {
  // Fundo preto
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const isMobile = window.isMobile;
  
  // Título SELECT FILE
  ctx.fillStyle = '#ffffff';
  const titleSize = isMobile ? 12 : 42;
  ctx.font = `bold ${titleSize}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff6b00';
  ctx.shadowOffsetX = isMobile ? 1 : 4;
  ctx.shadowOffsetY = isMobile ? 1 : 4;
  ctx.shadowBlur = 0;
  ctx.letterSpacing = isMobile ? '1px' : '6px';
  ctx.fillText('SELECT FILE', canvas.width / 2, isMobile ? 20 : 100);
  ctx.shadowColor = 'transparent';
  
  // Layout responsivo dos files
  let fileWidth, fileHeight, gap, startX, startY;
  
  if (isMobile) {
    // Mobile: apenas 2 files, ULTRA compactos
    fileWidth = Math.min(180, canvas.width * 0.75);
    fileHeight = 70;
    gap = 8;
    startX = (canvas.width - fileWidth) / 2;
    startY = 35;
  } else {
    // Desktop: 3 files em linha
    fileWidth = 350;
    fileHeight = 280;
    gap = 50;
    const totalWidth = (fileWidth * 3) + (gap * 2);
    startX = (canvas.width - totalWidth) / 2;
    startY = 180;
  }
  
  window.fileBoxes = []; // Para detecção de cliques
  
  // Filtra files: mobile mostra só 2, desktop mostra 3
  const filesToShow = isMobile ? saveFiles.slice(0, 2) : saveFiles;
  
  filesToShow.forEach((file, index) => {
    let x, y;
    
    if (isMobile) {
      // Empilhados verticalmente
      x = startX;
      y = startY + (index * (fileHeight + gap));
    } else {
      // Em linha horizontal
      x = startX + (index * (fileWidth + gap));
      y = startY;
    }
    
    // Armazena posição para cliques
    window.fileBoxes.push({ id: file.id, x, y, width: fileWidth, height: fileHeight });
    
    // Background e borda
    const isSelected = selectedFile === file.id;
    const isHovered = hoveredFile === file.id;
    const isClickable = file.id === 1;
    
    ctx.fillStyle = isSelected ? '#1a1a1a' : '#000000';
    ctx.fillRect(x, y, fileWidth, fileHeight);
    
    ctx.strokeStyle = isSelected ? '#ff6b00' : '#333333';
    ctx.lineWidth = isMobile ? 2 : 6;
    ctx.strokeRect(x, y, fileWidth, fileHeight);
    
    // Opacidade para files não clicáveis
    if (!isClickable) {
      ctx.globalAlpha = 0.4;
    }
    
    // Header com borda
    const headerPadding = isMobile ? 6 : 30;
    const headerY = isMobile ? 15 : 70;
    ctx.strokeStyle = isSelected ? '#ff6b00' : '#333333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + headerPadding, y + headerY);
    ctx.lineTo(x + fileWidth - headerPadding, y + headerY);
    ctx.stroke();
    
    // "FILE X"
    ctx.fillStyle = isSelected ? '#ff6b00' : '#ffffff';
    const fileTextSize = isMobile ? 9 : 24;
    ctx.font = `bold ${fileTextSize}px "Courier New", monospace`;
    ctx.textAlign = 'left';
    ctx.letterSpacing = isMobile ? '0px' : '2px';
    ctx.fillText(`FILE ${file.id}`, x + headerPadding, y + (isMobile ? 11 : 50));
    
    // Seta se selecionado
    if (isSelected) {
      ctx.fillStyle = '#ff6b00';
      ctx.font = `${isMobile ? 8 : 20}px "Courier New", monospace`;
      ctx.textAlign = 'right';
      ctx.fillText('►', x + fileWidth - headerPadding, y + (isMobile ? 11 : 50));
    }
    
    // Conteúdo do file
    if (file.exists) {
      let contentY = y + (isMobile ? 22 : 110);
      const contentPadding = isMobile ? 6 : 30;
      const labelSize = isMobile ? 6 : 14;
      const valueSize = isMobile ? 8 : 20;
      const spacing = isMobile ? 14 : 70;
      
      // NAME
      ctx.fillStyle = '#999999';
      ctx.font = `${labelSize}px "Courier New", monospace`;
      ctx.textAlign = 'left';
      ctx.letterSpacing = '0px';
      ctx.fillText('NAME', x + contentPadding, contentY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${valueSize}px "Courier New", monospace`;
      ctx.fillText(file.playerName, x + contentPadding, contentY + (isMobile ? 9 : 28));
      
      contentY += spacing;
      
      // TIME
      ctx.fillStyle = '#999999';
      ctx.font = `${labelSize}px "Courier New", monospace`;
      ctx.fillText('TIME', x + contentPadding, contentY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${valueSize}px "Courier New", monospace`;
      ctx.fillText(file.playtime, x + contentPadding, contentY + (isMobile ? 8 : 25));
      
      contentY += isMobile ? 13 : 60;
      
      // LOCATION
      ctx.fillStyle = '#999999';
      ctx.font = `${labelSize}px "Courier New", monospace`;
      ctx.fillText('LOCATION', x + contentPadding, contentY);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${valueSize}px "Courier New", monospace`;
      ctx.fillText(file.location, x + contentPadding, contentY + (isMobile ? 8 : 25));
    } else {
      // EMPTY
      ctx.fillStyle = '#333333';
      const emptySize = isMobile ? 10 : 24;
      ctx.font = `bold ${emptySize}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.letterSpacing = isMobile ? '1px' : '3px';
      ctx.fillText('EMPTY', x + fileWidth / 2, y + fileHeight / 2 + (isMobile ? 2 : 10));
    }
    
    ctx.globalAlpha = 1;
  });
  
  // Botões CONTINUE e BACK
  const lastFileY = isMobile 
    ? startY + (1 * (fileHeight + gap)) + fileHeight
    : startY + fileHeight;
  
  const btnY = lastFileY + (isMobile ? 12 : 70);
  const btnWidth = isMobile ? 85 : 250;
  const btnHeight = isMobile ? 28 : 70;
  const btnGap = isMobile ? 8 : 40;
  const continueX = canvas.width / 2 - btnWidth - btnGap / 2;
  const backX = canvas.width / 2 + btnGap / 2;
  
  // Botão CONTINUE
  const canContinue = selectedFile === 1;
  ctx.fillStyle = '#000000';
  ctx.fillRect(continueX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = canContinue ? '#00ff00' : '#333333';
  ctx.lineWidth = isMobile ? 2 : 5;
  ctx.strokeRect(continueX, btnY, btnWidth, btnHeight);
  
  ctx.fillStyle = canContinue ? '#00ff00' : '#666666';
  const btnTextSize = isMobile ? 8 : 20;
  ctx.font = `bold ${btnTextSize}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = isMobile ? '0px' : '2px';
  ctx.fillText('CONTINUE', continueX + btnWidth / 2, btnY + (isMobile ? 18 : 45));
  
  // Botão BACK
  ctx.fillStyle = '#000000';
  ctx.fillRect(backX, btnY, btnWidth, btnHeight);
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = isMobile ? 2 : 5;
  ctx.strokeRect(backX, btnY, btnWidth, btnHeight);
  
  ctx.fillStyle = '#ff0000';
  ctx.font = `bold ${btnTextSize}px "Courier New", monospace`;
  ctx.fillText('BACK', backX + btnWidth / 2, btnY + (isMobile ? 18 : 45));
  
  // Armazena posições dos botões
  window.continueButton = { x: continueX, y: btnY, width: btnWidth, height: btnHeight };
  window.backButton = { x: backX, y: btnY, width: btnWidth, height: btnHeight };
  
  // Texto inferior - só no desktop
  if (!isMobile) {
    ctx.fillStyle = '#666666';
    ctx.font = '12px "Courier New", monospace';
    ctx.letterSpacing = '2px';
    ctx.fillText('Click on FILE 1 to select • Continue your adventure', canvas.width / 2, canvas.height - 30);
  }
}

// ===== FUNÇÃO DE INICIALIZAÇÃO (será chamada depois) =====
function initStartScreenListeners() {
  // ===== CLIQUES NAS TELAS =====
  canvas.addEventListener('click', (e) => {
    if (currentScreen === "game") return; // Já está no jogo
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    // TELA DE TÍTULO
    if (currentScreen === "title" && window.startButton) {
      const btn = window.startButton;
      if (clickX >= btn.x && clickX <= btn.x + btn.width &&
          clickY >= btn.y && clickY <= btn.y + btn.height) {
        currentScreen = "fileSelect";
        loadSaveFiles(); // Carrega os saves
      }
    }
    
    // TELA DE FILE SELECT
    if (currentScreen === "fileSelect") {
      // Clique nos files
      if (window.fileBoxes) {
        window.fileBoxes.forEach(box => {
          if (box.id === 1 && // Só FILE 1 é clicável
              clickX >= box.x && clickX <= box.x + box.width &&
              clickY >= box.y && clickY <= box.y + box.height) {
            selectedFile = box.id;
          }
        });
      }
      
      // Botão CONTINUE
      if (window.continueButton && selectedFile === 1) {
        const btn = window.continueButton;
        if (clickX >= btn.x && clickX <= btn.x + btn.width &&
            clickY >= btn.y && clickY <= btn.y + btn.height) {
          
          // Carrega ou cria novo save
          const loaded = loadGame(1);
          if (!loaded) {
            createNewSave(1);
            loadGame(1);
          }
          
          currentScreen = "game";
          resizeCanvas(); // Atualiza canvas para o jogo
        }
      }
      
      // Botão BACK
      if (window.backButton) {
        const btn = window.backButton;
        if (clickX >= btn.x && clickX <= btn.x + btn.width &&
            clickY >= btn.y && clickY <= btn.y + btn.height) {
          currentScreen = "title";
          selectedFile = null;
        }
      }
    }
  });

  // ===== HOVER NOS FILES =====
  canvas.addEventListener('mousemove', (e) => {
    if (currentScreen !== "fileSelect") return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;
    
    hoveredFile = null;
    
    if (window.fileBoxes) {
      window.fileBoxes.forEach(box => {
        if (box.id === 1 && // Só FILE 1 é clicável
            mouseX >= box.x && mouseX <= box.x + box.width &&
            mouseY >= box.y && mouseY <= box.y + box.height) {
          hoveredFile = box.id;
          canvas.style.cursor = 'pointer';
          return;
        }
      });
    }
    
    // Hover nos botões
    let overButton = false;
    
    if (window.continueButton && selectedFile === 1) {
      const btn = window.continueButton;
      if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
          mouseY >= btn.y && mouseY <= btn.y + btn.height) {
        overButton = true;
      }
    }
    
    if (window.backButton) {
      const btn = window.backButton;
      if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
          mouseY >= btn.y && mouseY <= btn.y + btn.height) {
        overButton = true;
      }
    }
    
    if (window.startButton && currentScreen === "title") {
      const btn = window.startButton;
      if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
          mouseY >= btn.y && mouseY <= btn.y + btn.height) {
        overButton = true;
      }
    }
    
    canvas.style.cursor = (hoveredFile || overButton) ? 'pointer' : 'default';
  });
}