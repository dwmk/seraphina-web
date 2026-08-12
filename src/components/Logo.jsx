export function Logo({ size = 40, className = '', variant = 1 }) {
  const src = variant === 1 ? '/seraphina1.png' : '/seraphina2.png';
  return (
    <img
      src={src}
      alt="Seraphina"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
}
