$(document).ready(function() {
    // Check if mobile
    const isMobile = window.innerWidth <= 600;
    const isAndroid = /android/i.test(navigator.userAgent);
    
    // Heart animation for main page
    function createHearts() {
        // Adjust heart count based on screen size
        let heartCount;
        if (window.innerWidth <= 480) {
            heartCount = 12; // Small phones
        } else if (window.innerWidth <= 600) {
            heartCount = 15; // Normal Android phones
        } else {
            heartCount = 20; // Desktop/Tablet
        }
        
        const $bgHeart = $('.bg_heart');
        
        // Clear existing hearts
        $bgHeart.find('.heart').remove();
        
        for (let i = 0; i < heartCount; i++) {
            const heart = $('<div class="heart"></div>');
            $bgHeart.append(heart);
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Adjust size based on screen
            let size;
            if (window.innerWidth <= 480) {
                size = Math.random() * 0.4 + 0.2; // Smaller for small phones
            } else if (window.innerWidth <= 600) {
                size = Math.random() * 0.5 + 0.3; // Normal Android
            } else {
                size = Math.random() * 0.7 + 0.3; // Desktop
            }
            
            // Animation duration
            const duration = Math.random() * 5 + 5;
            
            // Apply styles
            heart.css({
                left: posX + 'vw',
                top: posY + 'vh',
                transform: 'scale(' + size + ') rotate(45deg)',
                animation: 'float ' + duration + 's ease-in-out infinite',
                animationDelay: (Math.random() * 5) + 's',
                opacity: 0.7
            });
        }
    }
    
    // Create floating hearts
    createHearts();
    
    // Recreate hearts on resize
    let resizeTimeout;
    $(window).on('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(createHearts, 200);
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
    
    // Add CSS for hearts
    $('<style>').text(`
        .heart {
            position: absolute;
            background: #ff4081;
            width: 20px;
            height: 20px;
            opacity: 0.7;
            z-index: 1;
        }
        .heart:before,
        .heart:after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            background: #ff4081;
            border-radius: 50%;
        }
        .heart:before {
            top: -10px;
            left: 0;
        }
        .heart:after {
            top: 0;
            left: -10px;
        }
        
        /* Adjust heart size for mobile */
        @media (max-width: 600px) {
            .heart {
                width: 16px;
                height: 16px;
            }
            .heart:before,
            .heart:after {
                width: 16px;
                height: 16px;
            }
            .heart:before {
                top: -8px;
            }
            .heart:after {
                left: -8px;
            }
        }
        
        @media (max-width: 480px) {
            .heart {
                width: 14px;
                height: 14px;
            }
            .heart:before,
            .heart:after {
                width: 14px;
                height: 14px;
            }
            .heart:before {
                top: -7px;
            }
            .heart:after {
                left: -7px;
            }
        }
        
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(45deg) scale(var(--scale, 1));
            }
            50% {
                transform: translateY(-20px) rotate(45deg) scale(var(--scale, 1));
            }
        }
        
        /* Reduce motion for performance */
        @media (prefers-reduced-motion: reduce) {
            .heart {
                animation: none !important;
            }
        }
    `).appendTo('head');
});