/* ==========================================================================
   canvas.js — анимация на элементе <canvas id="myCanvas">
   три движущихся мяча и анимированная разметка поля.
   ========================================================================== */

function initCanvas() {
    var canvas = document.getElementById("myCanvas");
    if (!canvas || !canvas.getContext) {
        return;
    }

    var ctx = canvas.getContext("2d");
    var balls = [
        { x: 60, y: 60, vx: 2.4, vy: 1.8, r: 18, color: "#4A9BE0" },
        { x: 180, y: 110, vx: -1.9, vy: 2.3, r: 13, color: "#A9C6EE" },
        { x: 120, y: 165, vx: 2.1, vy: -1.6, r: 10, color: "#FFFFFF" }
    ];

    var W = canvas.width;
    var H = canvas.height;
    var frame = 0;

    function drawField() {
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "#2F5D8A";
        ctx.fillRect(0, 0, W, H);

        /* Разметка: центральный круг и две линии */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, 52, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W / 2, 0);
        ctx.lineTo(W / 2, H);
        ctx.stroke();

        /* Мячи */
        for (var i = 0; i < balls.length; i++) {
            var b = balls[i];
            b.x += b.vx;
            b.y += b.vy;

            if (b.x - b.r < 0) { b.x = b.r; b.vx = -b.vx; }
            if (b.x + b.r > W) { b.x = W - b.r; b.vx = -b.vx; }
            if (b.y - b.r < 0) { b.y = b.r; b.vy = -b.vy; }
            if (b.y + b.r > H) { b.y = H - b.r; b.vy = -b.vy; }

            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Счётчик кадров анимации */
        frame++;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = "13px Montserrat, Arial, sans-serif";
        ctx.fillText("кадр: " + frame, 12, 20);
    }

    drawField();
    window.setInterval(drawField, 40);
}

/* ------------------------------- Звуковые сигналы на главной странице --- */
function initCanvasSound() {
    var sfx = document.getElementById("sfx");
    var playBtn = document.getElementById("sfx-play");

    if (sfx && playBtn) {
        playBtn.addEventListener("click", function () {
            if (sfx.paused) {
                var promise = sfx.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        /* Браузер запретил автозапуск — играем вручную */
                    });
                }
                playBtn.innerHTML = "&#10073;&#10073;";
                playBtn.setAttribute("aria-label", "Остановить свисток");
            } else {
                sfx.pause();
                sfx.currentTime = 0;
                playBtn.innerHTML = "&#9654;";
                playBtn.setAttribute("aria-label", "Воспроизвести свисток");
            }
        });

        sfx.addEventListener("ended", function () {
            playBtn.innerHTML = "&#9654;";
            playBtn.setAttribute("aria-label", "Воспроизвести свисток");
        });
    }

    var startBtn = document.getElementById("start-signal");
    var startAudio = document.getElementById("sfx-start");

    if (startBtn && startAudio) {
        startBtn.addEventListener("click", function () {
            startAudio.currentTime = 0;
            var promise = startAudio.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    /* Игнорируем отказ автозапуска */
                });
            }
        });
    }
}
