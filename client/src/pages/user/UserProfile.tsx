import useCurrentUser from '../../hooks/useCurrentUser';
import { useDeleteAccount } from '../../hooks/useDeleteAccount';
import {
  ProfileContainer,
  ProfileCard,
  ImageContainer,
  ProfileImage,
  ProfileTitle,
  InfoContainer,
  InfoItem,
  InfoLabel,
  InfoValue,
  DefaultAvatar,
  DeleteButton,
  EditButton,
} from '../../styles/UserProfileStyles';
import { FaTrashAlt } from 'react-icons/fa';
import { useState } from 'react';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ButtonContainer from '../../ui/ButtonContainer';
import { HiOutlinePencilSquare } from 'react-icons/hi2';
import useUpdateUser from '../../hooks/useUpdateUser';
import UpdateUserForm from '../../components/forms/UpdateUserForm';
import { CurrentUser } from '../../types/user';

interface ProfileContentProps {
  currentUser: CurrentUser;
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
  onSubmit: (formData: FormData, hasPasswordChange: boolean) => void;
  isUpdating: boolean;
  onCancelEdit: () => void;
}

const ProfileContent = ({
  currentUser,
  onDelete,
  onEdit,
  isEditing,
  onSubmit,
  isUpdating,
  onCancelEdit,
}: ProfileContentProps) => {
  return (
    <ProfileCard style={{ position: 'relative' }}>
      <ImageContainer>
        {currentUser.image ? (
          <ProfileImage src={currentUser.image} alt={currentUser.name} />
        ) : (
          <DefaultAvatar>
            {currentUser.name.charAt(0).toUpperCase()}
          </DefaultAvatar>
        )}
        <ProfileTitle>
          {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}{' '}
          Profile
        </ProfileTitle>
      </ImageContainer>

      <InfoContainer>
        <InfoItem>
          <InfoLabel>Name:</InfoLabel>
          <InfoValue>{currentUser.name}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Email:</InfoLabel>
          <InfoValue>{currentUser.email}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Phone:</InfoLabel>
          <InfoValue>{currentUser.phone || 'Not provided'}</InfoValue>
        </InfoItem>
        <ButtonContainer>
          <DeleteButton onClick={onDelete}>
            <FaTrashAlt size={20} />
          </DeleteButton>
          <EditButton onClick={onEdit}>
            <HiOutlinePencilSquare />
          </EditButton>
        </ButtonContainer>
      </InfoContainer>

      {isEditing && (
        <UpdateUserForm
          onSubmit={onSubmit}
          isUpdating={isUpdating}
          onCancel={onCancelEdit}
          currentUser={currentUser}
        />
      )}
    </ProfileCard>
  );
};

const UserProfile = () => {
  const currentUser = useCurrentUser();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { deleteAccount } = useDeleteAccount();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { updateUser, isUpdating } = useUpdateUser();

  const handleDelete = async () => {
    try {
      const response = await deleteAccount();
      toast.success(response.message);
      void navigate('/');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to delete account');
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    void handleDelete();
  };

  const handleSubmit = (
    formData: FormData,
    hasPasswordChange: boolean
  ): void => {
    void (async () => {
      try {
        const response = await updateUser(formData);
        toast.success(response.message);
        setIsEditing(false);

        if (hasPasswordChange) {
          void navigate('/login');
        }
      } catch (err) {
        const error = err as { message?: string };
        toast.error(error.message || 'Failed to update profile');
      }
    })();
  };

  return (
    <ProfileContainer data-testid="user-profile-page">
      {currentUser ? (
        <ProfileContent
          currentUser={currentUser}
          onDelete={() => setShowConfirmation(true)}
          onEdit={() => setIsEditing(true)}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          isUpdating={isUpdating}
          onCancelEdit={() => setIsEditing(false)}
        />
      ) : (
        <ProfileCard>
          <ProfileTitle>User Profile Not Found</ProfileTitle>
        </ProfileCard>
      )}

      {showConfirmation && (
        <DeleteConfirmation
          resourceName="Account"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </ProfileContainer>
  );
};

export default UserProfile;
