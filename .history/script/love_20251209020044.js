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

var loaded = false;

function init() {
  if (loaded) return;
  loaded = true;
  
  // Check screen size for optimizations
  var screenWidth = window.innerWidth;
  var isSmallPhone = screenWidth <= 480;
  var isNormalAndroid = screenWidth <= 600;
  
  var mobile = window.isDevice;
  var koef = mobile ? (isSmallPhone ? 0.5 : 0.6) : 1;
  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  
  var width = canvas.width = koef * innerWidth;
  var height = canvas.height = koef * innerHeight;
  
  // Scale canvas for display
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  
  var rand = Math.random;

  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, width, height);

  function drawText() {
    // Adjust font size based on screen width
    var fontSize;
    if (isSmallPhone) {
      fontSize = "28px"; // Small phones
    } else if (isNormalAndroid) {
      fontSize = "36px"; // Normal Android phones
    } else {
      fontSize = "48px"; // Desktop/Tablet
    }
    
    ctx.font = `bold ${fontSize} 'Roboto', Arial, sans-serif`;
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Adjust text position based on screen height
    var textY;
    if (window.innerHeight < 600) {
      textY = height / 2.2 + 250; // Short screens
    } else if (window.innerHeight < 700) {
      textY = height / 2.2 + 300; // Medium screens
    } else {
      textY = height / 2.2 + 400; // Tall screens
    }
    
    // Draw text with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText("I Love You Favour", width / 2, textY);
    
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

  // Resize handler
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
      
      if (typeof window.resizeHearts === 'function') {
        window.resizeHearts();
      }
    }, 150);
  });

  // Adjust settings based on screen size
  var traceCount;
  if (isSmallPhone) {
    traceCount = 10; // Small phones
  } else if (isNormalAndroid) {
    traceCount = 15; // Normal Android
  } else {
    traceCount = mobile ? 20 : 50; // Desktop
  }
  
  var pointsOrigin = [];
  var dr = mobile ? 0.3 : 0.1;
  
  // Adjust heart scale based on screen size
  var heartScale = isSmallPhone ? 0.6 : (isNormalAndroid ? 0.8 : 1);
  
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
  // Adjust particle count based on screen size
  var particleCount;
  if (isSmallPhone) {
    particleCount = Math.floor(heartPointsCount * 0.4); // Fewer for small phones
  } else if (isNormalAndroid) {
    particleCount = Math.floor(heartPointsCount * 0.6); // Moderate for normal Android
  } else {
    particleCount = heartPointsCount; // Full for desktop
  }
  
  for (var i = 0; i < particleCount; i++) {
    var x = rand() * width;
    var y = rand() * height;
    e[i] = {
      vx: 0,
      vy: 0,
      R: isSmallPhone ? 1 : (isNormalAndroid ? 1.5 : 2),
      speed: rand() + (isSmallPhone ? 2 : (isNormalAndroid ? 3 : 5)),
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + (isSmallPhone ? 0.5 : (isNormalAndroid ? 0.6 : 0.7)),
      f: isSmallPhone ? "rgba(255, 64, 129, 0.5)" : "rgba(255, 64, 129, 0.7)",
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  }

  // Adjust animation speed based on screen size
  var config = { 
    traceK: isSmallPhone ? 0.2 : (isNormalAndroid ? 0.3 : 0.4),
    timeDelta: isSmallPhone ? 0.3 : (isNormalAndroid ? 0.4 : 0.6)
  };
  var time = 0;

  function loop() {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    // Background fade
    ctx.fillStyle = isSmallPhone ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.1)";
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
  
  window.pauseHearts = function() {};
  window.resumeHearts = function() {};

  loop();
}

// Load after DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(init, 300);
});