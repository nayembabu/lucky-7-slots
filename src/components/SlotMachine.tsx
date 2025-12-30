import { useState, useEffect, useCallback, useMemo } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

// Import slot images
import slotSeven from '@/assets/slot-seven.png';
import slotCherry from '@/assets/slot-cherry.png';
import slotDiamond from '@/assets/slot-diamond.png';
import slotBell from '@/assets/slot-bell.png';
import slotStar from '@/assets/slot-star.png';
import slotBar from '@/assets/slot-bar.png';
import coinImg from '@/assets/coin.png';
import casinoBg from '@/assets/casino-bg.jpg';

interface Symbol {
  id: string;
  image: string;
  multiplier: number;
  name: string;
}

const SYMBOLS: Symbol[] = [
  { id: 'seven', image: slotSeven, multiplier: 10, name: 'সেভেন' },
  { id: 'diamond', image: slotDiamond, multiplier: 7, name: 'ডায়মন্ড' },
  { id: 'bell', image: slotBell, multiplier: 5, name: 'বেল' },
  { id: 'bar', image: slotBar, multiplier: 4, name: 'বার' },
  { id: 'star', image: slotStar, multiplier: 3, name: 'স্টার' },
  { id: 'cherry', image: slotCherry, multiplier: 2, name: 'চেরি' },
];

const WIN_CHANCE = 0.10; // 10% win rate

const SlotMachine = () => {
  const [reels, setReels] = useState<Symbol[]>([SYMBOLS[0], SYMBOLS[0], SYMBOLS[0]]);
  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState(100);
  const [bet, setBet] = useState(10);
  const [message, setMessage] = useState('স্পিন করুন!');
  const [isWin, setIsWin] = useState(false);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showParticles, setShowParticles] = useState(false);

  // Animation frames for spinning
  const [animationFrames, setAnimationFrames] = useState<Symbol[][]>([[], [], []]);

  const getRandomSymbol = useCallback(() => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }, []);

  // Generate animation frames
  const generateAnimationFrames = useCallback(() => {
    return SYMBOLS.sort(() => Math.random() - 0.5);
  }, []);

  const spin = useCallback(() => {
    if (spinning || coins < bet) return;

    setSpinning(true);
    setIsWin(false);
    setShowParticles(false);
    setCoins(prev => prev - bet);
    setMessage('স্পিন হচ্ছে...');
    setSpinningReels([true, true, true]);

    // Generate animation frames for each reel
    setAnimationFrames([
      generateAnimationFrames(),
      generateAnimationFrames(),
      generateAnimationFrames(),
    ]);

    // Determine if this spin will win (10% chance)
    const willWin = Math.random() < WIN_CHANCE;

    // Generate final symbols
    let finalReels: Symbol[];
    if (willWin) {
      const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      finalReels = [winSymbol, winSymbol, winSymbol];
    } else {
      do {
        finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      } while (finalReels[0].id === finalReels[1].id && finalReels[1].id === finalReels[2].id);
    }

    // Animate reels stopping one by one
    const stopTimes = [1000, 1500, 2000];
    
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
        const winAmount = bet * finalReels[0].multiplier;
        setCoins(prev => prev + winAmount);
        setMessage(`🎉 জিতেছেন! +${winAmount} কয়েন!`);
        setIsWin(true);
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 3000);
      } else {
        setMessage('আবার চেষ্টা করুন!');
      }
    }, 2200);
  }, [spinning, coins, bet, getRandomSymbol, generateAnimationFrames]);

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

  // Spinning reel animation component
  const SpinningReel = ({ symbols }: { symbols: Symbol[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % symbols.length);
      }, 80);
      return () => clearInterval(interval);
    }, [symbols.length]);

    return (
      <img 
        src={symbols[currentIndex]?.image || SYMBOLS[0].image} 
        alt="spinning" 
        className="w-full h-full object-contain blur-[2px] scale-110"
      />
    );
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative"
      style={{
        backgroundImage: `url(${casinoBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Decorative top lights */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-pink via-gold to-neon-blue opacity-80 z-10" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        
        {/* Title with glow */}
        <div className="relative mb-4">
          <h1 className="font-display text-5xl md:text-6xl text-gold tracking-wider drop-shadow-[0_0_30px_rgba(255,215,0,0.8)]">
            SLOT 777
          </h1>
          <Sparkles className="absolute -right-8 -top-2 text-gold animate-pulse" size={24} />
          <Sparkles className="absolute -left-8 -top-2 text-gold animate-pulse" size={24} />
        </div>
        
        <p className="text-gold/80 mb-6 text-sm font-body">ভাগ্য পরীক্ষা করুন!</p>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 p-3 bg-black/50 rounded-full text-gold hover:text-gold-light transition-all hover:scale-110 border border-gold/30"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Coin Display */}
        <div className="flex items-center gap-3 px-6 py-3 rounded-full mb-6 bg-gradient-to-r from-casino-purple to-black/80 border-2 border-gold shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <img src={coinImg} alt="coin" className="w-10 h-10 object-contain animate-pulse" />
          <span className="font-display text-3xl text-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            {coins}
          </span>
        </div>

        {/* Slot Machine Frame */}
        <div className={`relative rounded-3xl p-1 ${isWin ? 'animate-glow-pulse' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #ffd700, #b8860b, #ffd700, #daa520)',
          }}
        >
          {/* Inner machine */}
          <div className="bg-gradient-to-b from-[#1a0a2e] via-[#0d0515] to-[#1a0a2e] rounded-2xl p-6 md:p-8">
            
            {/* Pay line indicator */}
            <div className="flex justify-center mb-3">
              <div className="px-4 py-1 bg-casino-red/80 rounded-full text-xs font-display text-gold-light tracking-wider border border-gold/50">
                PAY LINE
              </div>
            </div>

            {/* Reels Container */}
            <div className="relative">
              {/* Win line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-casino-red to-transparent opacity-60 z-10" />
              
              <div className="flex gap-2 md:gap-3">
                {reels.map((symbol, index) => (
                  <div
                    key={index}
                    className={`relative w-24 h-28 md:w-32 md:h-36 rounded-xl overflow-hidden ${
                      isWin && !spinning ? 'ring-2 ring-gold animate-pulse' : ''
                    }`}
                    style={{
                      background: 'linear-gradient(180deg, #0a0510 0%, #1a0a2e 50%, #0a0510 100%)',
                      boxShadow: 'inset 0 5px 30px rgba(0,0,0,0.8), 0 0 15px rgba(255,215,0,0.2)',
                    }}
                  >
                    {/* Reel highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
                    
                    {/* Symbol */}
                    <div className="w-full h-full flex items-center justify-center p-3">
                      {spinningReels[index] ? (
                        <SpinningReel symbols={animationFrames[index]} />
                      ) : (
                        <img 
                          src={symbol.image} 
                          alt={symbol.name}
                          className={`w-full h-full object-contain transition-all duration-300 ${
                            isWin ? 'scale-110' : ''
                          }`}
                        />
                      )}
                    </div>

                    {/* Reel borders */}
                    <div className="absolute inset-0 rounded-xl border-2 border-gold/30 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className={`text-center my-6 h-8 ${isWin ? 'text-gold' : 'text-foreground'}`}>
              <p className={`font-display text-lg ${isWin ? 'animate-bounce-in drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]' : ''}`}>
                {message}
              </p>
            </div>

            {/* Bet Controls */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => adjustBet(-5)}
                disabled={spinning || bet <= 5}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-muted to-casino-purple text-gold font-bold text-2xl disabled:opacity-40 hover:scale-110 transition-all border border-gold/30 shadow-lg"
              >
                −
              </button>
              <div className="text-center min-w-[80px]">
                <p className="text-muted-foreground text-xs uppercase tracking-wider">বাজি</p>
                <p className="font-display text-3xl text-gold">{bet}</p>
              </div>
              <button
                onClick={() => adjustBet(5)}
                disabled={spinning || bet >= coins}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-muted to-casino-purple text-gold font-bold text-2xl disabled:opacity-40 hover:scale-110 transition-all border border-gold/30 shadow-lg"
              >
                +
              </button>
            </div>

            {/* Spin Button */}
            <button
              onClick={spin}
              disabled={spinning || coins < bet}
              className="w-full py-5 rounded-2xl font-display text-2xl uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              style={{
                background: spinning 
                  ? 'linear-gradient(180deg, #666, #333)'
                  : 'linear-gradient(180deg, #ff4444, #cc0000, #990000)',
                boxShadow: spinning 
                  ? 'none'
                  : '0 8px 30px rgba(255,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {spinning ? 'স্পিনিং...' : coins < bet ? 'কয়েন নেই!' : 'স্পিন'}
            </button>
          </div>
        </div>

        {/* Paytable */}
        <div className="mt-6 bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-gold/20 w-full">
          <p className="text-center text-gold/80 text-xs mb-2 font-display">পুরস্কার টেবিল</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {SYMBOLS.slice(0, 3).map((sym) => (
              <div key={sym.id} className="flex items-center gap-1 justify-center">
                <img src={sym.image} alt={sym.name} className="w-6 h-6" />
                <span className="text-gold/80">×{sym.multiplier}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Win Rate Info */}
        <p className="mt-4 text-gold/50 text-xs">জেতার সম্ভাবনা: ১০%</p>

        {/* Add Coins Button */}
        {coins < 10 && (
          <button
            onClick={() => setCoins(100)}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-gold/20 to-gold/10 border-2 border-gold rounded-full text-gold hover:bg-gold/30 transition-all font-display text-sm shadow-[0_0_20px_rgba(255,215,0,0.3)]"
          >
            +১০০ কয়েন যোগ করুন
          </button>
        )}
      </div>

      {/* Win celebration - falling coins */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {[...Array(30)].map((_, i) => (
            <img
              key={i}
              src={coinImg}
              alt="coin"
              className="absolute w-8 h-8"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `coins-fall ${2 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 0.8}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Win flash effect */}
      {isWin && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gold/10 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
