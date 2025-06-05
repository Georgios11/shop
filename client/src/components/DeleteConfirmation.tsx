import {
  StyledModal,
  Overlay,
  ButtonContainer,
  Button,
} from '../styles/DeleteConfirmationStyles';

interface DeleteConfirmationProps {
  onConfirm: () => void;
  onCancel: () => void;
  resourceName: string;
}

const DeleteConfirmation = ({
  onConfirm,
  onCancel,
  resourceName,
}: DeleteConfirmationProps): React.ReactElement => {
  return (
    <Overlay>
      <StyledModal>
        <h3>Delete {resourceName}</h3>
        <p>
          Are you sure you want to delete this {resourceName.toLowerCase()}?
        </p>
        <p>This action cannot be undone.</p>

        <ButtonContainer>
          <Button className="cancel" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="confirm" onClick={onConfirm}>
            Delete
          </Button>
        </ButtonContainer>
      </StyledModal>
    </Overlay>
  );
};

export default DeleteConfirmation;
