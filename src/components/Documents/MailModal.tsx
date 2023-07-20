import { Dialog } from '@headlessui/react';
import React, { useState } from 'react';

interface Props{
    showMailModal: boolean;
    setShowMailModal: (value: boolean) => void;
}

const MailModal: React.FC<Props> = ({ showMailModal, setShowMailModal }) => {
  const [mailConfirmationisOpen, setMailConfirmationIsOpen] = useState(false);

  return (
        <div>
            <Dialog open={showMailModal} onClose={() => setShowMailModal(false)}>
                <Dialog.Panel className="bg-red-500">
                <Dialog.Title className="font-mono">Send application by direct mail?</Dialog.Title>
                <p className="tw-font-mono tw-font-bold">
                    Agreeing to this action will send the application to Team Keep to print and directly mail to the corresponding agency. Your status will be notified in your &quot;My Documents&quot; Page.
                </p>
                <button type="button" onClick={() => setShowMailModal(false)}>Cancel</button>
                <button type="button" className="bg-red-400" onClick={() => { setShowMailModal(false); setMailConfirmationIsOpen(true); }}>Mail</button>
                </Dialog.Panel>
            </Dialog>
            <MailConfirmation showConfirmation={mailConfirmationisOpen} setShowConfirmation={setMailConfirmationIsOpen} />
        </div>
  );
};

interface ConfirmationProps{
    showConfirmation: boolean;
    setShowConfirmation: (value: boolean) => void;
}

const MailConfirmation: React.FC<ConfirmationProps> = ({ showConfirmation, setShowConfirmation }) => (
        <Dialog open={showConfirmation} onClose={() => setShowConfirmation(false)}>
            <Dialog.Panel>
                <Dialog.Title>Sent</Dialog.Title>
                <p>
                    Team Keep has recieved your application!
                </p>

                <button type="button" onClick={() => setShowConfirmation(false)}>Done</button>
            </Dialog.Panel>
        </Dialog>
);

export default MailModal;
