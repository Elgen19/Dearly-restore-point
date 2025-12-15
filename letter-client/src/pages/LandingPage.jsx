// LandingPage.jsx - Beautiful parallax landing page for Dearly
import React, { memo, useRef, forwardRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// Animated background component with parallax
const AnimatedBackground = memo(({ scrollY }) => {
  // Different parallax speeds for different layers - more dramatic differences
  const gradient1Y = useTransform(scrollY, [0, 3000], [0, 800]);
  const gradient2Y = useTransform(scrollY, [0, 3000], [0, -600]);
  const gradient3Y = useTransform(scrollY, [0, 3000], [0, 400]);
  const orb1Y = useTransform(scrollY, [0, 3000], [0, 500]);
  const orb2Y = useTransform(scrollY, [0, 3000], [0, -400]);
  const orb3Y = useTransform(scrollY, [0, 3000], [0, 450]);
  const orb4Y = useTransform(scrollY, [0, 3000], [0, -350]);
  const orb5Y = useTransform(scrollY, [0, 3000], [0, 550]);
  
  // Romantic/letter-themed elements parallax
  const heart1Y = useTransform(scrollY, [0, 3000], [0, 300]);
  const heart2Y = useTransform(scrollY, [0, 3000], [0, -250]);
  const wave1Y = useTransform(scrollY, [0, 3000], [0, 350]);
  const wave2Y = useTransform(scrollY, [0, 3000], [0, -200]);
  const letterY = useTransform(scrollY, [0, 3000], [0, 280]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient layer - moves slowest */}
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          y: gradient1Y,
          background: 'linear-gradient(135deg, rgba(236,72,153,0.08) 0%, rgba(219,39,119,0.08) 25%, rgba(168,85,247,0.08) 50%, rgba(147,51,234,0.08) 75%, rgba(236,72,153,0.08) 100%)',
          backgroundSize: '400% 400%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Second gradient layer - moves in opposite direction */}
      <motion.div
        className="absolute inset-0 opacity-40"
        style={{
          y: gradient2Y,
          background: 'linear-gradient(-135deg, rgba(251,113,133,0.1) 0%, rgba(244,63,94,0.1) 25%, rgba(192,132,252,0.1) 50%, rgba(167,139,250,0.1) 75%, rgba(251,113,133,0.1) 100%)',
          backgroundSize: '300% 300%',
        }}
        animate={{
          backgroundPosition: ['100% 100%', '0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Third gradient layer */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          y: gradient3Y,
          background: 'linear-gradient(45deg, rgba(236,72,153,0.12), rgba(168,85,247,0.12))',
          backgroundSize: '200% 200%',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Large floating orbs with parallax - consistent opacity, mobile responsive */}
      <motion.div
        className="absolute w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-rose-400/20 rounded-full blur-3xl"
        style={{ 
          top: '5%', 
          left: '5%',
          y: orb1Y,
        }}
        animate={{
          x: [0, 150, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[225px] h-[225px] md:w-[450px] md:h-[450px] bg-pink-400/20 rounded-full blur-3xl"
        style={{ 
          top: '55%', 
          right: '5%',
          y: orb2Y,
        }}
        animate={{
          x: [0, -120, 0],
          scale: [1, 1.4, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-purple-400/20 rounded-full blur-3xl"
        style={{ 
          bottom: '15%', 
          left: '45%',
          y: orb3Y,
        }}
        animate={{
          x: [0, 100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[175px] h-[175px] md:w-[350px] md:h-[350px] bg-rose-400/15 rounded-full blur-3xl"
        style={{ 
          top: '30%', 
          right: '30%',
          y: orb4Y,
        }}
        animate={{
          x: [0, -80, 0],
          scale: [1, 1.25, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-[190px] h-[190px] md:w-[380px] md:h-[380px] bg-pink-400/15 rounded-full blur-3xl"
        style={{ 
          bottom: '40%', 
          left: '15%',
          y: orb5Y,
        }}
        animate={{
          x: [0, 90, 0],
          scale: [1, 1.35, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating hearts with parallax - consistent opacity, mobile responsive */}
      <motion.div
        className="absolute text-rose-400/20 text-6xl md:text-[120px]"
        style={{
          top: '20%',
          left: '70%',
          y: heart1Y,
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 15, -15, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ❤️
      </motion.div>
      <motion.div
        className="absolute text-pink-400/18 text-5xl md:text-[100px]"
        style={{
          top: '70%',
          left: '20%',
          y: heart2Y,
        }}
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -20, 20, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        💕
      </motion.div>
      
      {/* Flowing wave patterns - consistent colors, mobile responsive */}
      <motion.svg
        className="absolute top-1/4 right-2 md:right-10 opacity-15 w-[200px] md:w-[400px] h-[100px] md:h-[200px]"
        style={{
          y: wave1Y,
        }}
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,100 Q100,50 200,100 T400,100"
          stroke="rgba(236,72,153,0.25)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,100 Q100,50 200,100 T400,100",
              "M0,100 Q100,150 200,100 T400,100",
              "M0,100 Q100,50 200,100 T400,100"
            ]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
      <motion.svg
        className="absolute bottom-1/4 left-2 md:left-10 opacity-15 w-[175px] md:w-[350px] h-[90px] md:h-[180px]"
        style={{
          y: wave2Y,
        }}
        viewBox="0 0 350 180"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,90 Q87,40 175,90 T350,90"
          stroke="rgba(168,85,247,0.25)"
          strokeWidth="2"
          fill="none"
          animate={{
            d: [
              "M0,90 Q87,40 175,90 T350,90",
              "M0,90 Q87,140 175,90 T350,90",
              "M0,90 Q87,40 175,90 T350,90"
            ]
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.svg>
      
      {/* Letter/envelope silhouette - consistent colors, mobile responsive */}
      <motion.div
        className="absolute opacity-12 hidden md:block"
        style={{
          top: '50%',
          right: '25%',
          y: letterY,
          width: '200px',
          height: '150px',
        }}
      >
        <svg viewBox="0 0 200 150" className="w-full h-full">
          <motion.path
            d="M20,30 L100,80 L180,30 L180,120 L20,120 Z"
            fill="rgba(236,72,153,0.18)"
            stroke="rgba(236,72,153,0.25)"
            strokeWidth="2"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.path
            d="M20,30 L100,80 L180,30"
            fill="none"
            stroke="rgba(168,85,247,0.25)"
            strokeWidth="2"
            strokeDasharray="5,5"
            animate={{
              pathLength: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
      
      {/* Soft organic patterns - ink splashes, mobile responsive */}
      <motion.div
        className="absolute opacity-8 hidden md:block"
        style={{
          top: '30%',
          left: '15%',
          y: useTransform(scrollY, [0, 3000], [0, 250]),
          width: '150px',
          height: '150px',
        }}
      >
        <svg viewBox="0 0 150 150" className="w-full h-full">
          <motion.path
            d="M75,75 Q50,50 30,75 T30,100 Q50,125 75,100 T120,100 Q100,75 75,75"
            fill="rgba(251,113,133,0.15)"
            animate={{
              d: [
                "M75,75 Q50,50 30,75 T30,100 Q50,125 75,100 T120,100 Q100,75 75,75",
                "M75,75 Q60,45 25,75 T25,105 Q55,130 80,95 T125,95 Q95,70 75,75",
                "M75,75 Q50,50 30,75 T30,100 Q50,125 75,100 T120,100 Q100,75 75,75"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>
      </motion.div>
      
      {/* Paper texture overlay - subtle */}
      <motion.div
        className="absolute inset-0 opacity-3"
        style={{
          y: useTransform(scrollY, [0, 3000], [0, 150]),
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236,72,153,0.02) 2px, rgba(236,72,153,0.02) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(168,85,247,0.02) 2px, rgba(168,85,247,0.02) 4px)
          `,
        }}
      />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

// Parallax Section Component - moves content at different speeds
const ParallaxSection = forwardRef(({ children, speed = 0.5, className = "" }, ref) => {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  // Create parallax effect - positive speed moves down, negative moves up
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);
  
  return (
    <motion.div 
      ref={ref}
      style={{ y }} 
      className={className}
    >
      {children}
    </motion.div>
  );
});

ParallaxSection.displayName = 'ParallaxSection';

// Parallax Text Component
const ParallaxText = ({ children, speed = 0.3, className = "" }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 100 * speed]);
  
  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

// Fade In On Scroll Component
const FadeInSection = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

// Typewriter Text Component
const TypewriterText = ({ words, baseText, className = "" }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
          setTypingSpeed(100);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentWord.substring(0, currentText.length - 1));
          setTypingSpeed(50);
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed]);

  return (
    <span className={className}>
      {baseText}
      <span className="inline-block min-w-[200px] md:min-w-[280px] text-left">
        <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">
          {currentText}
        </span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="inline-block w-0.5 h-[1em] bg-gradient-to-r from-rose-500 to-pink-500 ml-1 align-middle"
        />
      </span>
    </span>
  );
};

const LandingPage = memo(function LandingPage() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  // Parallax transforms for hero content
  const heroY = useTransform(scrollY, [0, 800], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.8]);

  const handleSignIn = () => {
    window.location.href = '/signin';
  };

  return (
    <div 
      className="w-full bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 relative overflow-x-hidden"
    >
      <AnimatedBackground scrollY={scrollY} />
      
      {/* Navigation Bar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <motion.h1
            className="text-xl md:text-2xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            Dearly
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignIn}
            className="px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-medium hover:from-rose-600 hover:to-pink-600 transition-all shadow-md"
          >
            Sign In
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section with Strong Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 pt-20 overflow-hidden bg-white">
        {/* Floating hearts with different proximity/opacity */}
        {[...Array(12)].map((_, i) => {
          const heartY = useTransform(scrollY, [0, 1000], [0, (i % 3) * 100 - 50]);
          const heartX = useTransform(scrollY, [0, 1000], [0, (i % 2) * 50 - 25]);
          const sizes = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64];
          const opacities = [0.15, 0.18, 0.12, 0.20, 0.10, 0.22, 0.14, 0.16, 0.19, 0.11, 0.17, 0.13];
          const positions = [
            { top: '10%', left: '8%' },
            { top: '15%', right: '12%' },
            { top: '25%', left: '15%' },
            { top: '30%', right: '8%' },
            { top: '40%', left: '5%' },
            { top: '45%', right: '18%' },
            { bottom: '35%', left: '10%' },
            { bottom: '30%', right: '15%' },
            { bottom: '20%', left: '12%' },
            { bottom: '15%', right: '8%' },
            { bottom: '10%', left: '6%' },
            { bottom: '5%', right: '10%' },
          ];
          
          return (
            <motion.div
              key={`hero-heart-${i}`}
              className="absolute text-rose-400"
              style={{
                ...positions[i],
                fontSize: `${sizes[i]}px`,
                opacity: opacities[i],
                y: heartY,
                x: heartX,
                zIndex: 1,
              }}
              animate={{
                y: [0, -30 + (i % 5) * 10, 0],
                x: [0, Math.sin(i) * 20, 0],
                scale: [1, 1.2 + (i % 3) * 0.1, 1],
                rotate: [0, 15 * (i % 2 === 0 ? 1 : -1), 0],
              }}
              transition={{
                duration: 4 + (i % 3) * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              {i % 3 === 0 ? '❤️' : i % 3 === 1 ? '💕' : '💖'}
            </motion.div>
          );
        })}
        
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="text-center max-w-5xl mx-auto relative z-10"
        >
          <ParallaxText speed={0.2}>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl md:text-9xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-6"
            >
              Dearly
            </motion.h1>
          </ParallaxText>
          
          <ParallaxText speed={0.15}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-gray-700 text-3xl md:text-4xl font-serif italic mb-6 min-h-[60px] md:min-h-[80px] flex items-center justify-center"
            >
              <TypewriterText
                baseText="Express your heart, "
                words={['beautifully', 'sincerely', 'lovingly', 'thoughtfully', 'passionately', 'tenderly']}
                className="text-gray-700"
              />
            </motion.p>
          </ParallaxText>
          
          <ParallaxText speed={0.1}>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-gray-600 text-xl md:text-2xl max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              Create heartfelt letters, share meaningful moments, and connect with those you love through beautifully crafted digital experiences that capture the essence of your emotions.
            </motion.p>
          </ParallaxText>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignIn}
              className="px-6 md:px-12 py-3 md:py-5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white rounded-xl font-bold text-base md:text-xl hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 transition-all shadow-2xl hover:shadow-rose-500/50 relative overflow-hidden group w-full sm:w-auto"
            >
              <span className="relative z-10">Get Started Free</span>
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  ease: "linear",
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section with Parallax */}
      <section ref={featuresRef} className="relative py-16 md:py-32 px-4">
        {/* Section Background with Parallax - consistent colors */}
        <motion.div
          className="absolute inset-0 opacity-25"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, -200]),
            background: 'radial-gradient(circle at 30% 50%, rgba(236,72,153,0.12), transparent 50%), radial-gradient(circle at 70% 50%, rgba(168,85,247,0.12), transparent 50%)',
          }}
        />
        <ParallaxSection ref={featuresRef} speed={0.3}>
          <div className="max-w-7xl mx-auto relative z-10">
            <FadeInSection>
              <div className="text-center mb-12 md:mb-20">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                  Everything You Need
                </h2>
                <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto px-4">
                  Powerful features to help you create and share beautiful letters
                </p>
              </div>
            </FadeInSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: '💌',
                  title: 'Beautiful Letters',
                  description: 'Craft personalized letters with elegant templates and heartfelt messages that capture your emotions perfectly. Choose from multiple styles and customize every detail.',
                  color: 'from-rose-500 to-pink-500'
                },
                {
                  icon: '🎁',
                  title: 'Special Moments',
                  description: 'Plan dates, create interactive games, and add surprise elements to make every letter a memorable experience. Include quizzes, memory games, and more.',
                  color: 'from-pink-500 to-purple-500'
                },
                {
                  icon: '💕',
                  title: 'Share Love',
                  description: 'Send your letters securely and watch as your loved ones experience the joy of receiving something special. Track when they open and read your letter.',
                  color: 'from-purple-500 to-rose-500'
                },
                {
                  icon: '🎨',
                  title: 'Customizable',
                  description: 'Personalize every aspect of your letter with custom colors, fonts, and layouts. Make it truly yours with our easy-to-use editor.',
                  color: 'from-rose-500 to-purple-500'
                },
                {
                  icon: '🔒',
                  title: 'Secure & Private',
                  description: 'Your letters are encrypted and stored securely. Share only with those you trust, and maintain complete privacy over your heartfelt messages.',
                  color: 'from-pink-500 to-rose-500'
                },
                {
                  icon: '📱',
                  title: 'Accessible Anywhere',
                  description: 'Create and view your letters on any device. Whether on your phone, tablet, or computer, your letters are always accessible.',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((feature, index) => (
                <FadeInSection key={index} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 h-full"
                  >
                    <div className={`text-4xl md:text-5xl mb-3 md:mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2 md:mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{feature.description}</p>
                  </motion.div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </ParallaxSection>
      </section>

      {/* How It Works Section */}
      <section className="relative py-16 md:py-32 px-4 bg-white/40 backdrop-blur-sm overflow-hidden">
        {/* Section Background with Parallax - consistent colors */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, 300]),
            background: 'linear-gradient(90deg, rgba(251,113,133,0.1) 0%, transparent 50%, rgba(192,132,252,0.1) 100%)',
          }}
        />
        <motion.div
          className="absolute top-0 left-0 w-full h-full opacity-15"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, -150]),
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(236,72,153,0.04) 10px, rgba(236,72,153,0.04) 20px)',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInSection>
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                How It Works
              </h2>
              <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto px-4">
                Creating beautiful letters is simple and intuitive
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 relative">
            {/* Connection lines between steps */}
            <svg className="absolute top-10 left-0 right-0 h-20 hidden md:block pointer-events-none z-0">
              <motion.path
                d="M 10% 50 L 90% 50"
                stroke="url(#gradient)"
                strokeWidth="3"
                fill="none"
                strokeDasharray="5,5"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.4 }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(236,72,153,0.5)" />
                  <stop offset="50%" stopColor="rgba(251,113,133,0.5)" />
                  <stop offset="100%" stopColor="rgba(168,85,247,0.5)" />
                </linearGradient>
              </defs>
            </svg>
            {[
              { step: '1', title: 'Sign Up', description: 'Create your free account in seconds' },
              { step: '2', title: 'Create', description: 'Write your letter with our beautiful editor' },
              { step: '3', title: 'Customize', description: 'Add games, dates, and special touches' },
              { step: '4', title: 'Share', description: 'Send your letter to your loved one' }
            ].map((item, index) => (
              <FadeInSection key={index} delay={index * 0.15}>
                <div className="text-center relative z-10">
                  {/* Animated connection dots */}
                  {index < 3 && (
                    <motion.div
                      className="absolute top-10 right-0 w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hidden md:block"
                      style={{ right: '-2rem' }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.7] }}
                      viewport={{ once: true }}
                      transition={{ 
                        duration: 1, 
                        delay: index * 0.3 + 1,
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg relative z-10"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15,
                      delay: index * 0.2 
                    }}
                  >
                    {item.step}
                    {/* Pulse effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.3,
                      }}
                    />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm md:text-base">{item.description}</p>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-16 md:py-32 px-4 overflow-hidden">
        {/* Section Background with Parallax - consistent colors */}
        <motion.div
          className="absolute inset-0 opacity-18"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, 250]),
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(236,72,153,0.08), rgba(168,85,247,0.08), rgba(251,113,133,0.08), rgba(236,72,153,0.08))',
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, -200]),
            background: 'radial-gradient(circle, rgba(244,63,94,0.12), transparent 70%)',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <FadeInSection>
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 md:mb-4 px-4">
                Loved by Many
              </h2>
              <p className="text-gray-600 text-base md:text-xl max-w-2xl mx-auto px-4">
                See what people are saying about Dearly
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: 'Sarah M.',
                text: 'Dearly helped me express my feelings in a way I never could before. The beautiful templates and interactive features made my letter truly special.',
                rating: 5
              },
              {
                name: 'James L.',
                text: 'I created a letter for my anniversary and my partner was absolutely amazed. The games and surprises made it unforgettable!',
                rating: 5
              },
              {
                name: 'Emma K.',
                text: 'The ease of use and beautiful design make Dearly perfect for anyone who wants to share their heart. Highly recommend!',
                rating: 5
              }
            ].map((testimonial, index) => (
              <FadeInSection key={index} delay={index * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 h-full"
                >
                  <div className="flex mb-3 md:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg md:text-xl">⭐</span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 md:mb-6 italic leading-relaxed text-sm md:text-base">"{testimonial.text}"</p>
                  <p className="text-gray-800 font-semibold text-sm md:text-base">— {testimonial.name}</p>
                </motion.div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section ref={ctaRef} className="relative py-16 md:py-32 px-4 overflow-hidden">
        {/* Section Background with Parallax - consistent colors */}
        <motion.div
          className="absolute inset-0 opacity-25"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, -300]),
            background: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(251,113,133,0.15) 100%)',
          }}
        />
        {/* Animated moving overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'linear-gradient(45deg, rgba(236,72,153,0.2), rgba(168,85,247,0.2), rgba(251,113,133,0.2))',
            backgroundSize: '200% 200%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, 400]),
            background: 'radial-gradient(circle, rgba(236,72,153,0.2), transparent)',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-48 h-48 md:w-96 md:h-96 rounded-full blur-3xl"
          style={{
            y: useTransform(scrollY, [0, 3000], [0, -350]),
            background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <ParallaxSection ref={ctaRef} speed={-0.4}>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <FadeInSection>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 shadow-2xl"
              >
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-4 md:mb-6 px-2">
                  Ready to Express Your Heart?
                </h2>
                <p className="text-white/90 text-base md:text-xl mb-6 md:mb-10 max-w-2xl mx-auto px-2">
                  Join thousands of people who are already creating beautiful letters and sharing love with Dearly.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignIn}
                  className="px-8 md:px-12 py-3 md:py-5 bg-white text-rose-600 rounded-lg font-bold text-base md:text-xl hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl w-full sm:w-auto"
                >
                  Get Started Free
                </motion.button>
              </motion.div>
            </FadeInSection>
          </div>
        </ParallaxSection>
      </section>

      {/* Footer */}
      <footer className="relative py-12 md:py-16 px-4 bg-white/60 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl font-serif font-bold bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-3 md:mb-4"
            >
              Dearly
            </motion.h3>
            <p className="text-gray-500 font-serif text-xs md:text-sm italic">
              Made with 💕 by Elgen for Faith
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
