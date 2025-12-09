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
  
  // Get screen dimensions
  var screenWidth = window.innerWidth;
  var screenHeight = window.innerHeight;
  var isSmallPhone = screenWidth <= 480;
  var isNormalAndroid = screenWidth <= 600;
  
  var mobile = window.isDevice;
  var canvas = document.getElementById("heart");
  var ctx = canvas.getContext("2d");
  
  // Set canvas to full screen
  canvas.width = screenWidth;
  canvas.height = screenHeight;
  canvas.style.width = screenWidth + 'px';
  canvas.style.height = screenHeight + 'px';
  
  var rand = Math.random;

  // Fill background with black
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function drawText() {
    // Adjust font size based on screen width
    var fontSize;
    if (isSmallPhone) {
      fontSize = "28px"; // Good for small phones
    } else if (isNormalAndroid) {
      fontSize = "36px"; // Normal Android phones
    } else {
      fontSize = "48px"; // Desktop/Tablet
    }
    
    ctx.font = `bold ${fontSize} 'Roboto', Arial, sans-serif`;
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Position text at bottom 20% of screen
    var textY = screenHeight * 0.85;
    
    // Draw text with shadow for visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText("I Love You Favour", screenWidth / 2, textY);
    
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
      screenWidth = window.innerWidth;
      screenHeight = window.innerHeight;
      canvas.width = screenWidth;
      canvas.height = screenHeight;
      canvas.style.width = screenWidth + 'px';
      canvas.style.height = screenHeight + 'px';
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (typeof window.resizeHearts === 'function') {
        window.resizeHearts();
      }
    }, 150);
  });

  // Adjust trace count for performance
  var traceCount;
  if (isSmallPhone) {
    traceCount = 12; // Balanced for small phones
  } else if (isNormalAndroid) {
    traceCount = 15; // Normal Android
  } else {
    traceCount = 20; // Desktop/Tablet
  }
  
  var pointsOrigin = [];
  var dr = 0.15; // Good balance between smoothness and performance
  
  // Calculate heart size based on screen width (so it fits perfectly)
  var heartSize;
  if (isSmallPhone) {
    heartSize = screenWidth * 0.3; // 30% of screen width for small phones
  } else if (isNormalAndroid) {
    heartSize = screenWidth * 0.4; // 40% for normal Android
  } else {
    heartSize = screenWidth * 0.5; // 50% for desktop
  }
  
  // Ensure heart is not too big for very wide screens
  var maxHeartSize = screenHeight * 0.6;
  if (heartSize > maxHeartSize) {
    heartSize = maxHeartSize;
  }
  
  // Create perfectly sized hearts
  var baseSize = 350; // Original heart size reference
  var scaleFactor = heartSize / baseSize;
  
  // Create 3 concentric hearts for depth
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 
      350 * scaleFactor, 
      25 * scaleFactor, 
      0, 0));
  }
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 
      280 * scaleFactor, 
      20 * scaleFactor, 
      0, 0));
  }
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 
      210 * scaleFactor, 
      15 * scaleFactor, 
      0, 0));
  }

  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  function pulse(kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      // Center the heart on screen
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + screenWidth / 2,
        ky * pointsOrigin[i][1] + screenHeight / 2.2, // Center vertically
      ];
    }
  }

  var e = [];
  // Adjust particle count for performance
  var particleCount;
  if (isSmallPhone) {
    particleCount = Math.floor(heartPointsCount * 0.6); // 60% for small phones
  } else if (isNormalAndroid) {
    particleCount = Math.floor(heartPointsCount * 0.8); // 80% for normal Android
  } else {
    particleCount = heartPointsCount; // 100% for desktop
  }
  
  // Create particles with better visibility
  for (var i = 0; i < particleCount; i++) {
    var x = rand() * screenWidth;
    var y = rand() * screenHeight;
    
    // Adjust particle size based on screen
    var particleSize;
    if (isSmallPhone) {
      particleSize = 2.5;
    } else if (isNormalAndroid) {
      particleSize = 3;
    } else {
      particleSize = 3.5;
    }
    
    e[i] = {
      vx: 0,
      vy: 0,
      R: particleSize,
      speed: rand() + 4,
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      // Bright pink colors for visibility
      f: i % 3 === 0 ? "rgba(255, 64, 129, 0.9)" : 
         i % 3 === 1 ? "rgba(255, 107, 158, 0.9)" : 
                       "rgba(255, 150, 197, 0.9)",
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  }

  // Good animation speed
  var config = { 
    traceK: 0.35,
    timeDelta: 0.4
  };
  var time = 0;

  function loop() {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    // Gentle background fade
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    for (var i = e.length; i--; ) {
      var u = e[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);

      if (length < 12) {
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

      // Draw all trace particles for better visibility
      for (var t = 0; t < u.trace.length; t++) {
        var trace = u.trace[t];
        // Fade trail effect
        var alpha = 0.9 * (1 - t / u.trace.length);
        var size = u.R * (1 - t / (u.trace.length * 1.5));
        
        ctx.fillStyle = u.f.replace('0.9', alpha.toString());
        ctx.fillRect(trace.x, trace.y, size, size);
      }
    }

    drawText();
    window.requestAnimationFrame(loop, canvas);
  }

  // Expose resize function
  window.resizeHearts = function() {
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    canvas.style.width = screenWidth + 'px';
    canvas.style.height = screenHeight + 'px';
  };

  // Start with initial pulse
  setTimeout(() => {
    pulse(1, 1);
  }, 100);

  loop();
}

// Load after DOM is ready
document.addEventListener("DOMContentLoaded", function() {
  setTimeout(init, 300);
});