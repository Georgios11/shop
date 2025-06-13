import { toast } from 'react-hot-toast';
import CreateProductForm from '../../components/forms/CreateProductForm';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import { CreateProductData } from '../../types/product';

const AdminProduct = (): React.ReactElement => {
  const { createProduct, isLoading } = useCreateProduct();

  const handleSubmit = async (
    productData: CreateProductData
  ): Promise<void> => {
    try {
      await createProduct(productData);
      toast.success('Product created successfully');
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  return (
    <div data-testid="create-product-page">
      <h2 className="text-2xl font-semibold mb-6">Create New Product</h2>
      <CreateProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};

export default AdminProduct;
