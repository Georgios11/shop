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
import { CreateProductData } from '../../types/product';

interface Category {
  _id: string;
  name: string;
}

interface CreateProductFormData {
  name: string;
  description: string;
  brand: string;
  price: string;
  category: string;
  itemsInStock: string;
  image: FileList;
}

interface CreateProductFormProps {
  onSubmit: (data: CreateProductData) => Promise<void>;
  isLoading?: boolean;
}

const CreateProductForm = ({
  onSubmit,
  isLoading = false,
}: CreateProductFormProps): React.ReactElement => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { categories } = useCategoriesCache();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      brand: '',
      price: '',
      category: '',
      itemsInStock: '',
    },
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
    <option key={category._id} value={category._id}>
      {category.name}
    </option>
  ));

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    void handleSubmit((formData: CreateProductFormData) => {
      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category
      );

      if (!selectedCategory) {
        throw new Error('Selected category not found');
      }

      const productData: CreateProductData = {
        name: formData.name,
        description: formData.description,
        brand: formData.brand,
        price: Number(formData.price),
        itemsInStock: Number(formData.itemsInStock),
        category: {
          name: selectedCategory.name,
          id: selectedCategory._id,
        },
        image: formData.image,
      };

      return onSubmit(productData);
    })(e);
  };

  return (
    <FormContainer aria-label="Create Product Form" onSubmit={handleFormSubmit}>
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
        {errors.brand && <ErrorMessage>{errors.brand.message}</ErrorMessage>}
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
          {...register('image', { required: 'Image is required' })}
          onChange={handleImageChange}
        />
        {errors.image && <ErrorMessage>{errors.image.message}</ErrorMessage>}
        {imagePreview && <ImagePreview src={imagePreview} alt="Preview" />}
      </FormGroup>

      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Product'}
      </SubmitButton>
    </FormContainer>
  );
};

export default CreateProductForm;
