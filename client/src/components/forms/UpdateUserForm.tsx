import { useForm } from 'react-hook-form';
import Form from '../../ui/Form';
import FormRow from '../../ui/FormRow';
import Input from '../../ui/Input';
import ButtonText from '../../ui/ButtonText';
import ButtonContainer from '../../ui/ButtonContainer';
import { User } from '../../types/user';

interface UpdateUserFormData {
  oldPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
  phone?: string;
  image?: FileList;
}

interface UpdateUserFormProps {
  onSubmit: (formData: FormData, hasPasswordChange: boolean) => void;
  isUpdating: boolean;
  onCancel: () => void;
  currentUser: User;
}

const UpdateUserForm = ({
  onSubmit,
  isUpdating,
  onCancel,
  currentUser,
}: UpdateUserFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<UpdateUserFormData>({
    defaultValues: {
      phone: currentUser.phone || '',
    },
  });

  const newPassword = watch('newPassword');

  const handleFormSubmit = (data: UpdateUserFormData): void => {
    const formData = new FormData();
    const hasPasswordChange = Boolean(data.oldPassword && data.newPassword);

    if (data.oldPassword) formData.append('oldPassword', data.oldPassword);
    if (data.newPassword) formData.append('newPassword', data.newPassword);
    if (data.confirmNewPassword)
      formData.append('confirmNewPassword', data.confirmNewPassword);
    if (data.phone) formData.append('phone', data.phone);
    if (data.image?.[0]) formData.append('image', data.image[0]);

    void onSubmit(formData, hasPasswordChange);
  };

  const handleFormSubmitWrapper = (
    e: React.FormEvent<HTMLFormElement>
  ): void => {
    void handleSubmit(handleFormSubmit)(e);
  };

  return (
    <Form onSubmit={handleFormSubmitWrapper}>
      <FormRow label="Old Password" error={errors?.oldPassword?.message}>
        <Input
          type="password"
          id="oldPassword"
          disabled={isUpdating}
          {...register('oldPassword')}
        />
      </FormRow>

      <FormRow label="New Password" error={errors?.newPassword?.message}>
        <Input
          type="password"
          id="newPassword"
          disabled={isUpdating}
          {...register('newPassword')}
        />
      </FormRow>

      <FormRow
        label="Confirm New Password"
        error={errors?.confirmNewPassword?.message}
      >
        <Input
          type="password"
          id="confirmNewPassword"
          disabled={isUpdating}
          {...register('confirmNewPassword', {
            validate: (value) =>
              !newPassword || value === newPassword || 'Passwords do not match',
          })}
        />
      </FormRow>

      <FormRow label="Phone" error={errors?.phone?.message}>
        <Input
          type="tel"
          id="phone"
          disabled={isUpdating}
          {...register('phone')}
        />
      </FormRow>

      <FormRow label="Profile Image" error={errors?.image?.message}>
        <Input
          type="file"
          id="image"
          accept="image/*"
          disabled={isUpdating}
          {...register('image')}
        />
      </FormRow>

      <ButtonContainer>
        <ButtonText type="submit" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update'}
        </ButtonText>
        <ButtonText
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
        >
          Cancel
        </ButtonText>
      </ButtonContainer>
    </Form>
  );
};

export default UpdateUserForm;
