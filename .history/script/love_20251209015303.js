window.requestAnimationFrame =
  window.__requestAnimationFrame ||
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (function () {
    return function (callback, element) {
      var lastTime = element.__lastTime || 0;
      var currTime = Date.now();
      var timeToCall = Math.max(1, 33 - (currTime - lastTime));
      window.setTimeout(callback, timeToCall);
      element.__lastTime = currTime + timeToCall;
    };
  })();

window.isDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
  (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
);

// Added Android-specific detection
window.isAndroid = /android/i.test(navigator.userAgent.toLowerCase());

var loaded = false;

function init() {
  if (loaded) return;
  loaded = true;
  
  var mobile = window.isDevice;
  var isAndroid = window.isAndroid;
  
  // Adjust koef for Android 150% zoom
  var koef = mobile ? (isAndroid ? 0.6 : 0.5) : 1;
  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  
  // Handle high DPI displays (150% zoom)
  var dpi = window.devicePixelRatio || 1;
  if (isAndroid && dpi > 1.5) {
    koef = koef * (1.5 / dpi); // Adjust for 150% zoom
  }
  
  var width = canvas.width = koef * innerWidth;
  var height = canvas.height = koef * innerHeight;
  
  // Scale canvas for high DPI
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  
  var rand = Math.random;

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  function drawText() {
    // Adjust font size for Android and 150% zoom
    var fontSize = isAndroid ? "48px" : "60px";
    if (window.innerWidth < 480) {
      fontSize = "36px";
    }
    if (window.innerWidth < 360) {
      fontSize = "28px";
    }
    
    ctx.font = `bold ${fontSize} 'Roboto', Arial, sans-serif`;
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Adjust text position for different screens
    var textY = height / 2.2 + 400;
    if (isAndroid && window.innerHeight < 700) {
      textY = height / 2.2 + 300;
    }
    
    // Draw text with shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Changed from "I Love You Mitchelle" to "I Love You Favour"
    ctx.fillText("I Love You Favour", width / 2, textY);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }

  function heartPosition(rad) {
    return [
      Math.pow(Math.sin(rad), 3),
      -(
        15 * Math.cos(rad) -
        5 * Math.cos(2 * rad) -
        2 * Math.cos(3 * rad) -
        Math.cos(4 * rad)
      ),
    ];
  }

  function scaleAndTranslate(pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
  }

  // Enhanced resize handler for Android
  let resizeTimeout;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      width = canvas.width = koef * innerWidth;
      height = canvas.height = koef * innerHeight;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, height);
      
      // Redraw hearts with new dimensions
      if (typeof window.resizeHearts === 'function') {
        window.resizeHearts();
      }
    }, 150);
  });

  // Adjust trace count for Android performance
  var traceCount = mobile ? (isAndroid ? 15 : 20) : 50;
  var pointsOrigin = [];
  var dr = mobile ? (isAndroid ? 0.4 : 0.3) : 0.1;
  
  // Adjust heart sizes for Android
  var heartScale = isAndroid ? 0.8 : 1;
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 310 * heartScale, 19 * heartScale, 0, 0));
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 250 * heartScale, 15 * heartScale, 0, 0));
  for (var i = 0; i < Math.PI * 2; i += dr)
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 190 * heartScale, 11 * heartScale, 0, 0));

  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  function pulse(kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + width / 2,
        ky * pointsOrigin[i][1] + height / 2.2,
      ];
    }
  }

  var e = [];
  // Fewer particles for Android performance
  var particleCount = isAndroid ? Math.floor(heartPointsCount * 0.7) : heartPointsCount;
  
  for (var i = 0; i < particleCount; i++) {
    var x = rand() * width;
    var y = rand() * height;
    e[i] = {
      vx: 0,
      vy: 0,
      R: isAndroid ? 1.5 : 2, // Smaller dots for Android
      speed: rand() + (isAndroid ? 3 : 5),
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + (isAndroid ? 0.6 : 0.7),
      f: "rgba(255, 64, 129, " + (isAndroid ? "0.6" : "0.7") + ")",
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  }

  // Adjust config for Android performance
  var config = { 
    traceK: isAndroid ? 0.3 : 0.4, 
    timeDelta: isAndroid ? 0.4 : 0.6 
  };
  var time = 0;

  function loop() {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    // Slightly more opaque background for Android visibility
    ctx.fillStyle = isAndroid ? "rgba(0,0,0,.15)" : "rgba(0,0,0,.1)";
    ctx.fillRect(0, 0, width, height);

    for (var i = e.length; i--; ) {
      var u = e[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);

      if (length < 10) {
        if (rand() > 0.95) {
          u.q = ~~(rand() * heartPointsCount);
        } else {
          if (rand() > 0.99) u.D *= -1;
          u.q = (u.q + u.D) % heartPointsCount;
          if (u.q < 0) u.q += heartPointsCount;
        }
      }

      u.vx += (-dx / length) * u.speed;
      u.vy += (-dy / length) * u.speed;
      u.trace[0].x += u.vx;
      u.trace[0].y += u.vy;
      u.vx *= u.force;
      u.vy *= u.force;

      for (var k = 0; k < u.trace.length - 1; k++) {
        var T = u.trace[k];
        var N = u.trace[k + 1];
        N.x -= config.traceK * (N.x - T.x);
        N.y -= config.traceK * (N.y - T.y);
      }

      ctx.fillStyle = u.f;
      // Draw smaller rectangles for Android
      ctx.fillRect(u.trace[0].x, u.trace[0].y, u.R, u.R);
    }

    drawText();
    window.requestAnimationFrame(loop, canvas);
  }

  // Expose functions for external control
  window.resizeHearts = function() {
    width = canvas.width = koef * innerWidth;
    height = canvas.height = koef * innerHeight;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  };
  
  window.pauseHearts = function() {
    // No actual pause, but could be implemented
  };
  
  window.resumeHearts = function() {
    // Resume animation
  };

  loop();
}

// Android-specific DOMContentLoaded handling
if (window.isAndroid) {
  document.addEventListener('DOMContentLoaded', function() {
    // Small delay for Android to ensure proper rendering
    setTimeout(init, 300);
  });
} else {
  document.addEventListener("DOMContentLoaded", init);
}