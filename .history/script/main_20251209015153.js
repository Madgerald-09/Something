$(document).ready(function() {
    // Android detection
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // Heart animation for main page
    function createHearts() {
        const heartCount = isAndroid ? 15 : 20; // Fewer hearts for Android performance
        const $bgHeart = $('.bg_heart');
        
        // Clear existing hearts
        $bgHeart.find('.heart').remove();
        
        for (let i = 0; i < heartCount; i++) {
            const heart = $('<div class="heart"></div>');
            $bgHeart.append(heart);
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size (smaller for Android)
            const size = isAndroid ? (Math.random() * 0.5 + 0.3) : (Math.random() * 0.7 + 0.3);
            
            // Random animation duration (slower for Android)
            const duration = isAndroid ? (Math.random() * 7 + 7) : (Math.random() * 5 + 5);
            
            // Apply styles
            heart.css({
                left: posX + 'vw',
                top: posY + 'vh',
                transform: 'scale(' + size + ') rotate(45deg)',
                animation: 'float ' + duration + 's ease-in-out infinite',
                animationDelay: (Math.random() * 5) + 's',
                opacity: isAndroid ? 0.6 : 0.7
            });
        }
    }
    
    // Create floating hearts
    createHearts();
    
    // Recreate hearts on resize for Android
    let resizeTimeout;
    $(window).on('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createHearts, 250);
    });
    
    // Button hover effect
    $('.next-button').on('touchstart mouseenter', function() {
        $(this).css({
            transform: 'scale(1.1)',
            boxShadow: '0 10px 30px rgba(255, 64, 129, 0.5)'
        });
    }).on('touchend mouseleave', function() {
        $(this).css({
            transform: 'scale(1)',
            boxShadow: '0 5px 15px rgba(255, 64, 129, 0.3)'
        });
    });
    
    // Add CSS for hearts with Android optimizations
    $('<style>').text(`
        .heart {
            position: absolute;
            background: #ff4081;
            width: ${isAndroid ? '16px' : '20px'};
            height: ${isAndroid ? '16px' : '20px'};
            opacity: 0.7;
            z-index: 1;
        }
        .heart:before,
        .heart:after {
            content: '';
            position: absolute;
            width: ${isAndroid ? '16px' : '20px'};
            height: ${isAndroid ? '16px' : '20px'};
            background: #ff4081;
            border-radius: 50%;
        }
        .heart:before {
            top: -8px;
            left: 0;
        }
        .heart:after {
            top: 0;
            left: -8px;
        }
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(45deg) scale(var(--scale, 1));
            }
            50% {
                transform: translateY(${isAndroid ? '-15px' : '-20px'}) rotate(45deg) scale(var(--scale, 1));
            }
        }
        
        /* Android performance optimizations */
        @media (prefers-reduced-motion: reduce) {
            .heart {
                animation: none !important;
            }
        }
    `).appendTo('head');
    
    // Handle Android orientation changes
    if (isAndroid) {
        window.addEventListener('orientationchange', function() {
            setTimeout(createHearts, 300);
        });
    }
});