$(document).ready(function() {
    // ===== Game Configuration =====
    const WIN_CHANCE = 0.10; // 10% win rate
    
    const SYMBOLS = [
        { id: 'seven', image: 'images/seven.png', multiplier: 10, name: 'সেভেন' },
        { id: 'diamond', image: 'images/diamond.png', multiplier: 7, name: 'ডায়মন্ড' },
        { id: 'bell', image: 'images/bell.png', multiplier: 5, name: 'বেল' },
        { id: 'bar', image: 'images/bar.png', multiplier: 4, name: 'বার' },
        { id: 'star', image: 'images/star.png', multiplier: 3, name: 'স্টার' },
        { id: 'cherry', image: 'images/cherry.png', multiplier: 2, name: 'চেরি' }
    ];
    
    // ===== Game State =====
    let coins = 100;
    let bet = 10;
    let spinning = false;
    let soundEnabled = true;
    
    // ===== DOM Elements =====
    const $coinAmount = $('#coinAmount');
    const $betAmount = $('#betAmount');
    const $message = $('#message');
    const $spinBtn = $('#spinBtn');
    const $slotMachine = $('#slotMachine');
    const $addCoinsBtn = $('#addCoinsBtn');
    const $winFlash = $('#winFlash');
    const $celebrationContainer = $('#celebrationContainer');
    
    // ===== Helper Functions =====
    function getRandomSymbol() {
        return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }
    
    function updateDisplay() {
        $coinAmount.text(coins);
        $betAmount.text(bet);
        
        // Show/hide add coins button
        if (coins < 10) {
            $addCoinsBtn.show();
        } else {
            $addCoinsBtn.hide();
        }
        
        // Update spin button
        if (coins < bet) {
            $spinBtn.text('কয়েন নেই!').prop('disabled', true);
        } else if (!spinning) {
            $spinBtn.text('স্পিন').prop('disabled', false);
        }
        
        // Update bet buttons
        $('#betDown').prop('disabled', spinning || bet <= 5);
        $('#betUp').prop('disabled', spinning || bet >= coins);
    }
    
    function setReelSymbol(reelId, symbol) {
        $(`#${reelId} .symbol`).attr('src', symbol.image).attr('alt', symbol.name);
    }
    
    function startSpinAnimation(reelId) {
        const $reel = $(`#${reelId}`);
        $reel.addClass('spinning');
        
        // Rapidly change symbols during spin
        const interval = setInterval(() => {
            const randomSymbol = getRandomSymbol();
            $reel.find('.symbol').attr('src', randomSymbol.image);
        }, 80);
        
        return interval;
    }
    
    function stopSpinAnimation(reelId, interval) {
        clearInterval(interval);
        $(`#${reelId}`).removeClass('spinning');
    }
    
    function showWinCelebration() {
        // Add winning classes
        $slotMachine.addClass('winning');
        $('.reel').addClass('winning');
        $message.addClass('winning');
        $winFlash.addClass('active');
        
        // Create falling coins
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const $coin = $('<img>')
                    .addClass('falling-coin')
                    .attr('src', 'images/coin.png')
                    .css({
                        left: Math.random() * 100 + '%',
                        animationDelay: Math.random() * 0.5 + 's',
                        animationDuration: (2 + Math.random() * 1.5) + 's'
                    });
                $celebrationContainer.append($coin);
                
                // Remove coin after animation
                setTimeout(() => $coin.remove(), 4000);
            }, i * 50);
        }
        
        // Remove winning effects after delay
        setTimeout(() => {
            $slotMachine.removeClass('winning');
            $('.reel').removeClass('winning');
            $message.removeClass('winning');
            $winFlash.removeClass('active');
        }, 3000);
    }
    
    // ===== Spin Function =====
    function spin() {
        if (spinning || coins < bet) return;
        
        spinning = true;
        coins -= bet;
        updateDisplay();
        
        $spinBtn.text('স্পিনিং...').prop('disabled', true);
        $message.removeClass('winning').text('স্পিন হচ্ছে...');
        
        // Start spinning all reels
        const intervals = [
            startSpinAnimation('reel1'),
            startSpinAnimation('reel2'),
            startSpinAnimation('reel3')
        ];
        
        // Determine if this spin will win (10% chance)
        const willWin = Math.random() < WIN_CHANCE;
        
        // Generate final symbols
        let finalSymbols;
        if (willWin) {
            const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            finalSymbols = [winSymbol, winSymbol, winSymbol];
        } else {
            // Ensure not all same
            do {
                finalSymbols = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
            } while (finalSymbols[0].id === finalSymbols[1].id && finalSymbols[1].id === finalSymbols[2].id);
        }
        
        // Stop reels one by one
        const stopTimes = [1000, 1500, 2000];
        const reelIds = ['reel1', 'reel2', 'reel3'];
        
        stopTimes.forEach((time, index) => {
            setTimeout(() => {
                stopSpinAnimation(reelIds[index], intervals[index]);
                setReelSymbol(reelIds[index], finalSymbols[index]);
            }, time);
        });
        
        // Final result
        setTimeout(() => {
            spinning = false;
            
            if (willWin) {
                const winAmount = bet * finalSymbols[0].multiplier;
                coins += winAmount;
                $message.text(`🎉 জিতেছেন! +${winAmount} কয়েন!`);
                showWinCelebration();
            } else {
                $message.text('আবার চেষ্টা করুন!');
            }
            
            updateDisplay();
        }, 2200);
    }
    
    // ===== Event Handlers =====
    $spinBtn.on('click', spin);
    
    $('#betDown').on('click', function() {
        if (!spinning && bet > 5) {
            bet = Math.max(5, bet - 5);
            updateDisplay();
        }
    });
    
    $('#betUp').on('click', function() {
        if (!spinning && bet < coins) {
            bet = Math.min(coins, bet + 5);
            updateDisplay();
        }
    });
    
    $addCoinsBtn.on('click', function() {
        coins = 100;
        updateDisplay();
        $message.text('স্পিন করুন!');
    });
    
    $('#soundToggle').on('click', function() {
        soundEnabled = !soundEnabled;
        $(this).find('.sound-on').toggle(soundEnabled);
        $(this).find('.sound-off').toggle(!soundEnabled);
    });
    
    // Keyboard support
    $(document).on('keydown', function(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            spin();
        }
    });
    
    // ===== Initialize =====
    updateDisplay();
});
