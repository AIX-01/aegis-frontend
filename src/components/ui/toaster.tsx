import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  const handleClick = (eventId?: string) => {
    if (eventId) {
      window.dispatchEvent(new CustomEvent('aegis:open-event-modal', { detail: { eventId } }));
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, eventId, onClick, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            onClick={() => {
              if (onClick) onClick();
              else handleClick(eventId);
            }}
            className={eventId ? 'cursor-pointer' : ''}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
