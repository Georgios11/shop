import { useNavigate, useParams, useLocation } from 'react-router-dom';
import useProductsCache from '../../hooks/useProductsCache';
import { HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2';
import useDeleteProduct from '../../hooks/useDeleteProduct';
import toast from 'react-hot-toast';
import Heading from '../../ui/Heading';
import {
  PageContainer,
  ProductContainer,
  ProductImage,
  ProductDetails,
  ProductTitle,
  ProductDescription,
  ProductPrice,
  ProductStock,
  BackLink,
  EditFormContainer,
} from '../../styles/SingleProductAdminStyles';
import DeleteConfirmation from '../../components/DeleteConfirmation';
import { useState, useEffect } from 'react';
import ButtonContainer from '../../ui/ButtonContainer';
import UpdateProductForm from '../../components/forms/UpdateProductForm';
import useUpdateProduct from '../../hooks/useUpdateProduct';
import { Product } from '../../types/product';

export interface UpdateProductData {
  price?: number;
  itemsInStock?: number;
  image?: FileList; // or File, depending on your upload logic
}

const SingleProductAdmin = () => {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const { filter } = (location.state as { filter?: string }) || {};
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { products } = useProductsCache();
  const { isDeleting, deleteProduct } = useDeleteProduct();
  const typedProducts = products;
  const product = typedProducts.find(
    (product) => product._id === productId
  ) as Product;
  const { updateProduct, isUpdating } = useUpdateProduct(productId || '');

  useEffect(() => {
    if (!product && !isDeleting) {
      void navigate(`/admin/products${filter ? `?category=${filter}` : ''}`);
    }
  }, [product, isDeleting, navigate, filter]);

  if (!product || !productId) return null;

  const deleteHandler = async (productId: string) => {
    try {
      void navigate('/admin/products' + (filter ? `?category=${filter}` : ''));

      const { message } = await deleteProduct(productId);
      toast.success(message);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to delete the product.');
      void navigate(`/admin/products/${productId}`);
    }
  };

  const handleEdit = async (data: UpdateProductData) => {
    try {
      setIsEditing(false);

      const productData: UpdateProductData = {
        ...(data.price !== undefined && { price: Number(data.price) }),
        ...(data.itemsInStock !== undefined && {
          itemsInStock: Number(data.itemsInStock),
        }),
        ...(data.image && { image: data.image }),
      };

      const { message } = await updateProduct(productData);
      toast.success(message);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error.message || 'Failed to update the product.');
      setIsEditing(true);
    }
  };

  return (
    <PageContainer data-testid="single-product-admin-page">
      <BackLink to={filter ? `..?category=${filter}` : '..'} relative="path">
        <Heading as="h3">
          back to {filter ? `${filter} products` : 'all products'}
        </Heading>
      </BackLink>
      <ProductContainer>
        <ProductImage src={product.image} alt={product.name} />
        <ProductDetails>
          <ProductTitle>{product.name}</ProductTitle>
          <p>Brand: {product.brand}</p>
          <ProductDescription>{product.description}</ProductDescription>
          <ProductPrice>${product.price}</ProductPrice>
          <ProductStock $inStock={product.itemsInStock}>
            {product.itemsInStock > 0
              ? `${product.itemsInStock} in stock`
              : 'Out of stock'}
          </ProductStock>

          <p>Category: {product.category.name}</p>
          {Array.isArray(product.favoritedBy) &&
            product.favoritedBy.length > 0 && (
              <p className="likes">
                ❤️ {product.favoritedBy.length}
                {product.favoritedBy.length === 1 ? ' like' : ' likes'}
              </p>
            )}
        </ProductDetails>
        <ButtonContainer>
          <button className="update" onClick={() => setIsEditing(!isEditing)}>
            <HiOutlinePencilSquare />
          </button>
          <button
            className="delete"
            disabled={isDeleting}
            onClick={() => setShowDeleteModal(true)}
          >
            <HiOutlineTrash />
          </button>
        </ButtonContainer>
      </ProductContainer>

      {isEditing && (
        <EditFormContainer>
          <UpdateProductForm
            onSubmit={handleEdit}
            isLoading={isUpdating}
            initialData={{
              price: product.price.toString(),
              itemsInStock: product.itemsInStock.toString(),
              image: undefined,
            }}
          />
        </EditFormContainer>
      )}

      {showDeleteModal && (
        <DeleteConfirmation
          resourceName="Product"
          onConfirm={() => void deleteHandler(productId)}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </PageContainer>
  );
};

export default SingleProductAdmin;
