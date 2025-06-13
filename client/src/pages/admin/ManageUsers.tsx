import Row from '../../ui/Row';
import { useSearchParams } from 'react-router-dom';
import Spinner from '../../ui/Spinner';
import useUsersQuery from '../../hooks/useUsersQuery';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import {
  Section,
  UserGrid,
  User,
  RoleLink,
  ClearLink,
  ButtonContainer,
} from '../../styles/ManageUserStyles';
import Image from '../../components/Image';
import { useState } from 'react';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { useDeleteUser } from '../../hooks/useDeleteUser';
import toast from 'react-hot-toast';
import { useBanUser } from '../../hooks/useBanUser';
import { useUnbanUser } from '../../hooks/useUnbanUser';
import { useChangeUserStatus } from '../../hooks/useChangeUserStatus';
import { User as UserType } from '../../types/user';

const ManageUsers = () => {
  const { data: users = [], isUsersLoading, isUsersFetching } = useUsersQuery();

  const [searchParams, setSearchParams] = useSearchParams();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const { deleteUser } = useDeleteUser();
  const { banUser, isLoading: isBanning } = useBanUser();
  const { unbanUser, isLoading: isUnbanning } = useUnbanUser();
  const { changeUserStatus, isLoading: isChangingStatus } =
    useChangeUserStatus();

  if (isUsersLoading || isUsersFetching) {
    return <Spinner />;
  }

  const roleFilter = searchParams.get('role');

  const roles = Array.from(new Set((users || []).map((user) => user.role)));

  const roleElements = roles.map((role) => (
    <RoleLink
      to={`?role=${role}`}
      key={role}
      className={roleFilter === role ? 'selected' : ''}
    >
      {role}
    </RoleLink>
  ));

  const handleButtonClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const button = (event.target as HTMLElement).closest('button');

    if (!button) return;

    const userId = button.dataset.id;
    if (!userId) return;

    if (button.classList.contains('delete')) {
      const userToDelete = users.find((user) => user._id === userId);
      if (userToDelete) {
        setUserToDelete(userToDelete);
      }
      return;
    }

    if (button.classList.contains('update')) {
      setEditingUserId(editingUserId === userId ? null : userId);
      return;
    }

    const handleAction = async () => {
      try {
        if (
          button.classList.contains('promote') ||
          button.classList.contains('demote')
        ) {
          const response = await changeUserStatus(userId);
          toast.success(response.message);
        } else if (button.classList.contains('ban')) {
          const response = await banUser(userId);
          toast.success(response.message);
        } else if (button.classList.contains('unban')) {
          const response = await unbanUser(userId);
          toast.success(response.message);
        }

        setEditingUserId(null);
      } catch (err) {
        const error = err as { message?: string };
        toast.error(error.message || 'An error occurred');
      }
    };

    void handleAction();
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await deleteUser(userToDelete._id);
      toast.success(response.message);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'An error occurred');
    } finally {
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setUserToDelete(null);
  };

  const filteredUsers = roleFilter
    ? (users || []).filter((user) => user.role === roleFilter)
    : users || [];

  const userElements = filteredUsers.map((user) => (
    <User key={user._id} $isBanned={user.is_banned}>
      <Image src={user.image || ''} alt={user.name} />
      <h2>{user.name}</h2>
      <p className="email">{user.email}</p>
      <p className="phone">{user.phone}</p>
      <p className="role">{user.role}</p>
      <p className="banned">{user.is_banned ? 'Banned' : 'Active'}</p>
      <p className="id">ID: {user._id}</p>

      <ButtonContainer>
        <button className="update" data-id={user._id}>
          <HiOutlinePencilSquare />
        </button>
        <button className="delete" data-id={user._id}>
          <HiOutlineTrash />
        </button>
        {editingUserId === user._id && (
          <>
            {user.role === 'user' && (
              <button
                className="promote"
                data-id={user._id}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? 'Promoting...' : 'Promote'}
              </button>
            )}
            {user.role === 'admin' && (
              <button
                className="demote"
                data-id={user._id}
                disabled={isChangingStatus}
              >
                {isChangingStatus ? 'Demoting...' : 'Demote'}
              </button>
            )}
            <button
              className={user.is_banned ? 'unban' : 'ban'}
              data-id={user._id}
              disabled={isBanning || isUnbanning}
            >
              {user.is_banned
                ? isUnbanning
                  ? 'Unbanning...'
                  : 'Unban'
                : isBanning
                  ? 'Banning...'
                  : 'Ban'}
            </button>
          </>
        )}
      </ButtonContainer>
    </User>
  ));

  return (
    <Section data-testid="manage-users-page">
      <Row type="horizontal">
        {roleElements}
        {roleFilter && (
          <ClearLink onClick={() => setSearchParams({})}>
            Clear filters
          </ClearLink>
        )}
      </Row>
      <UserGrid onClick={handleButtonClick}>{userElements}</UserGrid>

      {userToDelete && (
        <DeleteConfirmation
          onConfirm={() => void handleConfirmDelete()}
          onCancel={handleCancelDelete}
          resourceName="User"
        />
      )}
    </Section>
  );
};

export default ManageUsers;
