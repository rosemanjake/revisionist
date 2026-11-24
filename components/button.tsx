import styles from '@/styles/Button.module.css';

type ButtonVariant = 'basic' | 'topbar' | 'hollow' | 'topbar-hollow';

interface ButtonProps {
  text: string;
  onClick: () => void;
  type?: ButtonVariant;
}

function getButtonClassName(type: ButtonVariant): string {
  switch (type) {
    case 'topbar':
      return styles.topBarButton;
    case 'hollow':
      return styles.hollowButton;
    case 'topbar-hollow':
      return styles.hollowTopBarButton;
    case 'basic':
    default:
      return styles.button;
  }
}

export default function Button({ text, onClick, type = 'basic' }: ButtonProps): JSX.Element {
  return (
    <div className={getButtonClassName(type)} onClick={onClick}>
      {text}
    </div>
  );
}
