import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
}

export default function Modal({ title, onClose, children, footer }: ModalProps) {
    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}
