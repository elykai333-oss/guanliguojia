/* =========================================================
   国家游戏
   第一阶段：2D地图 + 国家资料 + 人口调整 + 菜单
========================================================= */

const canvas = document.getElementById("gameMap");
const ctx = canvas.getContext("2d");

/* =========================================================
   游戏基本资料
========================================================= */

const GAME = {
  mapWidth: 500,
  mapHeight: 500,
  cellSize: 24,

  population: 6000,

  food: 50,
  silver: 10,
  gold: 0,

  territory: 10,
  countryHp: 10000,

  farmers: 0,
  soldiers: 0,
  miners: 0
};

/*
  你的10 km²初始领土。
  这里暂时放在地图中央，方便测试地图。
  以后联网后由服务器决定真正位置。
*/
const countryCells = new Map();

/*
  每个占领格子的资料：
  type:
  palace = 皇宫
  farm = 农田
  training = 训练营
  empty = 空地
*/

function cellKey(x, y) {
  return `${x},${y}`;
}

/* =========================================================
   创建初始10个格子
========================================================= */

function createStartingTerritory() {

  countryCells.clear();

  const startX = 245;
  const startY = 245;

  /*
    10个格子。

    这里只是地图上的初始位置。
    以后连接 Firebase 后，
    这里会由服务器保存。
  */

  const positions = [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],

    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1]
  ];

  positions.forEach(([x, y], index) => {

    let type = "empty";

    /*
      第一个格子是皇宫。
    */
    if (index === 0) {
      type = "palace";
    }

    countryCells.set(
      cellKey(startX + x, startY + y),
      {
        x: startX + x,
        y: startY + y,
        type: type,
        country: "player"
      }
    );
  });
}

/* =========================================================
   Canvas大小
========================================================= */

function resizeCanvas() {

  /*
    地图逻辑大小仍然是500×500格。
    Canvas只显示其中适合屏幕的区域。
  */

  canvas.width = 600;
  canvas.height = 600;

  drawMap();
}

resizeCanvas();

/* =========================================================
   绘制地图
========================================================= */

function drawMap() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /*
    当前先显示地图的一部分。
    每格24像素。
  */

  const visibleCellsX = Math.floor(canvas.width / GAME.cellSize);
  const visibleCellsY = Math.floor(canvas.height / GAME.cellSize);

  /*
    暂时显示地图中央区域。
  */

  const startMapX = 238;
  const startMapY = 238;

  /* ---------- 荒地 ---------- */

  ctx.fillStyle = "#c7c7c7";
  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  /* ---------- 地图网格 ---------- */

  ctx.strokeStyle = "#a7a7a7";
  ctx.lineWidth = 0.5;

  for (let x = 0; x <= visibleCellsX; x++) {

    const px = x * GAME.cellSize;

    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= visibleCellsY; y++) {

    const py = y * GAME.cellSize;

    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }

  /* ---------- 玩家领土 ---------- */

  countryCells.forEach(cell => {

    const drawX =
      (cell.x - startMapX) * GAME.cellSize;

    const drawY =
      (cell.y - startMapY) * GAME.cellSize;

    /*
      领土颜色
    */

    ctx.fillStyle = "#8fcf78";

    ctx.fillRect(
      drawX + 1,
      drawY + 1,
      GAME.cellSize - 2,
      GAME.cellSize - 2
    );

    /*
      每个占领格子的墙
    */

    ctx.strokeStyle = "#52734a";
    ctx.lineWidth = 2;

    ctx.strokeRect(
      drawX + 1,
      drawY + 1,
      GAME.cellSize - 2,
      GAME.cellSize - 2
    );

    /*
      绘制建筑/图标
    */

    drawCellObject(
      cell,
      drawX,
      drawY
    );
  });
}

/* =========================================================
   绘制格子里的2D图形
========================================================= */

function drawCellObject(cell, x, y) {

  const centerX =
    x + GAME.cellSize / 2;

  const centerY =
    y + GAME.cellSize / 2;

  /* ---------- 皇宫 ---------- */

  if (cell.type === "palace") {

    /*
      简单皇宫：
      屋顶 + 建筑 + 小旗子
    */

    ctx.fillStyle = "#d8b34a";

    ctx.beginPath();

    ctx.moveTo(
      centerX - 8,
      centerY - 5
    );

    ctx.lineTo(
      centerX,
      centerY - 13
    );

    ctx.lineTo(
      centerX + 8,
      centerY - 5
    );

    ctx.closePath();

    ctx.fill();

    ctx.fillStyle = "#eee4c2";

    ctx.fillRect(
      centerX - 7,
      centerY - 5,
      14,
      11
    );

    ctx.fillStyle = "#79552e";

    ctx.fillRect(
      centerX - 2,
      centerY + 1,
      4,
      5
    );

    /*
      旗杆
    */

    ctx.strokeStyle = "#4d3925";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      centerX,
      centerY - 13
    );

    ctx.lineTo(
      centerX,
      centerY - 17
    );

    ctx.stroke();

    ctx.fillStyle = "#d34b3f";

    ctx.beginPath();

    ctx.moveTo(
      centerX,
      centerY - 17
    );

    ctx.lineTo(
      centerX + 5,
      centerY - 15
    );

    ctx.lineTo(
      centerX,
      centerY - 13
    );

    ctx.closePath();

    ctx.fill();

    return;
  }

  /* ---------- 农田 ---------- */

  if (cell.type === "farm") {

    ctx.fillStyle = "#9b7042";

    ctx.fillRect(
      x + 3,
      y + 7,
      GAME.cellSize - 6,
      GAME.cellSize - 10
    );

    ctx.strokeStyle = "#d0a66c";
    ctx.lineWidth = 1;

    for (let i = 0; i < 3; i++) {

      const lineY =
        y + 9 + i * 4;

      ctx.beginPath();

      ctx.moveTo(
        x + 4,
        lineY
      );

      ctx.lineTo(
        x + GAME.cellSize - 4,
        lineY
      );

      ctx.stroke();
    }

    /*
      小植物
    */

    ctx.fillStyle = "#3f8d3d";

    ctx.beginPath();

    ctx.arc(
      centerX,
      y + 8,
      3,
      0,
      Math.PI * 2
    );

    ctx.fill();

    return;
  }

  /* ---------- 训练营 ---------- */

  if (cell.type === "training") {

    ctx.fillStyle = "#b86f42";

    ctx.fillRect(
      x + 4,
      y + 8,
      GAME.cellSize - 8,
      GAME.cellSize - 7
    );

    /*
      训练营屋顶
    */

    ctx.fillStyle = "#70432f";

    ctx.beginPath();

    ctx.moveTo(
      x + 3,
      y + 8
    );

    ctx.lineTo(
      centerX,
      y + 2
    );

    ctx.lineTo(
      x + GAME.cellSize - 3,
      y + 8
    );

    ctx.closePath();

    ctx.fill();

    /*
      旗帜
    */

    ctx.strokeStyle = "#44362c";
    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      centerX,
      y + 3
    );

    ctx.lineTo(
      centerX,
      y - 1
    );

    ctx.stroke();

    ctx.fillStyle = "#4d75b8";

    ctx.beginPath();

    ctx.moveTo(
      centerX,
      y - 1
    );

    ctx.lineTo(
      centerX + 4,
      y + 1
    );

    ctx.lineTo(
      centerX,
      y + 3
    );

    ctx.closePath();

    ctx.fill();

    return;
  }

  /* ---------- 空地 ---------- */

  ctx.fillStyle = "#a9d294";

  ctx.beginPath();

  ctx.arc(
    centerX,
    centerY,
    3,
    0,
    Math.PI * 2
  );

  ctx.fill();
}

/* =========================================================
   点击地图
========================================================= */

canvas.addEventListener("click", function(event) {

  const rect =
    canvas.getBoundingClientRect();

  const scaleX =
    canvas.width / rect.width;

  const scaleY =
    canvas.height / rect.height;

  const mouseX =
    (event.clientX - rect.left) * scaleX;

  const mouseY =
    (event.clientY - rect.top) * scaleY;

  const mapCellX =
    Math.floor(mouseX / GAME.cellSize) + 238;

  const mapCellY =
    Math.floor(mouseY / GAME.cellSize) + 238;

  const cell =
    countryCells.get(
      cellKey(mapCellX, mapCellY)
    );

  if (!cell) {

    alert(
      "这是荒地。\n\n" +
      "每个格子 = 1 km²"
    );

    return;
  }

  let text =
    "这个格子属于你的国家。\n\n";

  if (cell.type === "palace") {

    text +=
      "🏰 皇宫\n" +
      "国家皇宫所在地。";

  } else if (cell.type === "farm") {

    text +=
      "🌱 农田";

  } else if (cell.type === "training") {

    text +=
      "🏕️ 训练营";

  } else {

    text +=
      "⬜ 空地";
  }

  alert(text);
});

/* =========================================================
   更新顶部资源
========================================================= */

function updateResourceDisplay() {

  document.getElementById(
    "population"
  ).textContent =
    GAME.population;

  document.getElementById(
    "food"
  ).textContent =
    formatNumber(GAME.food);

  document.getElementById(
    "silver"
  ).textContent =
    formatNumber(GAME.silver);

  document.getElementById(
    "gold"
  ).textContent =
    formatNumber(GAME.gold);

  document.getElementById(
    "territory"
  ).textContent =
    GAME.territory;

  document.getElementById(
    "countryHp"
  ).textContent =
    GAME.countryHp;

  document.getElementById(
    "farmers"
  ).textContent =
    GAME.farmers;

  document.getElementById(
    "soldiers"
  ).textContent =
    GAME.soldiers;

  document.getElementById(
    "miners"
  ).textContent =
    GAME.miners;
}

/* =========================================================
   数字显示
========================================================= */

function formatNumber(number) {

  return Number(number).toLocaleString(
    "zh-CN"
  );
}

/* =========================================================
   人口调整窗口
========================================================= */

function openAdjustmentWindow(
  largeMode = false
) {

  const old = document.getElementById(
    "adjustmentWindow"
  );

  if (old) {
    old.remove();
  }

  const overlay =
    document.createElement("div");

  overlay.id =
    "adjustmentWindow";

  overlay.style.position =
    "fixed";

  overlay.style.left =
    "0";

  overlay.style.top =
    "0";

  overlay.style.width =
    "100%";

  overlay.style.height =
    "100%";

  overlay.style.background =
    "rgba(0,0,0,0.55)";

  overlay.style.zIndex =
    "500";

  overlay.style.display =
    "flex";

  overlay.style.alignItems =
    "center";

  overlay.style.justifyContent =
    "center";

  const box =
    document.createElement("div");

  box.style.width =
    "min(92vw, 420px)";

  box.style.maxHeight =
    "90vh";

  box.style.overflow =
    "auto";

  box.style.padding =
    "20px";

  box.style.background =
    "#f8f6e9";

  box.style.borderRadius =
    "18px";

  box.style.border =
    "3px solid #68765d";

  box.style.boxShadow =
    "0 10px 35px rgba(0,0,0,0.4)";

  const title =
    document.createElement("h2");

  title.textContent =
    largeMode
      ? "👥 大幅调整"
      : "👥 人口调整";

  box.appendChild(title);

  const info =
    document.createElement("p");

  if (largeMode) {

    info.textContent =
      "直接输入调整后的最终人数。";

  } else {

    info.textContent =
      "人数必须以100人为单位。";
  }

  box.appendChild(info);

  const fields = [];

  function createField(
    label,
    value
  ) {

    const wrapper =
      document.createElement("div");

    wrapper.style.margin =
      "12px 0";

    const labelElement =
      document.createElement("label");

    labelElement.textContent =
      label;

    labelElement.style.display =
      "block";

    labelElement.style.fontWeight =
      "bold";

    labelElement.style.marginBottom =
      "5px";

    const input =
      document.createElement("input");

    input.type =
      "number";

    input.min =
      "0";

    input.step =
      "100";

    input.value =
      value;

    input.style.width =
      "100%";

    input.style.padding =
      "10px";

    input.style.fontSize =
      "16px";

    input.style.border =
      "2px solid #b8c2ad";

    input.style.borderRadius =
      "8px";

    wrapper.appendChild(
      labelElement
    );

    wrapper.appendChild(
      input
    );

    box.appendChild(
      wrapper
    );

    fields.push(input);
  }

  createField(
    "🌾 农民",
    GAME.farmers
  );

  createField(
    "🪖 士兵",
    GAME.soldiers
  );

  createField(
    "⛏️ 矿工",
    GAME.miners
  );

  const buttons =
    document.createElement("div");

  const confirm =
    document.createElement("button");

  confirm.textContent =
    "确定";

  confirm.onclick =
    function () {

      const farmers =
        Number(fields[0].value);

      const soldiers =
        Number(fields[1].value);

      const miners =
        Number(fields[2].value);

      if (
        farmers < 0 ||
        soldiers < 0 ||
        miners < 0
      ) {

        alert(
          "人数不能小于0。"
        );

        return;
      }

      if (
        farmers % 100 !== 0 ||
        soldiers % 100 !== 0 ||
        miners % 100 !== 0
      ) {

        alert(
          "农民、士兵、矿工都必须以100人为单位。"
        );

        return;
      }

      const total =
        farmers +
        soldiers +
        miners;

      if (
        total !== GAME.population
      ) {

        alert(
          "三种职业人数总和必须等于当前人口：" +
          GAME.population
        );

        return;
      }

      GAME.farmers =
        farmers;

      GAME.soldiers =
        soldiers;

      GAME.miners =
        miners;

      updateResourceDisplay();

      overlay.remove();
    };

  const cancel =
    document.createElement("button");

  cancel.textContent =
    "取消";

  cancel.onclick =
    function () {
      overlay.remove();
    };

  buttons.appendChild(
    confirm
  );

  buttons.appendChild(
    cancel
  );

  box.appendChild(
    buttons
  );

  overlay.appendChild(
    box
  );

  document.body.appendChild(
    overlay
  );
}

/* =========================================================
   大幅调整
========================================================= */

document.getElementById(
  "adjustBtn"
).addEventListener(
  "click",
  function () {

    openAdjustmentWindow(
      false
    );
  }
);

document.getElementById(
  "largeAdjustBtn"
).addEventListener(
  "click",
  function () {

    openAdjustmentWindow(
      true
    );
  }
);

/* =========================================================
   …菜单
========================================================= */

const menu =
  document.getElementById(
    "menu"
  );

const menuButton =
  document.getElementById(
    "menuButton"
  );

menuButton.addEventListener(
  "click",
  function () {

    menu.classList.toggle(
      "hidden"
    );
  }
);

document.getElementById(
  "closeMenu"
).addEventListener(
  "click",
  function () {

    menu.classList.add(
      "hidden"
    );
  }
);

/* =========================================================
   小游戏菜单
========================================================= */

const miniGameMenu =
  document.getElementById(
    "miniGameMenu"
  );

document.getElementById(
  "miniGameButton"
).addEventListener(
  "click",
  function () {

    menu.classList.add(
      "hidden"
    );

    miniGameMenu.classList.remove(
      "hidden"
    );
  }
);

document.getElementById(
  "closeMiniGames"
).addEventListener(
  "click",
  function () {

    miniGameMenu.classList.add(
      "hidden"
    );
  }
);

/* =========================================================
   目前三个小游戏入口
========================================================= */

document.getElementById(
  "farmGameButton"
).addEventListener(
  "click",
  function () {

    alert(
      "🌱 农田小游戏\n\n" +
      "下一阶段加入完整玩法。\n" +
      "种好1棵 → +500 g 银"
    );
  }
);

document.getElementById(
  "alchemyGameButton"
).addEventListener(
  "click",
  function () {

    alert(
      "⛏️ 石头炼金\n\n" +
      "下一阶段加入完整玩法。\n" +
      "炼好1颗 → +1 kg 银"
    );
  }
);

document.getElementById(
  "pushGameButton"
).addEventListener(
  "click",
  function () {

    alert(
      "⚔️ 兵种对推\n\n" +
      "下一阶段加入你提供的完整小游戏。\n" +
      "赢1局 → +2 kg 银"
    );
  }
);

/* =========================================================
   国家资料按钮
========================================================= */

document.getElementById(
  "countryInfoButton"
).addEventListener(
  "click",
  function () {

    menu.classList.add(
      "hidden"
    );

        const foodProduction =
      GAME.farmers * 0.2;

    const foodConsumption =
      GAME.population * 0.1;

    const foodNet =
      foodProduction - foodConsumption;

    const silverProduction =
      GAME.miners * 0.01;

    alert(
      "🏰 国家资料\n\n" +
      "人口：" +
      GAME.population +
      "\n" +
      "领土：" +
      GAME.territory +
      " km²\n" +
      "国家 HP：" +
      GAME.countryHp +
      "\n\n" +

      "🌾 农民：" +
      GAME.farmers +
      "\n" +
      "🪖 士兵：" +
      GAME.soldiers +
      "\n" +
      "⛏️ 矿工：" +
      GAME.miners +
      "\n\n" +

      "📊 每日计算\n" +
      "粮食生产：" +
      formatNumber(foodProduction) +
      " kg\n" +
      "粮食消耗：" +
      formatNumber(foodConsumption) +
      " kg\n" +
      "粮食净变化：" +
      formatNumber(foodNet) +
      " kg\n" +
      "白银生产：" +
      formatNumber(silverProduction) +
      " kg"
    );
  }
);

/* =========================================================
   商店按钮
========================================================= */

document.getElementById(
  "shopButton"
).addEventListener(
  "click",
  function () {

    menu.classList.add(
      "hidden"
    );

    alert(
      "🛒 商店\n\n" +
      "商店功能将在后续加入。"
    );
  }
);

/* =========================================================
   初始化
========================================================= */

createStartingTerritory();

updateResourceDisplay();

drawMap();

console.log(
  "国家游戏第一阶段已启动。"
);
