import { useForm } from 'react-hook-form';
import { useState, ChangeEvent } from 'react';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  ImagePreview,
  SubmitButton,
} from '../../styles/ProductFormStyles';

import { UpdateProductData } from '../../types/product';

interface UpdateProductFormData {
  price: string;
  itemsInStock: string;
  image?: FileList;
}

interface UpdateProductFormProps {
  onSubmit: (data: UpdateProductData) => Promise<void>;
  isLoading?: boolean;
  initialData: {
    price: string;
    itemsInStock: string;
    image?: string;
  };
}

const UpdateProductForm = ({
  onSubmit,
  isLoading = false,
  initialData,
}: UpdateProductFormProps): React.ReactElement => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );

  const initialValues: UpdateProductFormData = {
    price: initialData.price,
    itemsInStock: initialData.itemsInStock,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProductFormData>({
    defaultValues: initialValues,
  });

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit((formData: UpdateProductFormData) => {
      const editableData: UpdateProductData = {
        price: Number(formData.price),
        itemsInStock: Number(formData.itemsInStock),
        ...(formData.image?.[0] && { image: formData.image }),
      };
      return onSubmit(editableData);
    })(e);
  };

  return (
    <FormContainer onSubmit={handleFormSubmit}>
      <FormGroup>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          step="0.01"
          {...register('price', { required: 'Price is required' })}
        />
        {errors.price && <ErrorMessage>{errors.price.message}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="itemsInStock">Items in Stock</Label>
        <Input
          type="number"
          id="itemsInStock"
          {...register('itemsInStock', {
            required: 'Stock quantity is required',
          })}
        />
        {errors.itemsInStock && (
          <ErrorMessage>{errors.itemsInStock.message}</ErrorMessage>
        )}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="image">Product Image</Label>
        <Input
          type="file"
          id="image"
          accept="image/*"
          {...register('image')}
          onChange={handleImageChange}
        />
        {errors.image && <ErrorMessage>{errors.image.message}</ErrorMessage>}
        {imagePreview && <ImagePreview src={imagePreview} alt="Preview" />}
      </FormGroup>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Product'}
      </SubmitButton>
    </FormContainer>
  );
};

export default UpdateProductForm;
