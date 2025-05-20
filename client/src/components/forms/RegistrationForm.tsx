import { useForm } from 'react-hook-form';
import { useState, ChangeEvent } from 'react';
import { Input, SubmitButton, InputGroup } from '../../styles/RegisterStyles';
import Form from '../../ui/Form';
import FormRow from '../../ui/FormRow';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ImagePreview } from '../../styles/ProductFormStyles';

const registrationSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    image: z.instanceof(FileList).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isRegistering: boolean;
}

const RegistrationForm = ({
  onSubmit,
  isRegistering,
}: RegistrationFormProps): React.ReactElement => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    setFileError(null);

    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        setFileError('Image file is larger than 2MB');
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setFileError(
          'Invalid file type. Only JPEG, PNG, and JPG files are allowed.'
        );
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (
    data: RegistrationFormData
  ): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('phone', data.phone);

      if (data.image?.[0]) {
        formData.append('image', data.image[0]);
      }

      await onSubmit(formData);
      reset();
      setImagePreview(null);
      setFileError(null);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };

  const onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(handleFormSubmit)(e);
  };

  return (
    <Form onSubmit={onSubmitForm} data-testid="registration-form">
      <FormRow>
        <InputGroup>
          <Input
            id="name"
            {...register('name')}
            placeholder="Full Name"
            type="text"
          />
          {errors.name && <span>{errors.name.message}</span>}
        </InputGroup>
      </FormRow>
      <FormRow>
        <InputGroup>
          <Input
            id="email"
            placeholder="Email Address"
            {...register('email')}
            type="email"
          />
          {errors.email && <span>{errors.email.message}</span>}
        </InputGroup>
      </FormRow>
      <FormRow>
        <InputGroup>
          <Input
            id="password"
            {...register('password')}
            placeholder="Password"
            type="password"
          />
          {errors.password && <span>{errors.password.message}</span>}
        </InputGroup>
      </FormRow>
      <FormRow>
        <InputGroup>
          <Input
            id="confirmPassword"
            placeholder="Confirm Password"
            {...register('confirmPassword')}
            type="password"
          />
          {errors.confirmPassword && (
            <span>{errors.confirmPassword.message}</span>
          )}
        </InputGroup>
      </FormRow>
      <FormRow>
        <InputGroup>
          <Input
            id="phone"
            placeholder="Phone Number"
            {...register('phone')}
            type="tel"
          />
          {errors.phone && <span>{errors.phone.message}</span>}
        </InputGroup>
      </FormRow>
      <FormRow>
        <InputGroup>
          <Input
            data-testid="image-input-group"
            id="image"
            {...register('image', {
              onChange: handleImageChange,
            })}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
          />
          {(errors.image || fileError) && (
            <span data-testid="file-error">
              {errors.image ? errors.image.message : fileError}
            </span>
          )}
          {imagePreview && <ImagePreview src={imagePreview} alt="Preview" />}
        </InputGroup>
      </FormRow>
      <SubmitButton type="submit" disabled={isRegistering}>
        {isRegistering ? 'Creating Account...' : 'Register'}
      </SubmitButton>
    </Form>
  );
};

export default RegistrationForm;
