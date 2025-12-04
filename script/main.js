$(document).ready(function() {
    // Heart animation for main page
    function createHearts() {
        const heartCount = 20;
        for (let i = 0; i < heartCount; i++) {
            const heart = $('<div class="heart"></div>');
            $('.bg_heart').append(heart);
            
            // Random position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Random size
            const size = Math.random() * 0.7 + 0.3;
            
            // Random animation duration
            const duration = Math.random() * 5 + 5;
            
            // Apply styles
            heart.css({
                left: posX + 'vw',
                top: posY + 'vh',
                transform: 'scale(' + size + ')',
                animation: 'float ' + duration + 's ease-in-out infinite',
                animationDelay: (Math.random() * 5) + 's'
            });
        }
    }
    
    // Create floating hearts
    createHearts();
    
    // Button hover effect
    $('.next-button').hover(
        function() {
            $(this).css({
                transform: 'scale(1.1)',
                boxShadow: '0 10px 30px rgba(255, 64, 129, 0.5)'
            });
        },
        function() {
            $(this).css({
                transform: 'scale(1)',
                boxShadow: '0 5px 15px rgba(255, 64, 129, 0.3)'
            });
        }
    );
    
    // Add CSS for hearts
    $('<style>').text(`
        .heart {
            position: absolute;
            background: #ff4081;
            width: 20px;
            height: 20px;
            transform: rotate(45deg);
            opacity: 0.7;
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
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(45deg) scale(var(--scale, 1));
            }
            50% {
                transform: translateY(-20px) rotate(45deg) scale(var(--scale, 1));
            }
        }
    `).appendTo('head');
});