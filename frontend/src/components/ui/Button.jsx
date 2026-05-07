export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  fullWidth = false,
  ...props
}) {
  const className = [
    'btn',
    variant === 'secondary' ? 'btn-secondary' : 'btn-primary',
    fullWidth ? 'w-full' : '',
    props.className ?? '',
  ]
    .join(' ')
    .trim();

  return (
    <button type={type} {...props} className={className}>
      {children}
    </button>
  );
}
