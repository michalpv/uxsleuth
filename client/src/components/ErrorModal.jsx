import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'

function ErrorModal(props) {
  const { message, showError, closeError, ...rest } = props;
  return (
    <Modal isOpen={showError} onClose={closeError}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign='center'>Error</ModalHeader>
        <ModalBody textAlign='center'>
          {message}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default ErrorModal;
