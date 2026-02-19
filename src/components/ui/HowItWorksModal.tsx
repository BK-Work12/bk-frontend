import { useTranslation } from "react-i18next";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function HowItWorksModal({ isOpen, onClose }: ModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl rounded-[20px] bg-[#F1F1FE] dark:bg-[#1E1E20] p-5 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-center">{t('HowVarntixWorks')}</h2>

        {/* Video */}
        <div className="aspect-video w-full overflow-hidden rounded-xl">
          <video controls autoPlay className="w-full h-full object-cover">
            <source src="/assets/how-it-works.mp4" type="video/mp4" />
            {t('Yourbrowser')}
          </video>
        </div>
      </div>
    </div>
  );
}
