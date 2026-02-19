import { useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth';
import { createDeposit, type CreateInvestResponse } from '@/lib/api';
import { toast } from 'react-toastify';
import { Loader } from './Loader';
import { ModalStrategy, ModalCurrency, currencyToPayCurrency } from './modal';
import { useTranslation } from 'react-i18next';

type DisclaimerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPaymentOrderCreated?: (data: CreateInvestResponse) => void;
  paymenModal?: () => void;
  strategy: ModalStrategy | null;
  currency?: ModalCurrency | null;
  amount: number;
};

export default function DisclaimerModal({
  isOpen,
  onClose,
  onPaymentOrderCreated,
  strategy,
  currency,
  amount,
  paymenModal,
}: DisclaimerModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [agree, setAgree] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 1) {
      setScrolledToBottom(true);
    }
  };

  const handleNext = async () => {
    if (step === 1 && scrolledToBottom) {
      setStep(2);
      setScrolledToBottom(false);
      return;
    }

    if (step === 2 && agree) {
      if (!user) {
        toast.error('User information is missing');
        return;
      }

      if (!strategy?.id) {
        toast.error('Invalid strategy');
        return;
      }

      if (amount < 1) {
        toast.error('Please enter a valid amount.');
        return;
      }

      const token = getToken();
      if (!token) {
        toast.error('Please log in to invest.');
        return;
      }

      setSubmitting(true);
      try {
        const payCurrency = currencyToPayCurrency(currency);
        const paymentData = await createDeposit(token, { amount, payCurrency });
        onPaymentOrderCreated?.(paymentData);
        onClose();
        paymenModal?.();
        // toast.success(t('Order placed – complete payment to create your subscription'));
      } catch (err) {
        const msg =
          err && typeof err === 'object' && 'message' in err
            ? String((err as { message: string }).message)
            : 'Something went wrong';
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 h-full bg-black/60 backdrop-blur-sm"/>

      <div className="relative w-full h-full lg:h-auto max-w-full lg:max-w-105.25 no-scrollbar max-h-full lg:max-h-[96vh] overflow-y-auto lg:max-w-185.5 backdrop-blur-lg rounded-none lg:rounded-[20px] dark:bg-[#111113] border border-[#65656526] dark:border-transparent pt-3 pb-4.5 px-3 animate-fadeIn flex flex-col justify-center lg:block">
        <div className="flex flex-col">
          <div className="relative rounded-[18px] bg-[#1E1E20] pr-5 pl-7.75 lg:pl-10.75 pt-7.25">
            {/* Close button */}
            <button
              onClick={onClose}
              className="w-6.25 h-6.25 flex items-center justify-center bg-[#FFFFFF1A] close z-10 rounded-full absolute right-1.75 top-1.75"
            >
              <Image width={12} height={12} src="/assets/Group 1597884988.svg" alt="" />
            </button>

            <div className="flex flex-col gap-9">
              <h2 className="text-center lg:text-start text-[32px] font-ui font-bold text-white">{t('AlmostThere')}</h2>

              {/* Scrollable content */}
              <div className="h-141.5 custom-scrollbar overflow-y-auto pr-2" ref={scrollRef} onScroll={handleScroll}>
                <p className="text-sm text-center lg:text-start max-w-150 font-normal text-[#FFFFFF99] font-ui">
                  The standard Lorem Ipsum passage, used since the 1500s <br /> "Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                  sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."{' '}
                  <br />
                  Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC "Sed ut perspiciatis
                  unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim
                  ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
                  eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit
                  amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore
                  magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam
                  corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure
                  reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem
                  eum fugiat quo voluptas nulla pariatur?" <br /> 1914 translation by H. Rackham "But I must explain to
                  you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a
                  complete account of the system, and expound the actual teachings of the great explorer of the truth,
                  the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it
                  is pleasure, but because those who do not know how to pursue pleasure rationally encounter
                  consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to
                  obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil
                  and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes
                  laborious physical exercise, except to obtain some advantage from it? But who has any right to find
                  fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids
                  a pain that produces no resultant pleasure?" <br /> Section 1.10.33 of "de Finibus Bonorum et
                  Malorum", written by Cicero in 45 BC "At vero eos et accusamus et iusto odio dignissimos ducimus qui
                  blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi
                  sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi,
                  id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero
                  tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat
                  facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et
                  aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et
                  molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis
                  voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat." 1914
                  translation by H. Rackham "On the other hand, we denounce with righteous indignation and dislike men
                  who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire,
                  that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to
                  those who fail in their duty through weakness of will, which is the same as saying through shrinking
                  from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our
                  power of choice is untrammelled and when nothing prevents our being able to do what we like best,
                  every pleasure is to be welcomed and every pain avoided. But in certain circumstances and owing to the
                  claims of duty or the obligations of business it will frequently occur that pleasures have to be
                  repudiated and annoyances accepted. The wise man therefore always holds in these matters to this
                  principle of selection: he rejects pleasures to secure other greater pleasures, or else he endures
                  pains to avoid worse pains."
                </p>
              </div>
            </div>
          </div>

          {step === 2 && (
            <div className="pt-4.25 flex flex-col gap-[15px] w-full">
              <div className="flex px-2.5 items-start mt-1 gap-5">
                <input
                  type="checkbox"
                  className="custom-checkbox shrink-0"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="text-sm text-[#FFFFFFCC] font-normal font-ui">
                  {t('Iconfirm')}{' '}
                  <span className="text-[#8EDD23]">{t('InformationMem')}</span> {t('andthe')}{' '}
                  <span className="text-[#8EDD23]">{t('SubscriptionAgreement')}</span>, {t('agreetobebound')}
                </span>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-2.75 pt-2">
            <button
              className="h-14.75 w-full text-[#53A7FF] rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui"
              style={{
                background: 'linear-gradient(180deg, rgba(83, 167, 255, 0.2) 0%, rgba(67, 116, 250, 0.2) 100%)',
              }}
            >
              {t('Scrollthrough')}
            </button>

            <button
              onClick={handleNext}
              disabled={(step === 1 && !scrolledToBottom) || (step === 2 && !agree) || submitting}
              className={`h-14.75 w-full text-white rounded-xl flex justify-center items-center gap-3 text-[22px] font-bold font-ui ${(step === 1 && !scrolledToBottom) || (step === 2 && !agree) || submitting
                  ? 'disabled:bg-[#FFFFFF1A] disabled:text-[#FFFFFF80]'
                  : ''
                }`}
              style={{
                background:
                  (step === 1 && !scrolledToBottom) || (step === 2 && !agree) || submitting
                    ? '#FFFFFF1A'
                    : 'linear-gradient(180deg, #53A7FF 0%, #4374FA 100%)',
              }}
            >
              {step === 1 ? 'Next' : submitting ? <Loader className="h-6 w-6 text-white" ariaLabel="Creating subscription" /> : 'Confirm & Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
