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
      fontSize = "32px"; // Slightly larger for small phones
    } else if (isNormalAndroid) {
      fontSize = "40px"; // Normal Android phones
    } else {
      fontSize = "52px"; // Desktop/Tablet
    }
    
    ctx.font = `bold ${fontSize} 'Roboto', Arial, sans-serif`;
    ctx.fillStyle = "#ff4081";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Adjust text position - keep it visible
    var textY = screenHeight * 0.8; // Position text at bottom 20% of screen
    
    // Draw text with better shadow for visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Draw text multiple times for better visibility
    ctx.fillText("I Love You Favour", screenWidth / 2, textY);
    
    // Add glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 64, 129, 0.5)';
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (typeof window.resizeHearts === 'function') {
        window.resizeHearts();
      }
    }, 150);
  });

  // Adjust settings for better visibility
  var traceCount;
  if (isSmallPhone) {
    traceCount = 15; // More traces for visibility
  } else if (isNormalAndroid) {
    traceCount = 20; // Normal Android
  } else {
    traceCount = 30; // Desktop/Tablet
  }
  
  var pointsOrigin = [];
  var dr = 0.1; // More points for smoother heart
  
  // Adjust heart scale for better visibility on all screens
  var heartScale;
  if (isSmallPhone) {
    heartScale = 1.2; // Larger for small screens
  } else if (isNormalAndroid) {
    heartScale = 1.5; // Normal Android
  } else {
    heartScale = 1.8; // Desktop
  }
  
  // Create larger hearts with more particles
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 350 * heartScale, 25 * heartScale, 0, 0));
  }
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 280 * heartScale, 20 * heartScale, 0, 0));
  }
  for (var i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPosition(i), 210 * heartScale, 15 * heartScale, 0, 0));
  }

  var heartPointsCount = pointsOrigin.length;
  var targetPoints = [];

  function pulse(kx, ky) {
    for (var i = 0; i < pointsOrigin.length; i++) {
      targetPoints[i] = [
        kx * pointsOrigin[i][0] + screenWidth / 2,
        ky * pointsOrigin[i][1] + screenHeight / 2.5, // Position heart higher
      ];
    }
  }

  var e = [];
  // More particles for better visibility
  var particleCount;
  if (isSmallPhone) {
    particleCount = Math.floor(heartPointsCount * 0.8); // More for small phones
  } else if (isNormalAndroid) {
    particleCount = Math.floor(heartPointsCount * 1); // Full count
  } else {
    particleCount = Math.floor(heartPointsCount * 1.2); // Extra for desktop
  }
  
  // Brighter colors and larger particles
  for (var i = 0; i < particleCount; i++) {
    var x = rand() * screenWidth;
    var y = rand() * screenHeight;
    e[i] = {
      vx: 0,
      vy: 0,
      R: isSmallPhone ? 2.5 : (isNormalAndroid ? 3 : 3.5), // Larger particles
      speed: rand() + 4,
      q: ~~(rand() * heartPointsCount),
      D: 2 * (i % 2) - 1,
      force: 0.2 * rand() + 0.7,
      // Brighter colors for better visibility
      f: i % 3 === 0 ? "rgba(255, 64, 129, 0.9)" : 
         i % 3 === 1 ? "rgba(255, 107, 158, 0.9)" : 
                       "rgba(255, 150, 197, 0.9)",
      trace: Array.from({ length: traceCount }, () => ({ x, y })),
    };
  }

  // Slower animation for better visibility
  var config = { 
    traceK: 0.4, // Slower trace fading
    timeDelta: 0.3 // Slower overall animation
  };
  var time = 0;

  function loop() {
    var n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    time += (Math.sin(time) < 0 ? 9 : n > 0.8 ? 0.2 : 1) * config.timeDelta;

    // Slower background fade for better visibility
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    for (var i = e.length; i--; ) {
      var u = e[i];
      var q = targetPoints[u.q];
      var dx = u.trace[0].x - q[0];
      var dy = u.trace[0].y - q[1];
      var length = Math.sqrt(dx * dx + dy * dy);

      if (length < 15) { // Larger attraction radius
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

      // Draw each trace particle for better visibility
      for (var t = 0; t < u.trace.length; t++) {
        var trace = u.trace[t];
        // Make trace particles fade out
        var alpha = 0.9 * (1 - t / u.trace.length);
        ctx.fillStyle = u.f.replace('0.9', alpha.toString());
        ctx.fillRect(trace.x, trace.y, u.R * (1 - t / u.trace.length), u.R * (1 - t / u.trace.length));
      }
    }

    drawText();
    window.requestAnimationFrame(loop, canvas);
  }

  // Expose functions for external control
  window.resizeHearts = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;
  };
  
  window.pauseHearts = function() {
    // Optional: Add pause functionality
  };
  
  window.resumeHearts = function() {
    // Optional: Add resume functionality
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

// Also update the love.html to ensure proper background
if (document.querySelector('style')) {
  // Add CSS to ensure canvas is on top
  var style = document.createElement('style');
  style.textContent = `
    body { background: #000 !important; }
    canvas { 
      position: fixed !important; 
      top: 0 !important; 
      left: 0 !important; 
      z-index: 1 !important;
    }
    #clickMessage { z-index: 1000 !important; }
  `;
  document.head.appendChild(style);
}