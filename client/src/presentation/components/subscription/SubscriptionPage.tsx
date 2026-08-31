import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, type Variants } from 'framer-motion';
import { Check, Sparkles, Zap, Star } from 'lucide-react';

/* ─── Tilt Card Wrapper ─────────────────────────────────────────── */
function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 900, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Floating Particle ─────────────────────────────────────────── */
function FloatingParticle({ delay, x, size, color }: { delay: number; x: string; size: number; color: string }) {
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: x,
        bottom: '-10px',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: 'blur(1px)',
        pointerEvents: 'none',
        zIndex: 0
      }}
      animate={{
        y: [0, -120, -240],
        opacity: [0, 0.7, 0],
        scale: [0.5, 1, 0.3],
        x: [0, Math.random() > 0.5 ? 20 : -20, 0]
      }}
      transition={{
        duration: 3.5 + delay,
        delay,
        repeat: Infinity,
        ease: 'easeOut'
      }}
    />
  );
}

export default function SubscriptionPage() {
  const plans = [
    {
      name: 'Ücretsiz',
      price: '0 ₺',
      period: '/ ay',
      description: 'Tıp fakültesine yeni başlayanlar için temel özellikler.',
      features: [
        'Ayda 5 Vaka Çözümü',
        'Temel Branşlara Erişim',
        'Topluluk Liderlik Tablosu'
      ],
      buttonText: 'Mevcut Planınız',
      isPrimary: false,
      gradient: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%)',
      borderColor: 'rgba(99,102,241,0.25)',
      glowColor: 'rgba(99, 102, 241, 0.18)',
      accentColor: '#818cf8',
      icon: <Star size={22} color="#818cf8" />,
      particles: [
        { x: '15%', delay: 0, size: 5, color: 'rgba(129,140,248,0.6)' },
        { x: '55%', delay: 1.2, size: 4, color: 'rgba(168,85,247,0.5)' },
        { x: '80%', delay: 2.4, size: 6, color: 'rgba(99,102,241,0.55)' },
      ]
    },
    {
      name: 'Pro Öğrenci',
      price: '99 ₺',
      period: '/ ay',
      description: 'Sınavlarına ve komitelere hazırlanan tıp öğrencileri için ideal.',
      features: [
        'Sınırsız Vaka Çözümü',
        'Tüm Dönem ve Branşlara Erişim',
        'Öncelikli Yapay Zeka Hızı',
        'Detaylı Gelişim Analitiği'
      ],
      buttonText: "Premium'a Geç",
      isPrimary: true,
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.08) 100%)',
      borderColor: 'rgba(245,158,11,0.4)',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      accentColor: '#f59e0b',
      icon: <Zap size={22} color="#f59e0b" />,
      particles: [
        { x: '10%', delay: 0.5, size: 6, color: 'rgba(245,158,11,0.65)' },
        { x: '40%', delay: 1.8, size: 4, color: 'rgba(251,191,36,0.55)' },
        { x: '70%', delay: 0.2, size: 7, color: 'rgba(239,68,68,0.45)' },
        { x: '90%', delay: 2.8, size: 5, color: 'rgba(245,158,11,0.6)' },
      ]
    }
  ];

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.18 } }
  };
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 60, scale: 0.92 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
  };

  return (
    <div className="subscription-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background blobs */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.4, 0.25] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-80px', left: '-80px',
          width: '340px', height: '340px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '280px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0
        }}
      />

      <div className="subscription-header" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h1 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="subscription-title"
        >
          Kariyerinize <span className="highlight">Seviye Atlatın</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="subscription-subtitle"
        >
          Sınırları kaldırın, sınırsız simülasyonla daha iyi bir hekim olun.
        </motion.p>

        {/* Free banner */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5)' }}
          style={{
            marginTop: '2rem',
            padding: '1.25rem 2rem',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            border: 'none',
            borderRadius: '16px',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.15rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Shimmer */}
          <motion.span
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              transform: 'translateX(-100%)'
            }}
            animate={{ transform: ['translateX(-100%)', 'translateX(200%)'] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2.5, ease: 'easeInOut' }}
          />
          <motion.span
            animate={{ rotate: [0, 15, -10, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles size={20} />
          </motion.span>
          🎉 Şimdilik abonelik sistemimiz bulunmamaktadır. Tüm özellikler tamamen ücretsiz yayındadır!
        </motion.div>
      </div>

      <motion.div
        className="pricing-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ position: 'relative', zIndex: 1 }}
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            variants={cardVariants}
          >
            <TiltCard
              className={`pricing-card ${plan.isPrimary ? 'primary' : ''}`}
              style={{
                background: plan.gradient,
                border: `1px solid ${plan.borderColor}`,
                boxShadow: `0 8px 32px ${plan.glowColor}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Floating particles inside card */}
              {plan.particles.map((p, i) => (
                <FloatingParticle key={i} {...p} />
              ))}

              {/* Corner glow */}
              <div style={{
                position: 'absolute', top: '-40px', right: '-40px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: `radial-gradient(circle, ${plan.glowColor} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />

              {plan.isPrimary && (
                <motion.div
                  className="popular-badge"
                  animate={{ boxShadow: ['0 0 0px rgba(245,158,11,0)', '0 0 12px rgba(245,158,11,0.6)', '0 0 0px rgba(245,158,11,0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  En Çok Tercih Edilen
                </motion.div>
              )}

              {/* Icon */}
              <motion.div
                style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.18, type: 'spring' }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                >
                  {plan.icon}
                </motion.div>
              </motion.div>

              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <motion.span
                  className="price-amount"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.15, type: 'spring', stiffness: 200 }}
                >
                  {plan.price}
                </motion.span>
                <span className="price-period">{plan.period}</span>
              </div>
              <p className="plan-desc">{plan.description}</p>
              
              <ul className="plan-features">
                {plan.features.map((feature, fi) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.15 + fi * 0.07 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <Check size={16} color={plan.accentColor} strokeWidth={3} style={{ flexShrink: 0 }} />
                    </motion.div>
                    {feature}
                  </motion.li>
                ))}
              </ul>

              <motion.button
                className={`plan-btn ${plan.isPrimary ? 'btn-primary-large' : 'btn-secondary-large'}`}
                whileHover={{ scale: 1.04, boxShadow: plan.isPrimary ? '0 6px 24px rgba(245,158,11,0.45)' : '0 6px 20px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.97 }}
                style={{ position: 'relative', overflow: 'hidden' }}
              >
                {/* Shimmer on hover */}
                <motion.span
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    transform: 'translateX(-100%)',
                    pointerEvents: 'none'
                  }}
                  whileHover={{ transform: 'translateX(200%)' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
                {plan.buttonText}
              </motion.button>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
