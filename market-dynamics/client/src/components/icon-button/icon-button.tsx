import STYLE from './icon-button.module.css';
import { forwardRef } from 'react';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  root: string;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, name, root, ...props }, ref) => {
    return (
      <button ref={ref} className={`${STYLE.button} ${className}`} name={name} {...props}>
        <img src={root} />
      </button>
    );
  }
);

export default IconButton;
