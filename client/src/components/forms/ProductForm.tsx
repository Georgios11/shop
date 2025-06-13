import { useForm } from 'react-hook-form';
import { useState, ChangeEvent } from 'react';
import {
  FormContainer,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  ErrorMessage,
  ImagePreview,
  SubmitButton,
} from '../../styles/ProductFormStyles';
import useCategoriesCache from '../../hooks/useCategoriesCache';

interface Category {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  brand: string;
  price: string;
  category: string;
  itemsInStock: string;
  image?: FileList;
}

interface ProductFormProps {
  onSubmit: (data: Partial<ProductFormData>) => Promise<void>;
  isLoading?: boolean;
  initialData?: {
    name: string;
    description: string;
    brand: string;
    price: string;
    category: {
      name: string;
    };
    itemsInStock: string;
    image?: string;
  } | null;
  isEditing?: boolean;
}

const ProductForm = ({
  onSubmit,
  isLoading = false,
  initialData = null,
  isEditing = false,
}: ProductFormProps): React.ReactElement => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const { categories } = useCategoriesCache();

  const initialValues: ProductFormData =
    isEditing && initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          brand: initialData.brand,
          price: initialData.price,
          category: initialData.category.name,
          itemsInStock: initialData.itemsInStock,
        }
      : {
          name: '',
          description: '',
          brand: '',
          price: '',
          category: '',
          itemsInStock: '',
        };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
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

  const categoryOptions = categories.map((category: Category) => (
    <option key={category._id} value={category.name}>
      {category.name}
    </option>
  ));

  const submitHandler = (formData: ProductFormData): void => {
    if (isEditing) {
      const editableData: Partial<ProductFormData> = {
        price: formData.price,
        itemsInStock: formData.itemsInStock,
        ...(formData.image?.[0] && { image: formData.image }),
      };

      void onSubmit(editableData);
    } else {
      void onSubmit(formData);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit(submitHandler)(e);
  };

  return (
    <FormContainer onSubmit={handleFormSubmit}>
      {!isEditing && (
        <>
          <FormGroup>
            <Label htmlFor="name">Product Name</Label>
            <Input
              type="text"
              id="name"
              {...register('name', {
                required: 'Name is required',
              })}
            />
            {errors.name && <ErrorMessage>{errors.name.message}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              {...register('description', {
                required: 'Description is required',
              })}
            />
            {errors.description && (
              <ErrorMessage>{errors.description.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="brand">Brand</Label>
            <Input
              type="text"
              id="brand"
              {...register('brand', {
                required: 'Brand is required',
              })}
            />
            {errors.brand && (
              <ErrorMessage>{errors.brand.message}</ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">Category</Label>
            <Select
              id="category"
              {...register('category', {
                required: 'Category is required',
              })}
            >
              <option value="">Select a category</option>
              {categoryOptions}
            </Select>
            {errors.category && (
              <ErrorMessage>{errors.category.message}</ErrorMessage>
            )}
          </FormGroup>
        </>
      )}

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
          {...register('image', { required: !initialData?.image })}
          onChange={handleImageChange}
        />
        {errors.image && <ErrorMessage>{errors.image.message}</ErrorMessage>}
        {imagePreview && <ImagePreview src={imagePreview} alt="Preview" />}
      </FormGroup>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading
          ? isEditing
            ? 'Updating...'
            : 'Creating...'
          : isEditing
            ? 'Update Product'
            : 'Create Product'}
      </SubmitButton>
    </FormContainer>
  );
};

export default ProductForm;
