export function Logo({ size = 40, className = '', variant = 1, overflow = false }) {
  const src = variant === 1 ? '/seraphina1.png' : '/seraphina2.png';
  return (
    <img
      src={src}
      alt="Seraphina"
      className={className}
      style={{
        width: overflow ? `${size * 1.05}px` : `${size}px`,
        height: overflow ? `${size * 1.05}px` : `${size}px`,
        objectFit: 'cover',
        objectPosition: 'center top',
      }}
    />
  );
}
