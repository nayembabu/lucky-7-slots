import { useState, useEffect, useCallback } from 'react';
import { Coins, Volume2, VolumeX } from 'lucide-react';

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🔔'];
const WIN_CHANCE = 0.10; // 10% win rate

const SlotMachine = () => {
  const [reels, setReels] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(100);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('স্পিন করুন!');
  const [isWin, setIsWin] = useState(false);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

  const spin = useCallback(() => {
    if (spinning || coins < bet) return;

    setSpinning(true);
    setIsWin(false);
    setCoins(prev => prev - bet);
    setMessage('স্পিন হচ্ছে...');
    setSpinningReels([true, true, true]);

    // Determine if this spin will win (10% chance)
    const willWin = Math.random() < WIN_CHANCE;

    // Generate final symbols
    let finalReels: string[];
    if (willWin) {
      // Pick a random winning symbol
      const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finalReels = [winSymbol, winSymbol, winSymbol];
    } else {
      // Generate non-matching symbols
      do {
        finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      } while (finalReels[0] === finalReels[1] && finalReels[1] === finalReels[2]);
    }

    // Animate reels stopping one by one
    const stopTimes = [800, 1200, 1600];
    
    stopTimes.forEach((time, index) => {
      setTimeout(() => {
        setReels(prev => {
          const newReels = [...prev];
          newReels[index] = finalReels[index];
          return newReels;
        });
        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[index] = false;
          return newSpinning;
        });
      }, time);
    });

    // Final result
    setTimeout(() => {
      setSpinning(false);
      if (willWin) {
        const multiplier = finalReels[0] === '7️⃣' ? 10 : finalReels[0] === '💎' ? 5 : 3;
        const winAmount = bet * multiplier;
        setCoins(prev => prev + winAmount);
        setMessage(`🎉 জিতেছেন! +${winAmount} কয়েন!`);
        setIsWin(true);
      } else {
        setMessage('আবার চেষ্টা করুন!');
      }
    }, 1800);
  }, [spinning, coins, bet]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [spin]);

  const adjustBet = (amount: number) => {
    const newBet = Math.max(5, Math.min(coins, bet + amount));
    setBet(newBet);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Decorative lights */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neon-pink via-gold to-neon-blue opacity-80" />
      
      {/* Title */}
      <h1 className="font-display text-4xl md:text-5xl text-gold mb-2 tracking-wider animate-glow-pulse">
        SLOT 777
      </h1>
      <p className="text-muted-foreground mb-6 text-sm">ভাগ্য পরীক্ষা করুন!</p>

      {/* Sound toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-4 right-4 p-2 text-gold hover:text-gold-light transition-colors"
      >
        {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Coin Display */}
      <div className="coin-display flex items-center gap-2 px-6 py-3 rounded-full mb-6">
        <Coins className="text-gold" size={24} />
        <span className="font-display text-2xl text-gold">{coins}</span>
      </div>

      {/* Slot Machine */}
      <div className={`slot-machine rounded-2xl p-6 md:p-8 ${isWin ? 'win-glow animate-celebrate' : ''}`}>
        {/* Reels Container */}
        <div className="flex gap-3 md:gap-4 mb-6">
          {reels.map((symbol, index) => (
            <div
              key={index}
              className={`reel-container w-20 h-24 md:w-28 md:h-32 rounded-xl flex items-center justify-center border-2 border-gold/30 ${
                spinningReels[index] ? 'reel-spinning' : ''
              }`}
            >
              <span className={`text-5xl md:text-6xl ${spinningReels[index] ? 'blur-sm' : ''} transition-all duration-200`}>
                {spinningReels[index] ? SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)] : symbol}
              </span>
            </div>
          ))}
        </div>

        {/* Message */}
        <div className={`text-center mb-6 h-8 ${isWin ? 'text-gold animate-bounce-in' : 'text-foreground'}`}>
          <p className="font-display text-lg">{message}</p>
        </div>

        {/* Bet Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={() => adjustBet(-5)}
            disabled={spinning || bet <= 5}
            className="w-10 h-10 rounded-full bg-muted text-foreground font-bold text-xl disabled:opacity-50 hover:bg-muted/80 transition-colors"
          >
            -
          </button>
          <div className="text-center">
            <p className="text-muted-foreground text-xs">বাজি</p>
            <p className="font-display text-2xl text-gold">{bet}</p>
          </div>
          <button
            onClick={() => adjustBet(5)}
            disabled={spinning || bet >= coins}
            className="w-10 h-10 rounded-full bg-muted text-foreground font-bold text-xl disabled:opacity-50 hover:bg-muted/80 transition-colors"
          >
            +
          </button>
        </div>

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={spinning || coins < bet}
          className="spin-button w-full py-4 rounded-xl font-display text-xl text-secondary-foreground uppercase tracking-widest"
        >
          {spinning ? 'স্পিনিং...' : coins < bet ? 'কয়েন নেই!' : 'স্পিন করুন'}
        </button>
      </div>

      {/* Win Rate Info */}
      <p className="mt-6 text-muted-foreground text-xs">জেতার সম্ভাবনা: ১০%</p>

      {/* Add Coins Button (for testing) */}
      {coins < 10 && (
        <button
          onClick={() => setCoins(100)}
          className="mt-4 px-6 py-2 bg-gold/20 border border-gold rounded-full text-gold hover:bg-gold/30 transition-colors font-display text-sm"
        >
          +১০০ কয়েন যোগ করুন
        </button>
      )}

      {/* Win celebration coins */}
      {isWin && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `coins-fall ${2 + Math.random()}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
